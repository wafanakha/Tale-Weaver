import React, { useEffect } from "react";
import { useLanguage } from "../i18n";
import { Stats } from "../types";

export interface LevelUpData {
  playerName: string;
  newLevel: number;
  newMaxHp: number;
  hpIncrease: number;
  newSkills?: string[];
  statsIncreased?: Partial<Stats>;
}

interface LevelUpModalProps {
  data: LevelUpData;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ data, onClose }) => {
  const { t } = useLanguage();

  // Procedural "Level Up" sound
  useEffect(() => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + start + duration
        );
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Ascending C-Major arpeggio
      playNote(261.63, 0, 0.5); // C4
      playNote(329.63, 0.15, 0.5); // E4
      playNote(392.0, 0.3, 0.5); // G4
      playNote(523.25, 0.45, 1.0); // C5
    } catch (e) {
      console.warn("Audio failed", e);
    }
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#f3e9d2] text-stone-800 rounded-lg shadow-[0_0_50px_rgba(251,191,36,0.5)] max-w-lg w-full p-8 relative border-4 border-double border-amber-600 text-center animate-in fade-in zoom-in duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 bg-amber-500 rounded-full border-4 border-amber-200 flex items-center justify-center shadow-2xl animate-bounce">
            <span className="text-4xl">🌟</span>
          </div>
        </div>

        <h1 className="text-5xl medieval text-red-900 mb-2 mt-8 drop-shadow-lg tracking-widest">
          LEVEL UP!
        </h1>
        <h2 className="text-2xl cinzel font-bold text-stone-700 mb-8 border-b-2 border-amber-800/30 pb-4">
          {data.playerName}{" "}
          <span className="text-red-800">Lvl {data.newLevel}</span>
        </h2>

        <div className="space-y-6 mb-10 text-left overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin scrollbar-thumb-amber-700">
          <div className="bg-stone-500/10 p-4 rounded-md border border-stone-400">
            <h3 className="font-bold text-red-900 uppercase text-xs tracking-tighter mb-3 border-b border-stone-400/50 pb-1">
              Vitals & Strength
            </h3>
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-stone-800 uppercase text-sm">
                Max HP
              </span>
              <div className="flex items-center gap-2">
                <span className="text-stone-500 line-through text-xs">
                  {data.newMaxHp - data.hpIncrease}
                </span>
                <span className="text-green-800 font-bold text-lg">
                  → {data.newMaxHp}
                </span>
                <span className="text-xs text-green-700 font-black bg-green-200 px-1 rounded">
                  +{data.hpIncrease}
                </span>
              </div>
            </div>

            {data.statsIncreased &&
              Object.entries(data.statsIncreased).map(([statKey, inc]) =>
                inc ? (
                  <div
                    key={statKey}
                    className="flex justify-between items-center mb-2"
                  >
                    <span className="font-bold text-stone-800 capitalize text-sm">
                      {statKey}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-black text-sm">
                        +{inc}
                      </span>
                    </div>
                  </div>
                ) : null
              )}
          </div>

          {data.newSkills && data.newSkills.length > 0 && (
            <div className="bg-red-900/5 p-4 rounded-md border border-red-800/20">
              <h3 className="font-bold text-red-900 uppercase text-xs tracking-tighter mb-3 border-b border-red-800/30 pb-1">
                New Combat Abilities
              </h3>
              <div className="space-y-3">
                {data.newSkills.map((skill, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-xl">⚔️</span>
                    <div>
                      <p className="font-bold text-red-900 cinzel text-sm leading-tight">
                        {skill}
                      </p>
                      <p className="text-xs text-stone-600 italic">
                        Your power grows as you master new techniques.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full cinzel text-2xl bg-red-800 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition transform hover:scale-105 shadow-2xl ring-4 ring-amber-600/30"
        >
          Continue the Journey
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;
