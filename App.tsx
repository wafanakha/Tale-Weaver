import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GameState,
  Item,
  ItemType,
  Player,
  StoryLogEntry,
  Stats,
  StatusEffect,
} from "./types";
import { getNextStoryPart } from "./services/AIService";
import { gameService } from "./services/gameService";
import { useLanguage } from "./i18n";
import PlayerStatsPanel from "./components/PlayerStatsPanel";
import InventoryPanel from "./components/InventoryPanel";
import StoryDisplay from "./components/StoryDisplay";
import ActionInputPanel from "./components/ChoicePanel";
import CombatStatus from "./components/CombatStatus";
import LoadingSpinner from "./components/LoadingSpinner";
import CharacterCreation, {
  CharacterDetails,
} from "./components/CharacterCreation";
import Lobby from "./components/Lobby";
import LoreCodexPanel from "./components/LoreCodexPanel";
import CharacterSheet from "./components/CharacterSheet";
import LevelUpModal, { LevelUpData } from "./components/LevelUpModal";

interface LoadGameScreenProps {
  onJoinGame: (gameId: string) => void;
  onCancel: () => void;
}

const LoadGameScreen: React.FC<LoadGameScreenProps> = ({
  onJoinGame,
  onCancel,
}) => {
  const { t } = useLanguage();
  const [games, setGames] = useState<GameState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const userGames = await gameService.getUserGames();
        setGames(userGames);
      } catch (e) {
        console.error("Failed to load user games", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGames();
  }, []);

  const GameCard: React.FC<{ game: GameState }> = ({ game }) => (
    <button
      onClick={() => onJoinGame(game.gameId)}
      className="w-full border-2 border-stone-400 bg-stone-200/60 p-4 rounded-md shadow-sm text-left transition hover:bg-stone-100/80 hover:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-600"
    >
      <p className="font-bold text-red-900 font-mono tracking-widest">
        {game.gameId}
      </p>
      <p className="text-sm text-stone-700 mt-2">
        {t("players")}:{" "}
        {(game.players || []).map((p) => p.name).join(", ") ||
          t("noPlayersYet")}
      </p>
      <p className="text-xs text-stone-600 mt-1">
        {t("status")}: {game.status}
      </p>
    </button>
  );

  return (
    <div className="min-h-screen w-screen welcome-bg text-stone-800 flex flex-col items-center justify-center p-4">
      {}
      <div className="content-frame relative p-12 sm:p-16 shadow-2xl max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-red-900 mb-6 cinzel text-center">
          {t("loadGame")}
        </h1>

        {isLoading && <LoadingSpinner />}

        {!isLoading && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {games.length > 0 ? (
              games.map((game) => <GameCard key={game.gameId} game={game} />)
            ) : (
              <p className="text-stone-800 italic text-center text-glow">
                {t("noSavedGames")}
              </p>
            )}
          </div>
        )}

        {}
        <div className="mt-8 text-center">
          <button
            onClick={onCancel}
            className="cinzel text-md text-stone-700 hover:text-stone-900 transition underline text-glow"
          >
            {t("back")}
          </button>
        </div>
      </div>
    </div>
  );
};
const App: React.FC = () => {
  const [clientId] = useState(gameService.getClientId());
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const [screen, setScreen] = useState<
    "welcome" | "lobby" | "creation" | "playing" | "load"
  >("welcome");
  const [error, setError] = useState<string | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);

  const processingRef = useRef(false);

  useEffect(() => {
    if (!gameId) return;
    const unsubscribe = gameService.listenToGame(gameId, (state) => {
      setGameState(state);
      if (state?.status === "playing" && screen !== "playing") {
        setScreen("playing");
      }
    });
    return () => unsubscribe();
  }, [gameId, screen]);

  useEffect(() => {
    if (
      !gameState ||
      gameState.hostId !== clientId ||
      !gameState.lastPlayerAction ||
      gameState.isProcessingAI ||
      processingRef.current
    )
      return;

    const processAction = async () => {
      if (processingRef.current) return;
      processingRef.current = true;

      const actionToProcess = { ...gameState.lastPlayerAction! };

      try {
        await gameService.updateGameState(gameState.gameId, {
          isProcessingAI: true,
          lastPlayerAction: null,
          isLoading: true,
        });

        const latestState = await gameService.getGameState(gameState.gameId);
        if (!latestState) throw new Error("Could not fetch latest state");

        const response = await getNextStoryPart(
          latestState,
          actionToProcess.choice,
          language
        );

        const dbState = await gameService.getGameState(gameState.gameId);
        if (!dbState) return;
        const newState: GameState = JSON.parse(JSON.stringify(dbState));

        if (response.player_updates) {
          response.player_updates.forEach((update) => {
            const playerIndex = newState.players.findIndex(
              (p) => p.name === update.playerName
            );
            if (playerIndex > -1) {
              const p = newState.players[playerIndex];
              if (update.hp !== undefined) p.hp = update.hp;
              if (update.xp !== undefined) p.xp = update.xp;
              if (update.maxXp !== undefined) p.maxXp = update.maxXp;

              if (update.level && update.level > p.level) {
                p.level = update.level;
                if (update.maxHp) {
                  const hpInc = update.maxHp - p.maxHp;
                  p.maxHp = update.maxHp;
                  setLevelUpData({
                    playerName: p.name,
                    newLevel: update.level,
                    newMaxHp: p.maxHp,
                    hpIncrease: hpInc,
                  });
                }
              }

              // HANDLE EQUIPMENT DIRECTLY FROM AI
              if (!p.equipment) p.equipment = { weapon: null, armor: null };
              if ((update as any).equipment_weapon)
                p.equipment.weapon = (update as any).equipment_weapon;
              if ((update as any).equipment_armor)
                p.equipment.armor = (update as any).equipment_armor;

              // HANDLE INVENTORY MERGE
              if (!p.inventory) p.inventory = [];
              if (update.inventory_add)
                p.inventory = [...p.inventory, ...update.inventory_add];
              if (update.inventory_remove) {
                p.inventory = p.inventory.filter(
                  (item) => !update.inventory_remove?.includes(item.name)
                );
              }

              if (update.status_effects_add)
                p.statusEffects = [
                  ...(p.statusEffects || []),
                  ...update.status_effects_add,
                ];
            }
          });
        }

        if (response.enemy_update) {
          if (response.enemy_update.is_defeated) {
            newState.currentEnemy = null;
          } else if (response.enemy_update.name) {
            newState.currentEnemy = {
              name: response.enemy_update.name,
              hp: response.enemy_update.hp,
              maxHp: response.enemy_update.maxHp,
              xpValue: response.enemy_update.xpValue || 50,
              isDefeated: false,
            };
          }
        }

        if (!newState.storyLog) newState.storyLog = [];
        const newStoryEntry: StoryLogEntry = {
          speaker: "story",
          text: response.story,
          id: newState.storyLog.length,
        };

        // IMPROVED DICE ROLL PLAYER MAPPING
        if (response.dice_roll) {
          const rollerName = (response.dice_roll as any).rolling_player_name;
          const roller =
            newState.players.find((p) => p.name === rollerName) ||
            newState.players[dbState.currentPlayerIndex];

          newStoryEntry.diceRoll = {
            ...response.dice_roll,
            isRevealed: false,
            rollingPlayerId: roller.id, // Explicitly track WHO is rolling
          };

          // If there's a roll, we stay on that player by default to finish their action
          newState.currentPlayerIndex = newState.players.indexOf(roller);
        }

        if (response.lore_entries) {
          if (!newState.loreCodex) newState.loreCodex = [];
          response.lore_entries.forEach((entry) => {
            if (!newState.loreCodex!.some((e) => e.title === entry.title))
              newState.loreCodex!.push(entry);
          });
        }

        newState.storyLog.push(newStoryEntry);

        newState.choices = response.choices || [];
        const playerCount = newState.players.length;

        // Handle turn increment only if AI explicitly provided it or if there is no pending roll
        if (response.next_player_index !== undefined) {
          newState.currentPlayerIndex =
            response.next_player_index % playerCount;
        } else if (!response.dice_roll) {
          // Only auto-increment if no dice roll is pending
          newState.currentPlayerIndex =
            playerCount > 0
              ? (newState.currentPlayerIndex + 1) % playerCount
              : 0;
        }

        newState.isLoading = false;
        newState.isProcessingAI = false;

        await gameService.updateGameState(newState.gameId, newState);
      } catch (err) {
        console.error("AI DM Processing Error:", err);
        await gameService.updateGameState(gameState.gameId, {
          isProcessingAI: false,
          isLoading: false,
          error: t("storytellerError"),
        });
      } finally {
        processingRef.current = false;
      }
    };

    processAction();
  }, [gameState?.lastPlayerAction, gameState?.hostId, clientId, language, t]);

  const handleCreateGame = async () => {
    try {
      const newGameId = await gameService.createGame(clientId);
      gameService.addUserGame(newGameId);
      setGameId(newGameId);
      setScreen("creation");
    } catch (e) {
      setError(t("failedToCreateGame"));
    }
  };

  const handleJoinGame = async (id: string) => {
    try {
      const gameIdUpper = id.trim().toUpperCase();
      const state = await gameService.getGameState(gameIdUpper);
      if (state) {
        const isPlayerInGame = (state.players || []).some(
          (p) => p.id === clientId
        );
        if (!isPlayerInGame && state.status !== "lobby") {
          setError(t("gameAlreadyStarted"));
          return;
        }
        gameService.addUserGame(gameIdUpper);
        setGameId(gameIdUpper);
        setScreen(
          isPlayerInGame
            ? state.status === "playing"
              ? "playing"
              : "lobby"
            : "creation"
        );
      } else {
        setError(t("gameNotFound"));
      }
    } catch (e) {
      setError(t("failedToJoinGame"));
    }
  };

  const handleCharacterCreate = async (details: CharacterDetails) => {
    if (!gameId) return;
    const newPlayer: Player = {
      id: clientId,
      name: details.name,
      race: details.race,
      class: details.class,
      background: details.background,
      hp: 20 + Math.floor((details.stats.constitution - 10) / 2),
      maxHp: 20 + Math.floor((details.stats.constitution - 10) / 2),
      xp: 0,
      maxXp: 100, // Reduced from 300 to make Level 2 easier to reach
      level: 1,
      speed: details.speed,
      hitDice: details.hitDice,
      stats: details.stats,
      skills: details.skills,
      savingThrows: details.savingThrows,
      combatSkills: details.combatSkills,
      proficiencies: details.proficiencies,
      languages: details.languages,
      inventory: [],
      equipment: { weapon: null, armor: null },
      spellSlots: details.spellSlots,
      statusEffects: [],
      initiativeBonus: 0,
    };
    await gameService.addPlayer(gameId, newPlayer);
    setScreen("lobby");
  };

  const handleStartGame = async () => {
    if (
      !gameId ||
      !gameState ||
      gameState.status === "playing" ||
      gameState.isProcessingAI
    )
      return;
    await gameService.updateGameState(gameId, {
      isLoading: true,
      status: "playing",
    });
    await gameService.postAction(gameId, clientId, t("adventureBegins"));
  };

  const handleActionSubmit = async (action: string) => {
    if (
      !gameId ||
      !gameState ||
      gameState.isLoading ||
      gameState.isProcessingAI
    )
      return;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer?.id !== clientId) return;

    const latestState = await gameService.getGameState(gameId);
    if (!latestState) return;

    const currentLog = latestState.storyLog || [];
    const newLog = {
      speaker: currentPlayer.name,
      text: action,
      id: currentLog.length,
    };

    await gameService.updateGameState(gameId, {
      isLoading: true,
      storyLog: [...(latestState.storyLog || []), newLog],
      lastPlayerAction: { playerId: clientId, choice: action },
    });
  };

  const handleRevealRoll = async (entryId: number) => {
    if (!gameId) return;
    const dbState = await gameService.getGameState(gameId);
    if (!dbState) return;

    const currentLog = dbState.storyLog || [];
    const newLog = [...currentLog];
    const idx = newLog.findIndex((e) => e.id === entryId);
    if (idx === -1 || !newLog[idx].diceRoll) return;

    newLog[idx].diceRoll = { ...newLog[idx].diceRoll!, isRevealed: true };
    await gameService.updateGameState(gameId, { storyLog: newLog });
  };

  const handleEquipItem = async (itemToEquip: Item) => {
    if (!gameId || !gameState) return;
    const dbState = await gameService.getGameState(gameId);
    if (!dbState) return;

    const playersList = [...dbState.players];
    const pIdx = playersList.findIndex((p) => p.id === clientId);
    if (pIdx === -1) return;

    const player = { ...playersList[pIdx] };
    const currentlyEquipped =
      itemToEquip.type === ItemType.WEAPON
        ? player.equipment?.weapon
        : player.equipment?.armor;

    if (currentlyEquipped)
      player.inventory = [...(player.inventory || []), currentlyEquipped];
    player.inventory = (player.inventory || []).filter(
      (item) => item.name !== itemToEquip.name
    );

    if (!player.equipment) player.equipment = { weapon: null, armor: null };
    if (itemToEquip.type === ItemType.WEAPON)
      player.equipment.weapon = itemToEquip;
    if (itemToEquip.type === ItemType.ARMOR)
      player.equipment.armor = itemToEquip;

    playersList[pIdx] = player;
    const currentLog = dbState.storyLog || [];
    const storyLog = [
      ...currentLog,
      {
        speaker: "system",
        text: t("playerEquippedItem", {
          playerName: player.name,
          itemName: itemToEquip.name,
        }),
        id: currentLog.length,
      },
    ];

    await gameService.updateGameState(gameId, {
      players: playersList,
      storyLog,
    });
  };

  const LanguageSelector = () => (
    <div className="absolute top-5 right-6 flex justify-center gap-3">
      <button
        onClick={() => setLanguage("en")}
        className={`
            font-cinzel font-semibold
            px-3 py-1 /* Dibuat lebih kecil */
            rounded-md
            border-2 
            transition-all duration-300
            ${
              language === "en"
                ? "bg-stone-800/50 text-yellow-400 border-yellow-500 shadow-lg shadow-yellow-500/10"
                : "bg-black/20 text-stone-400 border-stone-700 hover:text-stone-200 hover:border-stone-500"
            }
          `}
      >
        English
      </button>
      <button
        onClick={() => setLanguage("id")}
        className={`
            font-cinzel font-semibold
            px-3 py-1 /* Dibuat lebih kecil */
            rounded-md
            border-2 
            transition-all duration-300
            ${
              language === "id"
                ? "bg-stone-800/50 text-yellow-400 border-yellow-500 shadow-lg shadow-yellow-500/10"
                : "bg-black/20 text-stone-400 border-stone-700 hover:text-stone-200 hover:border-stone-500"
            }
          `}
      >
        Bahasa Indonesia
      </button>
    </div>
  );

  if (screen === "welcome") {
    return (
      <div className="h-screen w-screen welcome-bg text-stone-800 flex flex-col items-center justify-center p-4">
        <div className="text-center content-frame w-full max-w-2xl p-16 shadow-2xl relative">
          {}
          <LanguageSelector />
          <img
            src="/logo.png"
            alt="Tale Weaver Logo"
            className="w-44 h-44 mx-auto mb-6"
          />

          {}
          <p className="text-lg mb-8 text-stone-900 leading-relaxed text-glow">
            {t("welcomeDescription")}
          </p>

          {}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setScreen("lobby")}
              className="
                font-cinzel text-lg font-bold text-white
                bg-gradient-to-b from-yellow-600 to-yellow-800
                border-2 border-yellow-400
                rounded-lg px-8 py-3
                shadow-lg shadow-black/30
                hover:from-yellow-500 hover:to-yellow-700
                hover:shadow-xl
                transition-all duration-300 ease-in-out
                transform hover:scale-105
              "
            >
              {t("assembleParty")}
            </button>
            <button
              onClick={() => setScreen("load")}
              className="
                font-cinzel text-lg font-bold text-white
                bg-gradient-to-b from-red-600 to-red-800
                border-2 border-red-400
                rounded-lg px-8 py-3
                shadow-lg shadow-black/30
                hover:from-red-500 hover:to-red-700  
                hover:shadow-xl
                transition-all duration-300 ease-in-out
                transform hover:scale-105
                "
            >
              {t("loadGame")}
            </button>
          </div>

          {}
          <LanguageSelector />
        </div>
      </div>
    );
  }

  if (screen === "load") {
    return (
      <LoadGameScreen
        onJoinGame={handleJoinGame}
        onCancel={() => setScreen("welcome")}
      />
    );
  }

  if (screen === "lobby" && !gameId) {
    return (
      <Lobby
        onJoinGame={handleJoinGame}
        onCreateGame={handleCreateGame}
        error={error}
        onCancel={() => setScreen("welcome")}
      />
    );
  }

  if (screen === "creation" && gameId) {
    return (
      <CharacterCreation
        onCharacterCreate={handleCharacterCreate}
        onCancel={() => {
          setScreen("lobby");
          setGameId(null);
        }}
      />
    );
  }

  if (screen === "lobby" && gameId && gameState) {
    return (
      <Lobby
        gameId={gameId}
        gameState={gameState}
        clientId={clientId}
        onStartGame={handleStartGame}
      />
    );
  }

  if (screen === "playing" && gameState) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const myPlayer = gameState.players.find((p) => p.id === clientId);

    return (
      <div className="h-screen overflow-y-auto parchment-bg text-stone-800 p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {viewingPlayer && (
          <CharacterSheet
            player={viewingPlayer}
            onClose={() => setViewingPlayer(null)}
          />
        )}
        <aside className="w-full lg:w-1/4 xl:w-1/5 flex flex-col gap-4">
          <PlayerStatsPanel
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            clientId={clientId}
            onPlayerClick={setViewingPlayer}
          />
          {myPlayer && (
            <InventoryPanel player={myPlayer} onEquip={handleEquipItem} />
          )}
          <LoreCodexPanel loreCodex={gameState.loreCodex} />
        </aside>

        <main className="w-full lg:w-1/2 xl:w-3/5 flex-grow flex flex-col bg-stone-500/5 rounded-lg shadow-lg p-4 lg:p-6 border-2 border-stone-400">
          <h1 className="text-3xl font-bold text-center mb-4 text-red-900 cinzel">
            {t("yourStory")}
          </h1>
          <StoryDisplay
            storyLog={gameState.storyLog}
            currentPlayer={currentPlayer}
            clientId={clientId}
            onRevealRoll={handleRevealRoll}
          />
          <div className="mt-auto pt-4">
            {gameState.isLoading && <LoadingSpinner />}
            {gameState.error && (
              <p className="text-red-800 text-center mb-2">{gameState.error}</p>
            )}
            {!gameState.isLoading && (
              <>
                {currentPlayer && (
                  <p className="text-center text-red-900 mb-2 font-semibold">
                    {t("whatWillPlayerDo", { playerName: currentPlayer.name })}
                  </p>
                )}
                <ActionInputPanel
                  suggestions={gameState.choices}
                  onActionSubmit={handleActionSubmit}
                  disabled={
                    currentPlayer?.id !== clientId || gameState.isLoading
                  }
                />
              </>
            )}
          </div>
        </main>

        <aside className="w-full lg:w-1/4 xl:w-1/5">
          {gameState.currentEnemy && !gameState.currentEnemy.isDefeated && (
            <CombatStatus enemy={gameState.currentEnemy} />
          )}
        </aside>
      </div>
    );
  }

  return <LoadingSpinner />;
};

export default App;
