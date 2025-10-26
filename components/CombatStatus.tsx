import React from "react";
import { Enemy } from "../types";
import { useLanguage } from "../i18n";

interface CombatStatusProps {
  enemy: Enemy;
}

const EnemyHealthBar: React.FC<{ hp: number; maxHp: number }> = ({
  hp,
  maxHp,
}) => {
  const percentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  return (
    <div>
      <div className="flex mb-1 items-center justify-between">
        <span className="text-xs font-semibold text-red-800">HP</span>
        <span className="text-xs font-semibold text-stone-600">
          {hp} / {maxHp}
        </span>
      </div>
      <div className="overflow-hidden h-3 text-xs flex rounded bg-stone-300">
        <div
          style={{ width: `${percentage}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-700 transition-all duration-500"
        ></div>
      </div>
    </div>
  );
};

const CombatStatus: React.FC<CombatStatusProps> = ({ enemy }) => {
  const { t } = useLanguage();
  return (
    <div className="border-2 border-stone-400 bg-stone-500/10 p-3 rounded-md shadow-sm animate-pulse-border">
      <style>{`
        @keyframes pulse-border {
          0%, 100% { border-color: #991b1b; }
          50% { border-color: #b91c1c; }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
          border-color: #991b1b;
        }
      `}</style>
      <h2 className="text-center text-red-900 cinzel font-bold text-lg mb-2">
        {t("combat")}
      </h2>
      <div className="space-y-2">
        <p className="text-lg font-bold text-center text-stone-800">
          {enemy.name}
        </p>
        <EnemyHealthBar hp={enemy.hp} maxHp={enemy.maxHp} />
      </div>
    </div>
  );
};

export default CombatStatus;
