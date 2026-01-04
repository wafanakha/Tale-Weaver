import React, { useRef, useEffect, useState } from "react";
import { StoryLogEntry, DiceRoll, Player } from "../types";
import { useLanguage } from "../i18n";

interface StoryDisplayProps {
  storyLog: StoryLogEntry[];
  currentPlayer?: Player;
  clientId: string;
  onRevealRoll: (entryId: number) => void;
}
const nameToColorClass = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "text-blue-800",
    "text-green-800",
    "text-purple-800",
    "text-orange-800",
  ];
  const index = Math.abs(hash % colors.length);
  return colors[index];
};

const RichText: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-stone-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      })}
    </p>
  );
};

const playDiceSound = (type: "roll" | "land") => {
  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "roll") {
      const duration = 1.0;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(
        300,
        ctx.currentTime + duration
      );

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      for (let t = 0; t < duration; t += 0.08) {
        gain.gain.setValueAtTime(0.04, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + t + 0.04
        );
      }
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + duration);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    console.warn("Audio context failed to start", e);
  }
};

const Dice2D: React.FC<{ value: number; isRolling: boolean }> = ({
  value,
  isRolling,
}) => {
  const [displayValue, setDisplayValue] = useState(value || 20);

  useEffect(() => {
    let interval: number;
    if (isRolling) {
      interval = window.setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 20) + 1);
      }, 80);
    } else {
      setDisplayValue(value);
    }
    return () => clearInterval(interval);
  }, [isRolling, value]);

  return (
    <div
      className={`relative w-24 h-24 flex items-center justify-center transition-transform duration-300 ${
        isRolling ? "animate-dice-shake" : "animate-dice-land"
      }`}
    >
      <style>{`
                @keyframes dice-shake {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(5px, -5px) rotate(5deg); }
                    50% { transform: translate(-5px, 5px) rotate(-5deg); }
                    75% { transform: translate(5px, 5px) rotate(5deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                .animate-dice-shake {
                    animation: dice-shake 0.15s infinite;
                }
                @keyframes dice-land {
                    0% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                .animate-dice-land {
                    animation: dice-land 0.3s ease-out;
                }
            `}</style>

      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        <path
          d="M 50 5 L 95 85 L 5 85 Z"
          fill="#7f1d1d"
          stroke="#fbbf24"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="65"
          textAnchor="middle"
          fill="#fbbf24"
          fontSize="28"
          fontWeight="bold"
          fontFamily="'Cinzel', serif"
        >
          {displayValue}
        </text>
      </svg>
    </div>
  );
};

const DiceRollDisplay: React.FC<{
  roll: DiceRoll;
  entryId: number;
  clientId: string;
  playerName: string;
  onReveal: (id: number) => void;
}> = ({ roll, entryId, clientId, playerName, onReveal }) => {
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if the current client is the one mapped to this roll
  const isMyRoll = roll.rollingPlayerId === clientId;

  const handleRoll = () => {
    if (!isMyRoll || roll.isRevealed || isAnimating) return;
    setIsAnimating(true);
    playDiceSound("roll");

    setTimeout(() => {
      setIsAnimating(false);
      playDiceSound("land");
      onReveal(entryId);
    }, 1200);
  };

  if (roll.isRevealed) {
    const resultClass = roll.success
      ? "text-green-800 drop-shadow-[0_0_8px_rgba(22,101,52,0.4)]"
      : "text-red-800 drop-shadow-[0_0_8px_rgba(153,27,27,0.4)]";
    const resultText = roll.success ? t("success") : t("failure");
    const modifierText =
      roll.modifier >= 0
        ? `+ ${roll.modifier}`
        : `- ${Math.abs(roll.modifier)}`;

    return (
      <div className="bg-stone-300/60 border-2 border-stone-400 rounded-xl p-4 my-6 text-center shadow-lg relative overflow-hidden animate-in zoom-in duration-500">
        <p className="font-bold text-red-900 text-sm uppercase tracking-widest cinzel mb-1 opacity-70">
          {t("skillCheck", { skill: roll.skill })}
        </p>
        <div className="flex justify-center items-center gap-6 my-4">
          <Dice2D value={roll.roll} isRolling={false} />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-stone-700 font-serif">
              <span className="font-bold text-xl">{roll.roll}</span>
              <span className="text-stone-500 font-bold">{modifierText}</span>
              <span className="text-stone-400 font-bold">=</span>
              <span className="font-bold text-4xl text-stone-900 drop-shadow-sm">
                {roll.total}
              </span>
            </div>
            <div className="mt-2">
              <p
                className={`font-black text-2xl cinzel tracking-wider ${resultClass}`}
              >
                {resultText}
              </p>
              <p className="text-xs text-stone-500 font-bold uppercase italic">
                (vs DC {roll.dc})
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-800/90 border-4 border-amber-900 rounded-xl p-8 my-8 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-20 pointer-events-none"></div>
      <p className="font-bold text-amber-200 text-lg uppercase tracking-[0.2em] cinzel mb-8 z-10">
        {roll.skill} Check Needed!
      </p>
      <Dice2D value={1} isRolling={isAnimating} />
      <div className="mt-10 z-10">
        {isMyRoll ? (
          <button
            onClick={handleRoll}
            disabled={isAnimating}
            className={`cinzel text-2xl px-12 py-4 rounded-full font-bold shadow-xl transition-all transform active:scale-95 ${
              isAnimating
                ? "bg-stone-600 text-stone-400 cursor-not-allowed"
                : "bg-red-800 hover:bg-red-700 text-white hover:scale-105 ring-4 ring-red-900/50"
            }`}
          >
            {isAnimating ? "Rolling..." : "ROLL DICE"}
          </button>
        ) : (
          <div className="animate-pulse flex flex-col items-center gap-2">
            <p className="text-amber-100/70 italic text-xl cinzel">
              Waiting for {playerName} to roll...
            </p>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  storyLog,
  currentPlayer,
  clientId,
  onRevealRoll,
}) => {
  const endOfLogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [storyLog]);

  // Defensively handle cases where storyLog might be missing from the state object.
  const safeStoryLog = storyLog || [];

  return (
    <div className="flex-grow bg-stone-200/50 rounded-lg p-4 overflow-y-auto border-2 border-stone-400 shadow-inner h-96 lg:h-auto lg:flex-1 lg:min-h-0">
      <div className="space-y-6">
        {safeStoryLog.map((entry) => {
          switch (entry.speaker) {
            case "story":
              return (
                <div key={entry.id} className="animate-in fade-in duration-700">
                  {entry.diceRoll && (
                    <DiceRollDisplay
                      roll={entry.diceRoll}
                      entryId={entry.id}
                      clientId={clientId}
                      playerName={
                        entry.diceRoll.rollingPlayerId === clientId
                          ? "You"
                          : (entry.diceRoll as any).rolling_player_name ||
                            "Adventurer"
                      }
                      onReveal={onRevealRoll}
                    />
                  )}
                  {(!entry.diceRoll || entry.diceRoll.isRevealed) && (
                    <RichText
                      text={entry.text}
                      className="text-stone-800 leading-relaxed whitespace-pre-wrap first-letter:text-3xl first-letter:font-bold first-letter:text-red-900 first-letter:float-left first-letter:mr-2 first-letter:cinzel"
                    />
                  )}
                </div>
              );
            case "system":
              return (
                <p
                  key={entry.id}
                  className="text-center text-amber-700 text-sm italic"
                >
                  {entry.text}
                </p>
              );
            default: // Player speaker
              const colorClass = nameToColorClass(entry.speaker);
              return (
                <div
                  key={entry.id}
                  className="pl-4 border-l-4 border-stone-400/50 py-1 bg-stone-400/5 rounded-r-lg animate-in slide-in-from-left-2 duration-300"
                >
                  <p
                    className={`font-bold text-xs uppercase tracking-widest cinzel mb-1 ${colorClass}`}
                  >
                    {entry.speaker}
                  </p>
                  <RichText
                    text={entry.text}
                    className="text-stone-700 italic text-sm"
                  />
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
