import React from "react";
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

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#f3e9d2] text-stone-800 rounded-lg shadow-[0_0_20px_rgba(185,28,28,0.5)] max-w-md w-full p-6 relative border-4 border-double border-amber-800 text-center animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-4xl medieval text-red-900 mb-2 drop-shadow-md">
          LEVEL UP!
        </h1>
        <h2 className="text-xl cinzel font-bold text-stone-700 mb-6">
          {data.playerName} reached Level {data.newLevel}
        </h2>

        <div className="space-y-4 mb-8 text-left bg-stone-500/10 p-4 rounded-md border border-stone-400">
          <div className="flex justify-between items-center border-b border-stone-400 pb-2">
            <span className="font-bold text-stone-800 uppercase text-sm">
              Max HP
            </span>
            <div className="flex items-center gap-2">
              <span className="text-stone-500 line-through text-sm">
                {data.newMaxHp - data.hpIncrease}
              </span>
              <span className="text-green-800 font-bold">
                → {data.newMaxHp}
              </span>
              <span className="text-xs text-green-700 font-semibold">
                (+{data.hpIncrease})
              </span>
            </div>
          </div>

          {data.statsIncreased &&
            Object.keys(data.statsIncreased).map((statKey) => (
              <div
                key={statKey}
                className="flex justify-between items-center border-b border-stone-400 pb-2"
              >
                <span className="font-bold text-stone-800 uppercase text-sm">
                  {statKey}
                </span>
                <span className="text-green-800 font-bold">
                  +{data.statsIncreased![statKey as keyof Stats]}
                </span>
              </div>
            ))}

          {data.newSkills && data.newSkills.length > 0 && (
            <div>
              <p className="font-bold text-stone-800 uppercase text-sm mb-1">
                New Skills Learned
              </p>
              <ul className="list-disc list-inside text-red-900 font-serif font-semibold">
                {data.newSkills.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="cinzel text-xl bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 shadow-lg"
        >
          Continue Adventure
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;
