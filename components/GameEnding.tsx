import React, { useEffect } from "react";
import { useLanguage } from "../i18n";

interface GameEndingProps {
  type: "victory" | "defeat";
  story: string;
  onBack: () => void;
}

const GameEnding: React.FC<GameEndingProps> = ({ type, story, onBack }) => {
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playNote = (
        freq: number,
        start: number,
        duration: number,
        vol = 0.2,
        type: "sine" | "sawtooth" | "triangle" = "triangle"
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.1);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + start + duration
        );
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      if (type === "victory") {
        // Heroic Ascending Melody
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
          playNote(f, i * 0.2, 1.0, 0.15)
        );
      } else {
        // Somber Descending Melody
        [196.0, 164.81, 130.81, 98.0].forEach((f, i) =>
          playNote(f, i * 0.4, 2.0, 0.2, "sine")
        );
      }
    } catch (e) {}
  }, [type]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md transition-all duration-1000 ${
        type === "victory" ? "bg-amber-900/40" : "bg-stone-900/80"
      }`}
    >
      <div
        className={`bg-[#f3e9d2] p-8 md:p-12 rounded-lg shadow-2xl max-w-3xl w-full border-8 border-double text-center animate-in fade-in zoom-in duration-1000 ${
          type === "victory" ? "border-amber-600" : "border-stone-700"
        }`}
      >
        <div className="mb-6">
          {type === "victory" ? (
            <div className="text-8xl animate-bounce">🏆</div>
          ) : (
            <div className="text-8xl grayscale opacity-50">💀</div>
          )}
        </div>

        <h1
          className={`text-6xl medieval mb-4 tracking-tighter drop-shadow-md ${
            type === "victory" ? "text-amber-800" : "text-stone-800"
          }`}
        >
          {type === "victory" ? "VICTORY" : "DEFEAT"}
        </h1>

        <div className="my-8 p-6 bg-stone-500/10 rounded-lg border-2 border-stone-400 italic font-serif leading-relaxed text-lg text-stone-800 max-h-96 overflow-y-auto">
          {story}
        </div>

        <p className="cinzel text-stone-600 mb-8 uppercase tracking-widest text-sm">
          {type === "victory"
            ? "The realm remembers your valor."
            : "Your legend ends here, but your spirit remains."}
        </p>

        <button
          onClick={onBack}
          className={`cinzel text-2xl font-bold py-4 px-10 rounded-lg transition transform hover:scale-105 shadow-xl ${
            type === "victory"
              ? "bg-amber-700 hover:bg-amber-600 text-white"
              : "bg-stone-800 hover:bg-stone-700 text-stone-300"
          }`}
        >
          {t("back")}
        </button>
      </div>
    </div>
  );
};

export default GameEnding;
