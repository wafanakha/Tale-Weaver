import React from "react";
import { Player } from "../types";
import { useLanguage } from "../i18n";

interface PlayerStatsPanelProps {
  players: Player[];
  currentPlayerIndex: number;
  clientId: string;
  onPlayerClick: (player: Player) => void;
}

const HealthBar: React.FC<{ hp: number; maxHp: number }> = ({ hp, maxHp }) => {
  const percentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const healthColor = "bg-red-800";

  return (
    <div >
      <div className="flex mb-1 items-center justify-between text-xs">
        <span className="font-semibold text-stone-600">HP</span>
        <span className="font-semibold text-stone-600">
          {hp} / {maxHp}
        </span>
      </div>
      <div className="overflow-hidden h-2 text-xs flex rounded bg-stone-300">
        <div
          style={{ width: `${percentage}%` }}
          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${healthColor}`}
        ></div>
      </div>
    </div>
  );
};

const AvatarDisplay: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-stone-300 border-2 border-red-900 flex items-center justify-center overflow-hidden shadow-lg">
      <span className="text-2xl text-red-900 font-bold cinzel">
        {name ? name.charAt(0).toUpperCase() : "?"}
      </span>
    </div>
  );
};

const PlayerCard: React.FC<{
  player: Player;
  isCurrentTurn: boolean;
  isYou: boolean;
  onPlayerClick: (player: Player) => void;
}> = ({ player, isCurrentTurn, isYou, onPlayerClick }) => {
  const { t } = useLanguage();
  const borderColor = isCurrentTurn ? "border-red-800" : "border-stone-400";

  return (
    <button
      onClick={() => onPlayerClick(player)}
      className={`w-full bg-stone-200/50 rounded-lg p-3 shadow-md border-2 ${borderColor} transition-all duration-300 text-left hover:bg-stone-300/50 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-amber-600`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <AvatarDisplay name={player.name} />
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-bold text-red-900 cinzel">
            {player.name}{" "}
            {isYou && <span className="text-sm text-blue-800">{t("you")}</span>}
          </h3>
          <p className="text-xs text-stone-600 mb-2">{`Lvl ${player.level} ${player.race} ${player.class}`}</p>
          <HealthBar hp={player.hp} maxHp={player.maxHp} />
        </div>
      </div>
    </button>
  );
};

const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({
  players,
  currentPlayerIndex,
  clientId,
  onPlayerClick,
}) => {
  const { t } = useLanguage();
  return (
    <div className="border-2 border-stone-400 bg-stone-500/10 p-3 rounded-md shadow-sm h-1/3 flex flex-col">
      <h2 className="text-center text-red-900 cinzel font-bold text-lg mb-2 flex-shrink-0">
        {t("theParty")}
      </h2>
      <div className="space-y-3 flex-grow overflow-y-auto pr-1">
        {players.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            isCurrentTurn={index === currentPlayerIndex}
            isYou={player.id === clientId}
            onPlayerClick={onPlayerClick}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerStatsPanel;
