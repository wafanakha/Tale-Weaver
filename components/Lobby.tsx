import React, { useState } from "react";
import { GameState } from "../types";
import { useLanguage } from "../i18n";

interface LobbyProps {
  gameId?: string | null;
  gameState?: GameState | null;
  clientId?: string;
  error?: string | null;
  onJoinGame?: (gameId: string) => void;
  onCreateGame?: () => void;
  onStartGame?: () => void;
}

const Lobby: React.FC<LobbyProps> = ({
  gameId,
  gameState,
  clientId,
  error,
  onJoinGame = () => {},
  onCreateGame = () => {},
  onStartGame = () => {},
}) => {
  const { t } = useLanguage();
  const [joinId, setJoinId] = useState("");

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinId.trim()) {
      onJoinGame(joinId.trim().toUpperCase());
    }
  };

  const copyGameId = () => {
    if (gameId) {
      navigator.clipboard
        .writeText(gameId)
        .then(() => alert("Game ID copied to clipboard!"))
        .catch((err) => console.error("Failed to copy text: ", err));
    }
  };

  if (gameId && gameState) {
    // We are in a game lobby, waiting for players
    const isHost = gameState.hostId === clientId;
    const canStart = gameState.players.length > 0;

    return (
      <div className="min-h-screen w-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4 cinzel">
            {t("partyLobby")}
          </h1>
          <p className="text-gray-400 mb-6">{t("shareGameId")}</p>
          <div
            className="bg-gray-900 text-yellow-400 text-3xl font-mono tracking-widest p-4 rounded-lg mb-6 cursor-pointer border-2 border-dashed border-gray-600 hover:border-yellow-400"
            onClick={copyGameId}
            title="Click to copy"
          >
            {gameId}
          </div>

          <h2 className="text-2xl font-bold text-yellow-400 mb-4 cinzel">
            {t("adventurersJoined")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 min-h-[120px]">
            {gameState.players.length > 0 ? (
              gameState.players.map((player) => (
                <div
                  key={player.id}
                  className="bg-gray-700 p-3 rounded-lg text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-900 border-2 border-yellow-400 flex items-center justify-center overflow-hidden shadow-lg">
                    <span className="text-2xl text-yellow-400 font-bold cinzel">
                      {player.name ? player.name.charAt(0).toUpperCase() : "?"}
                    </span>
                  </div>
                  <p className="font-bold text-yellow-400">{player.name}</p>
                  <p className="text-xs text-gray-400">{`${player.race} ${player.background}`}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic col-span-full">
                {t("waitingForAdventurers")}
              </p>
            )}
          </div>

          {isHost && (
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className="cinzel text-xl bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {t("startAdventure")}
            </button>
          )}
          {!isHost && (
            <p className="text-yellow-400 italic">{t("waitingForHost")}</p>
          )}
        </div>
      </div>
    );
  }

  // Default view: create or join
  return (
    <div className="min-h-screen w-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6 cinzel text-center">
          {t("joinAdventure")}
        </h1>

        {error && (
          <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-center">
            {error}
          </p>
        )}

        <div className="space-y-6">
          <div>
            <button
              onClick={onCreateGame}
              className="w-full cinzel text-lg bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              {t("createNewGame")}
            </button>
          </div>

          <div className="flex items-center text-gray-400">
            <hr className="flex-grow border-t border-gray-600" />
            <span className="px-4">{t("or")}</span>
            <hr className="flex-grow border-t border-gray-600" />
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-3">
            <label
              htmlFor="joinId"
              className="block text-lg font-semibold cinzel text-gray-300 text-center"
            >
              {t("joinExistingGame")}
            </label>
            <input
              type="text"
              id="joinId"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value.toUpperCase())}
              className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none text-center font-mono tracking-widest uppercase"
              placeholder={t("enterGameId")}
              required
            />
            <button
              type="submit"
              className="w-full cinzel text-lg bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition"
            >
              {t("joinGame")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
