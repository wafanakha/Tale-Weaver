import React, { useState, useEffect, useCallback, useRef } from "react";
import { GameState, Item, ItemType, Player, StoryLogEntry } from "./types";
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
  const storyIdCounter = useRef(0);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);

  // Ikuti State Change
  useEffect(() => {
    if (!gameId) return;
    const unsubscribe = gameService.listenToGame(gameId, (state) => {
      setGameState(state);
      if (state?.status === "playing" && screen !== "playing") {
        setScreen("playing");
      }
      storyIdCounter.current = state?.storyLog?.length ?? 0;
    });
    return () => unsubscribe();
  }, [gameId, screen]);

  // Proses Turn
  useEffect(() => {
    if (
      !gameState ||
      gameState.hostId !== clientId ||
      !gameState.lastPlayerAction
    )
      return;

    const processAction = async () => {
      const { playerId, choice } = gameState.lastPlayerAction!;
      const actingPlayer = gameState.players.find((p) => p.id === playerId);
      if (!actingPlayer) return;

      try {
        const response = await getNextStoryPart(gameState, choice, language);

        // Buat state baru berdasarkan respon AI
        const newState: GameState = JSON.parse(JSON.stringify(gameState)); // Deep copy

        // update
        if (response.player_updates) {
          response.player_updates.forEach((update) => {
            const playerIndex = newState.players.findIndex(
              (p) => p.name === update.playerName
            );
            if (playerIndex > -1) {
              const p = newState.players[playerIndex];
              // Inventory harus ada untuk mencegah error
              if (!p.inventory) p.inventory = [];
              if (!p.spellSlots) p.spellSlots = {};

              if (update.hp !== undefined) p.hp = update.hp;
              if (update.inventory_add)
                p.inventory.push(...update.inventory_add);
              if (update.inventory_remove) {
                p.inventory = p.inventory.filter(
                  (item) => !update.inventory_remove?.includes(item.name)
                );
              }
              if (update.spell_slot_used) {
                const level = update.spell_slot_used.level;
                if (
                  p.spellSlots[level] &&
                  p.spellSlots[level].used < p.spellSlots[level].total
                ) {
                  p.spellSlots[level].used++;
                }
              }
            }
          });
        }

        // update enemy
        if (response.enemy_update) {
          // Jika enemy mati, hapus
          if (response.enemy_update.is_defeated === true) {
            newState.currentEnemy = null;
          }
          // jika tidak enemy update
          else if (
            response.enemy_update.name &&
            response.enemy_update.hp !== undefined &&
            response.enemy_update.maxHp !== undefined
          ) {
            newState.currentEnemy = {
              name: response.enemy_update.name,
              hp: response.enemy_update.hp,
              maxHp: response.enemy_update.maxHp,
              isDefeated: false,
            };
          }
        }

        if (!newState.storyLog) {
          newState.storyLog = [];
        }

        // update Lore Codex
        if (response.lore_entries && response.lore_entries.length > 0) {
          if (!newState.loreCodex) {
            newState.loreCodex = [];
          }
          const existingTitles = new Set(
            newState.loreCodex.map((e) => e.title.toLowerCase())
          );
          const newUniqueEntries = response.lore_entries.filter(
            (entry) =>
              entry.title && !existingTitles.has(entry.title.toLowerCase())
          );
          if (newUniqueEntries.length > 0) {
            newState.loreCodex.push(...newUniqueEntries);
          }
        }

        // tambah story entry
        const newStoryId = storyIdCounter.current++;
        const newStoryEntry: StoryLogEntry = {
          speaker: "story",
          text: response.story,
          id: newStoryId,
        };

        if (response.dice_roll) {
          newStoryEntry.diceRoll = response.dice_roll;
        }

        newState.storyLog.push(newStoryEntry);

        // ubah pilihan jadi array.
        newState.choices = response.choices || [];
        newState.currentPlayerIndex =
          response.next_player_index ??
          (newState.currentPlayerIndex + 1) % newState.players.length;

        // Reset loading dan aksi player
        newState.isLoading = false;
        newState.lastPlayerAction = null;

        await gameService.updateGameState(newState.gameId, newState);
      } catch (err) {
        console.error(err);
        const currentState = await gameService.getGameState(gameState.gameId);
        if (currentState) {
          currentState.error = t("storytellerError");
          currentState.isLoading = false;
          currentState.lastPlayerAction = null;
          await gameService.updateGameState(gameState.gameId, currentState);
        }
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
        const isPlayerInGame = state.players.some((p) => p.id === clientId);

        if (!isPlayerInGame && state.status !== "lobby") {
          setError(t("gameAlreadyStarted"));
          return;
        }

        gameService.addUserGame(gameIdUpper);
        setGameId(gameIdUpper);

        if (isPlayerInGame) {
          setScreen(state.status === "playing" ? "playing" : "lobby");
        } else {
          setScreen("creation");
        }
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
    };
    await gameService.addPlayer(gameId, newPlayer);
    setScreen("lobby");
  };

  const handleStartGame = async () => {
    if (!gameId || !gameState) return;

    // proses turn base
    await gameService.updateGameState(gameId, { isLoading: true });
    const initialPrompt = t("adventureBegins");
    await gameService.postAction(gameId, clientId, initialPrompt);
    await gameService.updateGameState(gameId, { status: "playing" });
  };

  const handleActionSubmit = async (action: string) => {
    if (!gameId || !gameState || gameState.isLoading) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== clientId) return;

    const newPlayerChoiceId = storyIdCounter.current++;
    const newLog = {
      speaker: currentPlayer.name,
      text: action,
      id: newPlayerChoiceId,
    };

    // update UI
    setGameState((prev) =>
      prev
        ? {
            ...prev,
            isLoading: true,
            choices: [],
            storyLog: [...(prev.storyLog || []), newLog],
          }
        : null
    );

    // update di semua player
    await gameService.updateGameState(gameId, {
      isLoading: true,
      choices: [],
      storyLog: [...(gameState.storyLog || []), newLog],
    });
    await gameService.postAction(gameId, clientId, action);
  };

  const handleEquipItem = (itemToEquip: Item) => {
    if (!gameId || !gameState) return;

    const playerIndex = gameState.players.findIndex((p) => p.id === clientId);
    if (playerIndex === -1) return;

    const player = { ...gameState.players[playerIndex] };

    if (!player.equipment) {
      player.equipment = { weapon: null, armor: null };
    }

    if (!player.inventory) {
      player.inventory = [];
    }

    const currentlyEquipped =
      itemToEquip.type === ItemType.WEAPON
        ? player.equipment.weapon
        : player.equipment.armor;

    if (currentlyEquipped) player.inventory.push(currentlyEquipped);
    player.inventory = player.inventory.filter(
      (item) => item.name !== itemToEquip.name
    );
    if (itemToEquip.type === ItemType.WEAPON)
      player.equipment.weapon = itemToEquip;
    if (itemToEquip.type === ItemType.ARMOR)
      player.equipment.armor = itemToEquip;

    const newPlayers = [...gameState.players];
    newPlayers[playerIndex] = player;

    const newSystemMessageId = storyIdCounter.current++;
    const storyLog = [
      ...(gameState.storyLog || []),
      {
        speaker: "system",
        text: t("playerEquippedItem", {
          playerName: player.name,
          itemName: itemToEquip.name,
        }),
        id: newSystemMessageId,
      },
    ];

    gameService.updateGameState(gameId, { players: newPlayers, storyLog });
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
                ? 
                  "bg-stone-800/50 text-yellow-400 border-yellow-500 shadow-lg shadow-yellow-500/10"
                : 
                  "bg-black/20 text-stone-400 border-stone-700 hover:text-stone-200 hover:border-stone-500"
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
                ? 
                  "bg-stone-800/50 text-yellow-400 border-yellow-500 shadow-lg shadow-yellow-500/10"
                :
                  "bg-black/20 text-stone-400 border-stone-700 hover:text-stone-200 hover:border-stone-500"
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
      <div className="h-screen overflow-hidden parchment-bg text-stone-800 p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
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
          <StoryDisplay storyLog={gameState.storyLog} />
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
