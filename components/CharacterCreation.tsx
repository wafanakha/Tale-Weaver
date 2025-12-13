import React, { useState, useMemo } from "react";
import { generateCharacterBackstory } from "../services/AIService";
import { Stats, Skills, SavingThrows, SpellSlots } from "../types";
import { useLanguage } from "../i18n";


export interface CharacterDetails {
  name: string;
  race: string;
  class: string;
  background: string;
  backstory: string;
  stats: Stats;
  skills: Skills;
  savingThrows: SavingThrows;
  combatSkills: string[];
  proficiencies: string[];
  languages: string[];
  speed: number;
  hitDice: string;
  spellSlots: SpellSlots;
}

interface CharacterCreationProps {
  onCharacterCreate: (details: CharacterDetails) => void;
  onCancel: () => void;
}

const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Orc"];
const CLASSES = ["Cleric", "Fighter", "Thief", "Wizard"];
const BACKGROUNDS = ["Noble", "Rogue", "Scholar", "Soldier", "Outcast"];
const STAT_NAMES: (keyof Stats)[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const CLASS_DATA: {
  [key: string]: {
    hitDice: string;
    savingThrows: (keyof SavingThrows)[];
    proficiencies: string[];
    combatSkills: string[];
    spellSlots?: SpellSlots;
  };
} = {
  Cleric: {
    hitDice: "1d8",
    savingThrows: ["wisdom", "charisma"],
    proficiencies: ["Light armor", "Medium armor", "Shields", "Simple weapons"],
    combatSkills: ["Sacred Flame", "Guiding Bolt"],
    spellSlots: { 1: { total: 2, used: 0 } },
  },
  Fighter: {
    hitDice: "1d10",
    savingThrows: ["strength", "constitution"],
    proficiencies: [
      "All armor",
      "Shields",
      "Simple weapons",
      "Martial weapons",
    ],
    combatSkills: ["Second Wind", "Power Attack"],
  },
  Thief: {
    hitDice: "1d8",
    savingThrows: ["dexterity", "intelligence"],
    proficiencies: [
      "Light armor",
      "Simple weapons",
      "Hand crossbows",
      "Longswords",
      "Rapiers",
      "Shortswords",
    ],
    combatSkills: ["Sneak Attack", "Precise Strike"],
  },
  Wizard: {
    hitDice: "1d6",
    savingThrows: ["intelligence", "wisdom"],
    proficiencies: [
      "Daggers",
      "Darts",
      "Slings",
      "Quarterstaffs",
      "Light crossbows",
    ],
    combatSkills: ["Fire Bolt", "Magic Missile"],
    spellSlots: { 1: { total: 2, used: 0 } },
  },
};

const RACE_DATA: { [key: string]: { speed: number; languages: string[] } } = {
  Human: { speed: 30, languages: ["Common", "One extra"] },
  Elf: { speed: 30, languages: ["Common", "Elvish"] },
  Dwarf: { speed: 25, languages: ["Common", "Dwarvish"] },
  Halfling: { speed: 25, languages: ["Common", "Halfling"] },
  Orc: { speed: 30, languages: ["Common", "Orcish"] },
};

const BACKGROUND_SKILLS: { [key: string]: (keyof Skills)[] } = {
  Noble: ["persuasion", "history"],
  Rogue: ["stealth", "deception"],
  Scholar: ["arcana", "investigation"],
  Soldier: ["athletics", "perception"],
  Outcast: ["stealth", "perception"],
};

const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onCharacterCreate,
  onCancel,
}) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState("");
  const [race, setRace] = useState("Human");
  const [charClass, setCharClass] = useState("Fighter");
  const [background, setBackground] = useState("Soldier");
  const [backstory, setBackstory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<Partial<Stats>>({});

  const unassignedScores = useMemo(() => {
    const assigned = Object.values(stats);
    const counts = assigned.reduce((acc, score) => {
      if (typeof score === "number") {
        acc[score] = (acc[score] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    return STANDARD_ARRAY.filter((score) => {
      const standardCount = STANDARD_ARRAY.filter((s) => s === score).length;
      const assignedCount = counts[score] || 0;
      return assignedCount < standardCount;
    });
  }, [stats]);

  const handleStatChange = (stat: keyof Stats, value: string) => {
    const score = parseInt(value, 10);
    const newStats = { ...stats };

    const oldScore = newStats[stat];
    if (oldScore) {
      delete newStats[stat];
    }

    if (!isNaN(score)) {
      newStats[stat] = score;
    }

    setStats(newStats);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name ||
      !race ||
      !background ||
      !charClass ||
      Object.keys(stats).length !== 6
    ) {
      alert(
        "Please fill out your name, race, class, background, and assign all stats."
      );
      return;
    }
    setIsSubmitting(true);

    const classInfo = CLASS_DATA[charClass];
    const raceInfo = RACE_DATA[race];

    const finalSkills: Skills = {
      athletics: false,
      acrobatics: false,
      stealth: false,
      arcana: false,
      history: false,
      investigation: false,
      perception: false,
      persuasion: false,
      deception: false,
    };
    BACKGROUND_SKILLS[background]?.forEach((skill) => {
      finalSkills[skill] = true;
    });

    const finalSavingThrows: SavingThrows = {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false,
    };
    classInfo.savingThrows.forEach((st) => {
      finalSavingThrows[st] = true;
    });

    onCharacterCreate({
      name,
      race,
      class: charClass,
      background,
      backstory,
      stats: stats as Stats,
      skills: finalSkills,
      savingThrows: finalSavingThrows,
      combatSkills: classInfo.combatSkills,
      proficiencies: classInfo.proficiencies,
      languages: raceInfo.languages,
      speed: raceInfo.speed,
      hitDice: classInfo.hitDice,
      spellSlots: classInfo.spellSlots || {},
    });
  };

  const handleGenerateBackstory = async () => {
    if (!race || !background) {
      alert("Please select a race and background first.");
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await generateCharacterBackstory(
        race,
        background,
        language
      );
      setBackstory(generated);
    } catch (error) {
      console.error(error);
      alert("Failed to generate backstory. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formIsInvalid =
    !name ||
    !race ||
    !background ||
    !charClass ||
    isSubmitting ||
    Object.keys(stats).length !== 6;
const labelClass = "block text-lg font-semibold mb-2 cinzel text-red-900 text-glow";
  const statLabelClass = "block text-sm font-bold text-red-900 text-glow"; 
  const inactiveButtonClass = "bg-stone-600 text-stone-100 hover:bg-stone-700";
  const activeButtonClass = "bg-red-800 text-white font-bold";
  const inputStyleBase = "w-full bg-stone-100/70 border-2 border-stone-700/50 rounded-xl shadow-inner focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-stone-800 placeholder-stone-600";
  const inputBaseClass = `${inputStyleBase} p-3`;
  const selectBaseClass = `${inputStyleBase} p-2 mt-1`; 
  const textAreaClass = `${inputStyleBase} p-3`;
  const cancelLinkClass = "cinzel text-md text-stone-700 hover:text-stone-900 transition underline text-glow";
  const genButtonClass = "cinzel text-sm bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-stone-500 disabled:cursor-not-allowed";

  
  const tooltipStyle = `
    absolute hidden group-hover:block 
    top-full mt-2 
    w-64 max-w-xs p-3 bg-stone-800 text-white 
    rounded-lg shadow-lg z-50
    font-normal normal-case text-sm
    pointer-events-none
    opacity-0 group-hover:opacity-100
    transition-opacity duration-200 delay-200
  `;

  
  const getButtonTooltipPosition = (name: string) => {
    switch (name) {
      
      case "Human":
      case "Elf": 
      case "Orc":
      case "Cleric":
      case "Noble":
      case "Outcast":
        return "left-0"; 

      
      case "Halfling":
      case "Wizard":
      case "Soldier":
        return "right-0"; 

      
      default:
        return "left-1/2 -translate-x-1/2"; 
    }
  };


  return (
    <div className="h-screen w-screen welcome-bg text-stone-800 flex flex-col items-center justify-center p-4">
      <div className="content-frame relative p-8 sm:p-12 shadow-2xl max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-red-900 mb-6 cinzel text-center text-glow">
          {t("createAdventurer")}
        </h1>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-4"
        >
          {/* === Layout Grid 2 Kolom === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* --- Kolom Kiri --- */}
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className={labelClass}>
                  {t("name")}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputBaseClass}
                  placeholder={t("characterNamePlaceholder")}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  {t("race")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* --- Menerapkan fungsi helper posisi yang baru --- */}
                  {RACES.map((r) => {
                    const positionClass = getButtonTooltipPosition(r);
                    return (
                      <div key={r} className="relative group">
                        <button
                          type="button"
                          onClick={() => setRace(r)}
                          className={`px-4 py-2 rounded-md text-sm transition-colors ${
                            race === r ? activeButtonClass : inactiveButtonClass
                          }`}
                        >
                          {r}
                        </button>
                        <div className={`${tooltipStyle} ${positionClass}`}>
                          {t(`race${r}Description`)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* --- Kolom Kanan --- */}
            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  {t("class")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* --- Menerapkan fungsi helper posisi yang baru --- */}
                  {CLASSES.map((c) => {
                    const positionClass = getButtonTooltipPosition(c);
                    return (
                      <div key={c} className="relative group">
                        <button
                          type="button"
                          onClick={() => setCharClass(c)}
                          className={`px-4 py-2 rounded-md text-sm transition-colors ${
                            charClass === c ? activeButtonClass : inactiveButtonClass
                          }`}
                        >
                          {c}
                        </button>
                        <div className={`${tooltipStyle} ${positionClass}`}>
                          {t(`class${c}Description`)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  {t("background")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* --- Menerapkan fungsi helper posisi yang baru --- */}
                  {BACKGROUNDS.map((b) => {
                    const positionClass = getButtonTooltipPosition(b);
                    return (
                      <div key={b} className="relative group">
                        <button
                          type="button"
                          key={b}
                          onClick={() => setBackground(b)}
                          className={`px-4 py-2 rounded-md text-sm transition-colors ${
                            background === b ? activeButtonClass : inactiveButtonClass
                          }`}
                        >
                          {b}
                        </button>
                        <div className={`${tooltipStyle} ${positionClass}`}>
                          {t(`bg${b}Description`)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* --- Bagian Bawah (Full Width) --- */}
          <div>
            <label className={labelClass}>
              {t("assignStats")}
            </label>
            <p className="text-sm text-stone-900 mb-2 text-glow">
              {t("assignStatsDesc", { scores: STANDARD_ARRAY.join(", ") })}
            </p>
            
            {/* Tooltip untuk Stats (tetap di atas) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {STAT_NAMES.map((stat, index) => {
                
                const getTooltipPosition = (index: number) => {
                  const totalItems = STAT_NAMES.length;
                  if (index < 2) {
                    return "left-0";
                  }
                  if (index >= totalItems - 2) {
                    return "right-0";
                  }
                  return "left-1/2 -translate-x-1/2";
                };
                const tooltipPositionClass = getTooltipPosition(index);

                return (
                  <div key={stat} className="relative">
                    <label
                      htmlFor={stat}
                      className={`${statLabelClass} flex items-center gap-1.5 group`}
                    >
                      <span className="capitalize">{stat}</span> 
                      <span 
                        className="
                          cursor-help text-[#4f1b17]
                          border border-[#4f1b17]
                          rounded-full 
                          w-4 h-4 
                          flex items-center justify-center 
                          text-xs 
                          font-mono
                          group-hover:bg-[#4f1b17] group-hover:text-stone-100
                          transition-colors
                        "
                      >
                        i
                      </span>
                      
                      {/* Tooltip STATS masih menggunakan 'bottom-full' */}
                      <div 
                        className={`
                          absolute hidden group-hover:block 
                          bottom-full mb-2 
                          w-64 max-w-xs p-3 bg-stone-800 text-white 
                          rounded-lg shadow-lg z-50
                          font-normal normal-case text-sm
                          pointer-events-none
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-200 delay-200
                          ${tooltipPositionClass} 
                        `}
                      >
                        {t(`${stat}Description`)}
                      </div>
                    </label>

                    <select
                      id={stat}
                      value={stats[stat] || ""}
                      onChange={(e) => handleStatChange(stat, e.target.value)}
                      className={selectBaseClass} 
                    >
                      <option style={{ backgroundColor: '#f5f5f4', color: '#292524' }} value="">-</option>
                      {stats[stat] && (
                        <option style={{ backgroundColor: '#f5f5f4', color: '#292524' }} value={stats[stat]}>{stats[stat]}</option>
                     )}
                      {unassignedScores.map((score, index) => (
                        <option style={{ backgroundColor: '#f5f5f4', color: '#292524' }} key={`${score}-${index}`} value={score}>
                          {score}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="backstory" className={labelClass}>
              {t("backstory")}
            </label>
            <textarea
              id="backstory"
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              className={textAreaClass}
              rows={3}
              placeholder={t("backstoryPlaceholder")}
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleGenerateBackstory}
                disabled={!race || !background || isGenerating}
                className={genButtonClass}
              >
                {isGenerating ? t("generating") : t("generateWithAi")}
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className={cancelLinkClass}
            >
              {t("cancel")}
            </button>
            
            <button
              type="submit"
              disabled={formIsInvalid}
              className="
                font-cinzel text-lg font-bold text-white
                bg-gradient-to-b from-yellow-600 to-yellow-800
                border-2 border-yellow-400
                rounded-lg px-8 py-3
                shadow-lg shadow-black/30
                hover:from-yellow-500 hover:to-yellow-700
                hover:shadow-xl
                transition-all duration-300 ease-in-out
                transform hover:scale-105
              " 
            >
              {isSubmitting ? t("addingToParty") : t("createCharacter")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterCreation;