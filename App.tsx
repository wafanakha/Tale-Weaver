import React, { useState, useEffect, useCallback, useRef } from "react";
import { GameState, Item, ItemType, Player, StoryLogEntry } from "./types";
import { getNextStoryPart, generateStoryImage } from "./services/geminiService";
import { gameService } from "./services/gameService";
import { useLanguage } from "./i18n";
import PlayerStatsPanel from "./components/PlayerStatsPanel";
import InventoryPanel from "./components/InventoryPanel";
import StoryDisplay from "./components/StoryDisplay";
import ActionInput from "./components/ActionInput";
import CombatStatus from "./components/CombatStatus";
import LoadingSpinner from "./components/LoadingSpinner";
import CharacterCreation, {
  CharacterDetails,
} from "./components/CharacterCreation";
import Lobby from "./components/Lobby";
import LoreCodex from "./components/LoreCodex";

const App: React.FC = () => {
  const [clientId] = useState(gameService.getClientId());
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const [screen, setScreen] = useState<
    "welcome" | "lobby" | "creation" | "playing"
  >("welcome");
  const [error, setError] = useState<string | null>(null);
  const storyIdCounter = useRef(0);
  const [isCodexOpen, setIsCodexOpen] = useState(false);

  // Subscribe to game state changes
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

  // Host client logic: watch for player actions and process turns
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

        // Create a new state based on the AI's response
        const newState: GameState = JSON.parse(JSON.stringify(gameState)); // Deep copy

        // Apply player updates
        if (response.player_updates) {
          response.player_updates.forEach((update) => {
            const playerIndex = newState.players.findIndex(
              (p) => p.name === update.playerName
            );
            if (playerIndex > -1) {
              const p = newState.players[playerIndex];
              // Defensively ensure inventory exists before modification to prevent crashes.
              if (!p.inventory) {
                p.inventory = [];
              }
              if (update.hp !== undefined) p.hp = update.hp;
              if (update.inventory_add)
                p.inventory.push(...update.inventory_add);
              if (update.inventory_remove) {
                p.inventory = p.inventory.filter(
                  (item) => !update.inventory_remove?.includes(item.name)
                );
              }
            }
          });
        }

        // Apply enemy updates
        const previousEnemy = gameState.currentEnemy;

        if (response.enemy_update) {
          // If the enemy is defeated, remove it.
          if (response.enemy_update.is_defeated === true) {
            newState.currentEnemy = null;
          }
          // Else, if we have enough info, create/update the enemy.
          else if (
            response.enemy_update.name &&
            response.enemy_update.hp !== undefined &&
            response.enemy_update.maxHp !== undefined
          ) {
            newState.currentEnemy = {
              name: response.enemy_update.name,
              hp: response.enemy_update.hp,
              maxHp: response.enemy_update.maxHp,
              isDefeated: false, // Normalize to false if not explicitly defeated
            };
          }
          // Otherwise, the response is malformed, so we don't change the enemy state.
        }
        // If no enemy_update is received, newState.currentEnemy from the deep copy is preserved.

        let imagePrompt: string | undefined = undefined;
        const newEnemy = newState.currentEnemy;
        if (
          newEnemy &&
          (!previousEnemy || previousEnemy.name !== newEnemy.name)
        ) {
          imagePrompt = `A single fantasy ${newEnemy.name}, dark art style.`;
        }

        // Defensively ensure storyLog exists before modification.
        if (!newState.storyLog) {
          newState.storyLog = [];
        }

        // Add new lore entries
        if (response.lore_codex_add) {
          if (!newState.loreCodex) {
            newState.loreCodex = [];
          }
          response.lore_codex_add.forEach((newEntry) => {
            // Avoid duplicates
            const entryExists = newState.loreCodex.some(
              (e) => e.title.toLowerCase() === newEntry.title.toLowerCase()
            );
            if (
              !entryExists &&
              newEntry.title &&
              newEntry.category &&
              newEntry.content
            ) {
              newState.loreCodex.push({
                id: `${newEntry.category}-${newEntry.title.replace(
                  /\s+/g,
                  "-"
                )}`, // create a unique id
                title: newEntry.title,
                category: newEntry.category,
                content: newEntry.content,
              });
            }
          });
        }

        // Add story log entry
        const newStoryId = storyIdCounter.current++;
        const newStoryEntry: StoryLogEntry = {
          speaker: "story",
          text: response.story,
          id: newStoryId,
          imageIsLoading: !!imagePrompt,
        };

        // Conditionally add the dice_roll to avoid writing 'undefined' to Firebase.
        if (response.dice_roll) {
          newStoryEntry.diceRoll = response.dice_roll;
        }

        newState.storyLog.push(newStoryEntry);

        // Update next player
        newState.currentPlayerIndex =
          response.next_player_index ??
          (newState.currentPlayerIndex + 1) % newState.players.length;

        // Reset loading state and clear the action that was just processed
        newState.isLoading = false;
        newState.lastPlayerAction = null;

        await gameService.updateGameState(newState.gameId, newState);

        if (imagePrompt) {
          const imageUrl = await generateStoryImage(imagePrompt);
          if (imageUrl) {
            const finalState = await gameService.getGameState(newState.gameId);
            if (finalState) {
              const logIndex = finalState.storyLog.findIndex(
                (l) => l.id === newStoryId
              );
              if (logIndex > -1) {
                finalState.storyLog[logIndex].imageUrl = imageUrl;
                finalState.storyLog[logIndex].imageIsLoading = false;
                await gameService.updateGameState(
                  finalState.gameId,
                  finalState
                );
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
        const currentState = await gameService.getGameState(gameState.gameId);
        if (currentState) {
          currentState.error = t("storytellerError");
          currentState.isLoading = false;
          currentState.lastPlayerAction = null; // Clear action to allow retry
          await gameService.updateGameState(gameState.gameId, currentState);
        }
      }
    };

    processAction();
  }, [gameState?.lastPlayerAction, gameState?.hostId, clientId, language, t]);

  const handleCreateGame = async () => {
    try {
      const newGameId = await gameService.createGame(clientId);
      setGameId(newGameId);
      setScreen("creation");
    } catch (e) {
      setError(t("failedToCreateGame"));
    }
  };

  const handleJoinGame = async (id: string) => {
    try {
      const state = await gameService.getGameState(id);
      if (state) {
        if (state.players.find((p) => p.id === clientId)) {
          // Already in game, just join
        } else if (state.status !== "lobby") {
          setError(t("gameAlreadyStarted"));
          return;
        }
        setGameId(id);
        if (state.players.find((p) => p.id === clientId)) {
          setScreen("playing"); // Or lobby if not started
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
      background: details.background,
      hp: 20 + Math.floor((details.stats.constitution - 10) / 2),
      maxHp: 20 + Math.floor((details.stats.constitution - 10) / 2),
      level: 1,
      stats: details.stats,
      skills: details.skills,
      combatSkills: details.combatSkills,
      inventory: [],
      equipment: { weapon: null, armor: null },
    };
    await gameService.addPlayer(gameId, newPlayer);
    setScreen("lobby");
  };

  const handleStartGame = async () => {
    if (!gameId || !gameState) return;

    // Set loading state for all players
    await gameService.updateGameState(gameId, { isLoading: true });

    // Host processes the initial turn
    const initialPrompt = t("adventureBegins");
    await gameService.postAction(gameId, clientId, initialPrompt);
    await gameService.updateGameState(gameId, { status: "playing" });
  };

  const handleActionSubmit = async (action: string) => {
    if (!gameId || !gameState || gameState.isLoading) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== clientId) return; // Not our turn

    const newPlayerChoiceId = storyIdCounter.current++;
    const newLog = {
      speaker: currentPlayer.name,
      text: action,
      id: newPlayerChoiceId,
    };

    // Optimistically update UI for the current player
    setGameState((prev) =>
      prev
        ? {
            ...prev,
            isLoading: true,
            storyLog: [...(prev.storyLog || []), newLog],
          }
        : null
    );

    // Update state for everyone and post action for the host to process
    await gameService.updateGameState(gameId, {
      isLoading: true,
      storyLog: [...(gameState.storyLog || []), newLog],
    });
    await gameService.postAction(gameId, clientId, action);
  };

  const handleEquipItem = (itemToEquip: Item) => {
    if (!gameId || !gameState) return;

    const playerIndex = gameState.players.findIndex((p) => p.id === clientId);
    if (playerIndex === -1) return;

    const player = { ...gameState.players[playerIndex] };

    // Defensively ensure the equipment object exists before modification.
    if (!player.equipment) {
      player.equipment = { weapon: null, armor: null };
    }

    // Defensively ensure the inventory array exists before modification.
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
    <div className="flex justify-center gap-4 mt-8">
      <button
        onClick={() => setLanguage("en")}
        className={`px-4 py-2 rounded-md text-sm transition-colors ${
          language === "en"
            ? "bg-yellow-500 text-gray-900 font-bold"
            : "bg-gray-700 hover:bg-gray-600"
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage("id")}
        className={`px-4 py-2 rounded-md text-sm transition-colors ${
          language === "id"
            ? "bg-yellow-500 text-gray-900 font-bold"
            : "bg-gray-700 hover:bg-gray-600"
        }`}
      >
        Bahasa Indonesia
      </button>
    </div>
  );

  if (screen === "welcome") {
    return (
      <div className="h-screen w-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
        <div className="text-center bg-gray-800 p-10 rounded-lg shadow-2xl max-w-2xl">
          <h1 className="text-5xl font-bold text-yellow-400 mb-4 cinzel">
            {t("welcomeTitle")}
          </h1>
          <p className="text-lg mb-8 text-gray-300">
            {t("welcomeDescription")}
          </p>
          <button
            onClick={() => setScreen("lobby")}
            className="cinzel text-xl bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {t("assembleParty")}
          </button>
          <LanguageSelector />
        </div>
      </div>
    );
  }

  // FIX: This condition was too broad, catching all 'lobby' screens.
  // It's now restricted to only show when there is no active game ID,
  // correctly differentiating the "join/create" lobby from the "waiting" lobby.
  if (screen === "lobby" && !gameId) {
    return (
      <Lobby
        onJoinGame={handleJoinGame}
        onCreateGame={handleCreateGame}
        error={error}
      />
    );
  }

  if (screen === "creation" && gameId) {
    return (
      <CharacterCreation
        onCharacterCreate={handleCharacterCreate}
        onCancel={() => setScreen("lobby")}
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
      <>
        <LoreCodex
          isOpen={isCodexOpen}
          onClose={() => setIsCodexOpen(false)}
          loreEntries={gameState.loreCodex || []}
        />
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
          <aside className="w-full lg:w-1/4 xl:w-1/5 flex flex-col gap-4">
            <PlayerStatsPanel
              players={gameState.players}
              currentPlayerIndex={gameState.currentPlayerIndex}
              clientId={clientId}
            />
            {myPlayer && (
              <InventoryPanel player={myPlayer} onEquip={handleEquipItem} />
            )}
          </aside>

          <main className="w-full lg:w-1/2 xl:w-3/5 flex-grow flex flex-col bg-gray-800/50 rounded-lg shadow-lg p-4 lg:p-6 border border-gray-700">
            <div className="flex items-center justify-center mb-4 relative">
              <h1 className="text-3xl font-bold text-yellow-400 cinzel text-center">
                {t("yourStory")}
              </h1>
              <button
                onClick={() => setIsCodexOpen(true)}
                title={t("loreCodex")}
                aria-label={t("loreCodex")}
                className="absolute right-0 p-2 rounded-full bg-gray-700 hover:bg-yellow-600 text-gray-200 hover:text-gray-900 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </button>
            </div>
            <StoryDisplay storyLog={gameState.storyLog} />
            <div className="mt-auto pt-4">
              {gameState.isLoading && <LoadingSpinner />}
              {gameState.error && (
                <p className="text-red-400 text-center mb-2">
                  {gameState.error}
                </p>
              )}
              {!gameState.isLoading && (
                <>
                  {currentPlayer && (
                    <p className="text-center text-yellow-400 mb-2 font-semibold">
                      {t("whatWillPlayerDo", {
                        playerName: currentPlayer.name,
                      })}
                    </p>
                  )}
                  <ActionInput
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
      </>
    );
  }

  return <LoadingSpinner />;
};

export default App;
