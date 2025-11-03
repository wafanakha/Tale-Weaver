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
  onCancel?: () => void; // Prop untuk tombol "Kembali"
}

const Lobby: React.FC<LobbyProps> = ({
  gameId,
  gameState,
  clientId,
  error,
  onJoinGame = () => {},
  onCreateGame = () => {},
  onStartGame = () => {},
  onCancel = () => {}, // Terima prop "Kembali"
}) => {
  const { t } = useLanguage();
  const [joinId, setJoinId] = useState("");
  const [copied, setCopied] = useState(false);

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
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => console.error("Failed to copy text: ", err));
    }
  };

  // Tampilan "Party Lobby" (setelah game dibuat/digabung)
  if (gameId && gameState) {
    const isHost = gameState.hostId === clientId;
    const canStart = gameState.players.length > 0;

    return (
      // === UBAH: Gunakan 'welcome-bg' ===
      <div className="min-h-screen w-screen welcome-bg text-stone-800 flex flex-col items-center justify-center p-4">
        {/* === UBAH: Gunakan 'content-frame' dan sesuaikan padding/ukuran === */}
        <div className="content-frame relative p-12 shadow-2xl max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-red-900 mb-4 cinzel">
            {t("partyLobby")}
          </h1>
          <p className="text-stone-800 text-glow mb-6">{t("shareGameId")}</p> {/* Tambah text-glow */}
          <div
            className="bg-stone-200 text-red-900 text-3xl font-mono tracking-widest p-4 rounded-lg mb-6 cursor-pointer border-2 border-dashed border-stone-500 hover:border-amber-700"
            onClick={copyGameId}
            title="Click to copy"
          >
            {copied ? "Copied!" : gameId}
          </div>

          <h2 className="text-2xl font-bold text-red-900 mb-4 cinzel">
            {t("adventurersJoined")}
          </h2>
          {/* ... sisa kode pemain ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 min-h-[120px]">
            {gameState.players.length > 0 ? (
              gameState.players.map((player) => (
                <div
                  key={player.id}
                  className="border-2 border-stone-400 bg-stone-500/10 p-3 rounded-md text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-stone-300 border-2 border-red-900 flex items-center justify-center overflow-hidden shadow-lg">
                    <span className="text-2xl text-red-900 font-bold cinzel">
                      {player.name ? player.name.charAt(0).toUpperCase() : "?"}
                    </span>
                  </div>
                  <p className="font-bold text-red-800">{player.name}</p>
                  <p className="text-xs text-stone-600">{`${player.race} ${player.background}`}</p>
                </div>
              ))
            ) : (
              <p className="text-stone-500 italic col-span-full pt-8 text-glow">
                {t("waitingForAdventurers")}
              </p>
            )}
          </div>

          {isHost && (
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className="cinzel text-xl bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 disabled:bg-stone-500 disabled:cursor-not-allowed"
            >
              {t("startAdventure")}
            </button>
          )}
          {!isHost && (
            <p className="text-amber-700 italic text-glow">{t("waitingForHost")}</p>
          )}
        </div>
      </div>
    );
  }

  // Tampilan "Join Adventure" (tampilan awal lobby)
  return (
    // === UBAH: Gunakan 'welcome-bg' ===
    <div className="min-h-screen w-screen welcome-bg text-stone-800 flex flex-col items-center justify-center p-4">
      {/* === UBAH: Gunakan 'content-frame' dan sesuaikan padding/ukuran === */}
      {/* Saya gunakan max-w-2xl agar konsisten dengan layar welcome & party lobby */}
      <div className="content-frame relative p-16 shadow-2xl max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-red-900 mb-6 cinzel text-center">
          {t("joinAdventure")}
        </h1>

        {error && (
          <p className="bg-red-900/20 text-red-800 p-3 rounded-md mb-4 text-center border border-red-800/50">
            {error}
          </p>
        )}

        <div className="space-y-6">
          <div>
            <button
              onClick={onCreateGame}
              className="w-full cinzel text-lg bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              {t("createNewGame")}
            </button>
          </div>

          <div className="flex items-center text-stone-700 text-glow"> {/* Tambah text-glow */}
            <hr className="flex-grow border-t border-stone-400" />
            <span className="px-4">{t("or")}</span>
            <hr className="flex-grow border-t border-stone-400" />
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-3">
            <label
              htmlFor="joinId"
              className="block text-lg font-semibold cinzel text-stone-700 text-center text-glow" // Tambah text-glow
            >
              {t("joinExistingGame")}
            </label>
            <input
              type="text"
              id="joinId"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value.toUpperCase())}
              className="w-full p-3 bg-stone-200 rounded-md border border-stone-400 focus:ring-2 focus:ring-red-800 outline-none text-center font-mono tracking-widest uppercase"
              placeholder={t("enterGameId")}
              required
            />
            <button
              type="submit"
              className="w-full cinzel text-lg bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              {t("joinGame")}
            </button>
          </form>
        </div>

        {/* === TAMBAHKAN TOMBOL KEMBALI DI SINI === */}
        <div className="text-center mt-8">
          <button
            onClick={onCancel} // Memanggil prop
            className="cinzel text-md text-stone-700 hover:text-stone-900 transition underline text-glow" // Tambah text-glow
          >
            {t('back', 'Back to Welcome')}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default Lobby;