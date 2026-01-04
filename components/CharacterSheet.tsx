import React from "react";
import {
  Player,
  Stats,
  Skills,
  SavingThrows,
  SpellSlots,
  StatusType,
} from "../types";
import { useLanguage } from "../i18n";

interface CharacterSheetProps {
  player: Player;
  onClose: () => void;
}

const getModifier = (score: number) => Math.floor((score - 10) / 2);
const getModifierString = (score: number | undefined) => {
  if (score === undefined) return "+0";
  const mod = getModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};
const PROFICIENCY_BONUS = 2;

const STAT_NAMES: (keyof Stats)[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];
const SKILL_NAMES: { name: keyof Skills; stat: keyof Stats }[] = [
  { name: "acrobatics", stat: "dexterity" },
  { name: "arcana", stat: "intelligence" },
  { name: "athletics", stat: "strength" },
  { name: "deception", stat: "charisma" },
  { name: "history", stat: "intelligence" },
  { name: "investigation", stat: "intelligence" },
  { name: "perception", stat: "wisdom" },
  { name: "persuasion", stat: "charisma" },
  { name: "stealth", stat: "dexterity" },
];

const StatBox: React.FC<{ name: string; value: number }> = ({
  name,
  value,
}) => {
  const modStr = getModifierString(value);
  const tooltip = `Score ${value}, Modifier ${modStr}`;

  return (
    <div
      className="flex flex-col items-center justify-center border-2 border-stone-500 bg-stone-200/50 rounded-md p-2 text-center shadow-inner cursor-help transition-colors hover:bg-stone-300/50"
      title={tooltip}
    >
      <span className="text-3xl font-semibold text-stone-800">{value}</span>
      <span className="text-xs font-bold uppercase text-red-900">{modStr}</span>
      <span className="text-sm uppercase text-stone-700 mt-1">
        {name.substring(0, 3)}
      </span>
    </div>
  );
};

const LabeledStat: React.FC<{
  label: string;
  value: string | number;
  className?: string;
  tooltip?: string;
  highlight?: boolean;
}> = ({ label, value, className, tooltip, highlight }) => (
  <div
    className={`flex flex-col items-center justify-center border-2 ${
      highlight
        ? "border-red-800 bg-red-900/10 shadow-[0_0_10px_rgba(153,27,27,0.2)]"
        : "border-stone-500 bg-stone-200/50 shadow-inner"
    } rounded-md p-3 text-center transition-colors ${
      tooltip ? "cursor-help hover:bg-stone-300/50" : ""
    } ${className}`}
    title={tooltip}
  >
    <span
      className={`text-4xl font-bold ${
        highlight ? "text-red-900" : "text-stone-800"
      }`}
    >
      {value}
    </span>
    <span className="text-xs font-bold uppercase text-stone-600 mt-1 tracking-widest">
      {label}
    </span>
  </div>
);

const ProficiencyListItem: React.FC<{
  label: string;
  proficient: boolean;
  modifier: number;
}> = ({ label, proficient, modifier }) => (
  <div className="flex items-center gap-2 text-sm">
    <span
      className={`w-4 h-4 rounded-full border-2 ${
        proficient ? "bg-stone-700 border-stone-800" : "border-stone-500"
      }`}
    />
    <span className="font-semibold">
      {modifier >= 0 ? `+${modifier}` : modifier}
    </span>
    <span className="capitalize text-stone-600">
      {label.replace(/([A-Z])/g, " $1")}
    </span>
  </div>
);

const SpellSlotTracker: React.FC<{
  slots: { total: number; used: number };
}> = ({ slots }) => {
  return (
    <div className="flex items-center gap-2">
      {[...Array(slots.total)].map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 border-stone-600 ${
            i < slots.used ? "bg-stone-700" : "bg-stone-200"
          }`}
          aria-label={`Spell slot ${i + 1} of ${slots.total}, ${
            i < slots.used ? "used" : "available"
          }`}
        />
      ))}
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="border-2 border-stone-400 bg-stone-500/10 p-3 rounded-md shadow-sm">
    <h3 className="text-center text-red-900 cinzel font-bold text-lg mb-2">
      {title}
    </h3>
    {children}
  </div>
);

const CharacterSheet: React.FC<CharacterSheetProps> = ({ player, onClose }) => {
  const { t } = useLanguage();

  // SAFETY CHECK: Ensure stats exist before accessing properties
  const stats = player.stats || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  const dexMod = getModifier(stats.dexterity);
  const initiativeBonus = player.initiativeBonus || 0;
  const initiativeTotal = dexMod + initiativeBonus;
  const initiativeDisplay =
    initiativeTotal >= 0 ? `+${initiativeTotal}` : initiativeTotal;

  const getArmorClass = () => {
    const baseAC = 10;
    const armorBonus = player.equipment?.armor?.armorClass || 0;
    return armorBonus > 0 ? armorBonus : baseAC + dexMod;
  };

  const acTooltip = player.equipment?.armor
    ? `Armor (${player.equipment.armor.name}): ${player.equipment.armor.armorClass}`
    : `Unarmored: 10 (Base) + ${getModifierString(stats.dexterity)} (Dex)`;

  const initTooltip = `Initiative: ${getModifierString(
    stats.dexterity
  )} (Dex) ${initiativeBonus !== 0 ? `+ ${initiativeBonus} (Misc)` : ""}`;

  const spellSlots = player.spellSlots || {};
  const hasSpellSlots = Object.keys(spellSlots).length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="character-sheet-title"
    >
      <div
        className="bg-[#f3e9d2] text-stone-800 rounded-lg shadow-2xl max-w-4xl w-full h-full max-h-[95vh] overflow-y-auto p-4 relative border-4 border-double border-amber-800 font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 cinzel text-stone-100 bg-red-800 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-bold"
          aria-label="Close"
        >
          X
        </button>

        <header className="border-b-4 border-double border-amber-800 pb-2 mb-4">
          <h1
            id="character-sheet-title"
            className="text-5xl medieval text-red-900 text-center"
          >
            {player.name}
          </h1>
          <div className="flex justify-center items-center gap-x-4 gap-y-1 text-sm text-stone-600 mt-1 flex-wrap">
            <span>
              Lvl {player.level} {player.race} {player.class}
            </span>
            <span className="hidden sm:inline">|</span>
            <span>{player.background}</span>
          </div>

          <div className="flex justify-center gap-6 mt-6 pb-2">
            <LabeledStat
              label={t("armorClass")}
              value={getArmorClass()}
              tooltip={acTooltip}
              className="w-32"
            />
            <LabeledStat
              label={t("initiative")}
              value={initiativeDisplay}
              tooltip={initTooltip}
              highlight
              className="w-32"
            />
            <LabeledStat
              label={t("speed")}
              value={`${player.speed}ft`}
              className="w-32"
            />
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-4">
            <Section title={t("savingThrows")}>
              <div className="space-y-2">
                {STAT_NAMES.map((stat) => {
                  // FIX: Gunakan optional chaining (?.) dan default value (|| false)
                  const statValue = stats[stat];
                  const isProficient = player.savingThrows?.[stat] || false;

                  const modifier =
                    getModifier(statValue) +
                    (isProficient ? PROFICIENCY_BONUS : 0);
                  return (
                    <ProficiencyListItem
                      key={stat}
                      label={stat}
                      proficient={isProficient}
                      modifier={modifier}
                    />
                  );
                })}
              </div>
            </Section>
            <Section title={t("skills")}>
              <div className="space-y-2">
                {SKILL_NAMES.map((skill) => {
                  // FIX: Gunakan optional chaining (?.) dan default value (|| false)
                  const statValue = stats[skill.stat];
                  const isProficient = player.skills?.[skill.name] || false;

                  const modifier =
                    getModifier(statValue) +
                    (isProficient ? PROFICIENCY_BONUS : 0);
                  return (
                    <ProficiencyListItem
                      key={skill.name}
                      label={skill.name}
                      proficient={isProficient}
                      modifier={modifier}
                    />
                  );
                })}
              </div>
            </Section>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {STAT_NAMES.map((stat) => (
                <StatBox key={stat} name={stat} value={stats[stat]} />
              ))}
            </div>
            <div className="border-2 border-stone-400 bg-stone-500/10 p-3 rounded-md shadow-sm text-center">
              <h3 className="text-center text-red-900 cinzel font-bold text-lg">
                Proficiency Bonus
              </h3>
              <p className="text-3xl font-semibold text-stone-800">
                +{PROFICIENCY_BONUS}
              </p>
            </div>
            {player.statusEffects && player.statusEffects.length > 0 && (
              <Section title={t("activeEffects")}>
                <div className="space-y-2">
                  {player.statusEffects.map((eff, idx) => (
                    <div
                      key={`${eff.name}-${idx}`}
                      className="flex items-center gap-2 p-2 bg-stone-300/30 rounded border border-stone-400/50"
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          eff.type === StatusType.BUFF
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-bold leading-tight">
                          {eff.name} {eff.icon}
                        </p>
                        <p className="text-xs text-stone-600 italic">
                          {eff.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-4">
            <Section title={t("hitPoints")}>
              <div className="flex justify-around items-center">
                <div>
                  <span className="text-xs uppercase text-stone-700">
                    {t("current")}:
                  </span>{" "}
                  <span className="text-2xl font-bold">{player.hp}</span>
                </div>
                <div>
                  <span className="text-xs uppercase text-stone-700">
                    {t("max")}:
                  </span>{" "}
                  <span className="text-2xl font-bold">{player.maxHp}</span>
                </div>
              </div>
            </Section>
            <Section title="Experience Points">
              <div className="flex flex-col items-center">
                <div className="flex justify-around w-full items-center mb-1">
                  <div>
                    <span className="text-xs uppercase text-stone-700">
                      XP:
                    </span>{" "}
                    <span className="text-xl font-bold">{player.xp}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-stone-700">
                      NEXT:
                    </span>{" "}
                    <span className="text-xl font-bold">{player.maxXp}</span>
                  </div>
                </div>
                <div className="w-full bg-stone-300 h-2 rounded overflow-hidden shadow-inner">
                  <div
                    className="bg-amber-600 h-full transition-all duration-700"
                    style={{ width: `${(player.xp / player.maxXp) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Section>
            <Section title={t("hitDice")}>
              <p className="text-center text-2xl font-bold text-stone-800">{`1${player.hitDice}`}</p>
            </Section>
            <Section title={t("proficienciesAndLanguages")}>
              <p className="text-sm text-stone-700 leading-relaxed">
                <span className="font-bold">Armor/Weapons:</span>{" "}
                {player.proficiencies?.join(", ") || t("none")}
                <br />
                <span className="font-bold">Languages:</span>{" "}
                {player.languages?.join(", ") || t("none")}
              </p>
            </Section>
            <Section title={t("attacksAndSpellcasting")}>
              <div className="text-sm text-stone-700 space-y-2">
                <div>
                  <p>
                    <span className="font-bold">{t("weapon")}:</span>{" "}
                    {player.equipment?.weapon?.name || t("none")}
                  </p>
                  <p>
                    <span className="font-bold">{t("armor")}:</span>{" "}
                    {player.equipment?.armor?.name || t("none")}
                  </p>
                </div>
                {player.combatSkills && player.combatSkills.length > 0 && (
                  <div className="border-t border-stone-400 pt-2">
                    <p className="font-bold">{t("combatSkills")}:</p>
                    <ul className="list-disc list-inside pl-2">
                      {player.combatSkills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>
            {hasSpellSlots && (
              <Section title={t("spellSlots")}>
                <div className="space-y-2">
                  {Object.keys(spellSlots)
                    .sort()
                    .map((level) => (
                      <div
                        key={level}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm font-bold">
                          {level === "1"
                            ? "1st"
                            : level === "2"
                            ? "2nd"
                            : level === "3"
                            ? "3rd"
                            : `${level}th`}{" "}
                          Level
                        </span>
                        <SpellSlotTracker slots={spellSlots[Number(level)]} />
                      </div>
                    ))}
                </div>
              </Section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CharacterSheet;
