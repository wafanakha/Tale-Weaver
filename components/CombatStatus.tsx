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
        <span className="text-xs font-semibold text-red-300">HP</span>
        <span className="text-xs font-semibold text-gray-300">
          {hp} / {maxHp}
        </span>
      </div>
      <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-700">
        <div
          style={{ width: `${percentage}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-600 transition-all duration-500"
        ></div>
      </div>
    </div>
  );
};

const CombatStatus: React.FC<CombatStatusProps> = ({ enemy }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 shadow-md border border-gray-700 animate-pulse-border">
      <style>{`
        @keyframes pulse-border {
          0%, 100% { border-color: #c0392b; }
          50% { border-color: #e74c3c; }
        }
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>
      <h2 className="text-xl font-bold text-center mb-2 text-red-400 cinzel">
        {t("combat")}
      </h2>
      <div className="space-y-2">
        <p className="text-lg font-bold text-center text-gray-100">
          {enemy.name}
        </p>
        <EnemyHealthBar hp={enemy.hp} maxHp={enemy.maxHp} />
      </div>
    </div>
  );
};

export default CombatStatus;
