import React from "react";
import { Player, Stats, Skills, SavingThrows, SpellSlots } from "../types";
import { useLanguage } from "../i18n";

interface CharacterSheetProps {
  player: Player;
  onClose: () => void;
}

// --- Helper Functions & Data ---
const getModifier = (score: number) => Math.floor((score - 10) / 2);
const getModifierString = (score: number | undefined) => {
  if (score === undefined) return "+0";
  const mod = getModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};
const PROFICIENCY_BONUS = 2; // Level 1

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
}) => (
  <div className="flex flex-col items-center justify-center border-2 border-stone-500 bg-stone-200/50 rounded-md p-2 text-center shadow-inner">
    <span className="text-3xl font-semibold text-stone-800">{value}</span>
    <span className="text-xs font-bold uppercase text-red-900">
      {getModifierString(value)}
    </span>
    <span className="text-sm uppercase text-stone-700 mt-1">
      {name.substring(0, 3)}
    </span>
  </div>
);

const LabeledStat: React.FC<{
  label: string;
  value: string | number;
  className?: string;
}> = ({ label, value, className }) => (
  <div
    className={`flex flex-col items-center justify-center border-2 border-stone-500 bg-stone-200/50 rounded-md p-2 text-center shadow-inner ${className}`}
  >
    <span className="text-2xl font-semibold text-stone-800">{value}</span>
    <span className="text-xs uppercase text-stone-700 mt-1">{label}</span>
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

  const getArmorClass = () => {
    const baseAC = 10;
    const dexMod = getModifier(player.stats.dexterity);
    const armorBonus = player.equipment?.armor?.armorClass || 0;
    return armorBonus > 0 ? armorBonus : baseAC + dexMod;
  };

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

        {/* Header */}
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
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            <Section title={t("savingThrows")}>
              <div className="space-y-2">
                {STAT_NAMES.map((stat) => {
                  const modifier =
                    getModifier(player.stats[stat]) +
                    (player.savingThrows[stat] ? PROFICIENCY_BONUS : 0);
                  return (
                    <ProficiencyListItem
                      key={stat}
                      label={stat}
                      proficient={player.savingThrows[stat]}
                      modifier={modifier}
                    />
                  );
                })}
              </div>
            </Section>
            <Section title={t("skills")}>
              <div className="space-y-2">
                {SKILL_NAMES.map((skill) => {
                  const modifier =
                    getModifier(player.stats[skill.stat]) +
                    (player.skills[skill.name] ? PROFICIENCY_BONUS : 0);
                  return (
                    <ProficiencyListItem
                      key={skill.name}
                      label={skill.name}
                      proficient={player.skills[skill.name]}
                      modifier={modifier}
                    />
                  );
                })}
              </div>
            </Section>
          </div>

          {/* Center Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {STAT_NAMES.map((stat) => (
                <StatBox key={stat} name={stat} value={player.stats[stat]} />
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
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <LabeledStat label={t("armorClass")} value={getArmorClass()} />
              <LabeledStat
                label={t("initiative")}
                value={getModifierString(player.stats.dexterity)}
              />
              <LabeledStat label={t("speed")} value={`${player.speed}ft`} />
            </div>
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
            <Section title={t("hitDice")}>
              <p className="text-center text-2xl font-bold text-stone-800">{`1${player.hitDice}`}</p>
            </Section>
            <Section title={t("proficienciesAndLanguages")}>
              <p className="text-sm text-stone-700 leading-relaxed">
                <span className="font-bold">Armor/Weapons:</span>{" "}
                {player.proficiencies.join(", ")}
                <br />
                <span className="font-bold">Languages:</span>{" "}
                {player.languages.join(", ")}
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
                        <span className="text-sm font-bold">1st Level</span>
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
