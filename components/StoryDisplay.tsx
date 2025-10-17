import React, { useRef, useEffect } from "react";
import { StoryLogEntry, DiceRoll } from "../types";
import { useLanguage } from "../i18n";

interface StoryDisplayProps {
  storyLog: StoryLogEntry[];
}

const nameToColorClass = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "text-blue-400",
    "text-green-400",
    "text-purple-400",
    "text-orange-400",
  ];
  const index = Math.abs(hash % colors.length);
  return colors[index];
};

const DiceRollDisplay: React.FC<{ roll: DiceRoll }> = ({ roll }) => {
  const { t } = useLanguage();
  const resultClass = roll.success ? "text-green-400" : "text-red-400";
  const resultText = roll.success ? t("success") : t("failure");
  const modifierText =
    roll.modifier >= 0 ? `+ ${roll.modifier}` : `- ${Math.abs(roll.modifier)}`;

  return (
    <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3 my-4 text-center">
      <p className="font-bold text-yellow-400 text-lg cinzel">
        {t("skillCheck", { skill: roll.skill })}
      </p>
      <div className="flex justify-center items-center gap-2 my-2 text-gray-300">
        <span>🎲{roll.roll}</span>
        <span>{modifierText}</span>
        <span>=</span>
        <span className="font-bold text-xl text-white">{roll.total}</span>
        <span className="text-gray-500">(vs DC {roll.dc})</span>
      </div>
      <p className={`font-bold text-lg ${resultClass}`}>{resultText}</p>
    </div>
  );
};

const StoryDisplay: React.FC<StoryDisplayProps> = ({ storyLog }) => {
  const endOfLogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [storyLog]);

  // Defensively handle cases where storyLog might be missing from the state object.
  const safeStoryLog = storyLog || [];

  return (
    <div className="flex-grow bg-black/30 rounded-lg p-4 overflow-y-auto border border-gray-700 h-96 lg:h-auto">
      <div className="space-y-6">
        {safeStoryLog.map((entry) => {
          switch (entry.speaker) {
            case "story":
              return (
                <div key={entry.id}>
                  {entry.diceRoll && <DiceRollDisplay roll={entry.diceRoll} />}
                  <p className="text-gray-300 leading-relaxed">{entry.text}</p>
                </div>
              );
            case "system":
              return (
                <p
                  key={entry.id}
                  className="text-center text-yellow-400 text-sm italic"
                >
                  {entry.text}
                </p>
              );
            default: // Player speaker
              const colorClass = nameToColorClass(entry.speaker);
              return (
                <div key={entry.id} className="pl-2 border-l-2 border-gray-600">
                  <p className={`font-bold ${colorClass}`}>{entry.speaker}:</p>
                  <p className="text-gray-300 italic">{entry.text}</p>
                </div>
              );
          }
        })}
        <div ref={endOfLogRef} />
      </div>
    </div>
  );
};

export default StoryDisplay;
