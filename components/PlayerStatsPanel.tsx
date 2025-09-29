import React from 'react';
import { Player } from '../types';
import { useLanguage } from '../i18n';

interface PlayerStatsPanelProps {
  players: Player[];
  currentPlayerIndex: number;
  clientId: string;
}

const HealthBar: React.FC<{ hp: number; maxHp: number }> = ({ hp, maxHp }) => {
  const percentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const healthColor = percentage > 60 ? 'bg-green-500' : percentage > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex mb-1 items-center justify-between text-xs">
          <span className="font-semibold text-gray-300">HP</span>
          <span className="font-semibold text-gray-300">{hp} / {maxHp}</span>
      </div>
      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
        <div style={{ width: `${percentage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${healthColor}`}></div>
      </div>
    </div>
  );
};

const AvatarDisplay: React.FC<{ avatarUrl?: string, isLoading?: boolean, name: string }> = ({ avatarUrl, isLoading, name }) => {
    return (
        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-900 border-2 border-yellow-400 flex items-center justify-center overflow-hidden shadow-lg">
            {isLoading && <div className="w-6 h-6 border-2 border-gray-500 border-dashed rounded-full animate-spin border-t-transparent"></div>}
            {!isLoading && avatarUrl && <img src={avatarUrl} alt={`Avatar of ${name}`} className="w-full h-full object-cover" />}
            {!isLoading && !avatarUrl && <span className="text-2xl text-gray-600">?</span>}
        </div>
    );
};

const PlayerCard: React.FC<{ player: Player; isCurrentTurn: boolean; isYou: boolean }> = ({ player, isCurrentTurn, isYou }) => {
    const { t } = useLanguage();
    const borderColor = isCurrentTurn ? 'border-yellow-400' : 'border-gray-700';

    return (
        <div className={`bg-gray-800/50 rounded-lg p-3 shadow-md border ${borderColor} transition-all duration-300`}>
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                    <AvatarDisplay avatarUrl={player.avatarUrl} isLoading={player.avatarIsLoading} name={player.name} />
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-yellow-400 cinzel truncate">
                        {player.name} {isYou && <span className="text-sm text-blue-400">{t('you')}</span>}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">{`Lvl ${player.level} ${player.race}`}</p>
                    <HealthBar hp={player.hp} maxHp={player.maxHp} />
                </div>
            </div>
        </div>
    )
}


const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({ players, currentPlayerIndex, clientId }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 shadow-md border border-gray-700">
      <h2 className="text-2xl font-bold text-center mb-4 text-yellow-400 cinzel">{t('theParty')}</h2>
      <div className="space-y-3">
        {players.map((player, index) => (
            <PlayerCard 
                key={player.id} 
                player={player} 
                isCurrentTurn={index === currentPlayerIndex}
                isYou={player.id === clientId} 
            />
        ))}
      </div>
    </div>
  );
};

export default PlayerStatsPanel;