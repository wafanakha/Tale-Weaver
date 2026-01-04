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

// --- D&D 5e Standard Data ---

const RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Dragonborn",
  "Gnome",
  "Half-Elf",
  "Half-Orc",
  "Tiefling",
];

const CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
];

const BACKGROUNDS = [
  "Acolyte",
  "Charlatan",
  "Criminal",
  "Entertainer",
  "Folk Hero",
  "Guild Artisan",
  "Hermit",
  "Noble",
  "Outlander",
  "Sage",
  "Sailor",
  "Soldier",
  "Urchin",
];

const STAT_NAMES: (keyof Stats)[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

// Mapping Data sesuai SRD 5e
const CLASS_DATA: {
  [key: string]: {
    hitDice: string;
    savingThrows: (keyof SavingThrows)[];
    proficiencies: string[];
    combatSkills: string[];
    spellSlots?: SpellSlots;
  };
} = {
  Barbarian: {
    hitDice: "1d12",
    savingThrows: ["strength", "constitution"],
    proficiencies: [
      "Light armor",
      "Medium armor",
      "Shields",
      "Simple weapons",
      "Martial weapons",
    ],
    combatSkills: ["Rage", "Unarmored Defense"],
  },
  Bard: {
    hitDice: "1d8",
    savingThrows: ["dexterity", "charisma"],
    proficiencies: [
      "Light armor",
      "Simple weapons",
      "Hand crossbows",
      "Longswords",
      "Rapiers",
      "Shortswords",
    ],
    combatSkills: ["Bardic Inspiration", "Vicious Mockery"],
    spellSlots: { 1: { total: 2, used: 0 } },
  },
  Cleric: {
    hitDice: "1d8",
    savingThrows: ["wisdom", "charisma"],
    proficiencies: ["Light armor", "Medium armor", "Shields", "Simple weapons"],
    combatSkills: ["Sacred Flame", "Guiding Bolt"],
    spellSlots: { 1: { total: 2, used: 0 } },
  },
  Druid: {
    hitDice: "1d8",
    savingThrows: ["intelligence", "wisdom"],
    proficiencies: [
      "Light armor",
      "Medium armor (non-metal)",
      "Shields (non-metal)",
      "Simple weapons",
    ],
    combatSkills: ["Druidic", "Shillelagh"],
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
    combatSkills: ["Second Wind", "Fighting Style"],
  },
  Monk: {
    hitDice: "1d8",
    savingThrows: ["strength", "dexterity"],
    proficiencies: ["Simple weapons", "Shortswords"],
    combatSkills: ["Martial Arts", "Unarmored Defense"],
  },
  Paladin: {
    hitDice: "1d10",
    savingThrows: ["wisdom", "charisma"],
    proficiencies: [
      "All armor",
      "Shields",
      "Simple weapons",
      "Martial weapons",
    ],
    combatSkills: ["Divine Sense", "Lay on Hands"],
  },
  Ranger: {
    // Menggantikan Archer
    hitDice: "1d10",
    savingThrows: ["strength", "dexterity"],
    proficiencies: [
      "Light armor",
      "Medium armor",
      "Shields",
      "Simple weapons",
      "Martial weapons",
    ],
    combatSkills: ["Favored Enemy", "Natural Explorer"],
  },
  Rogue: {
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
    combatSkills: ["Sneak Attack", "Thieves' Cant"],
  },
  Sorcerer: {
    hitDice: "1d6",
    savingThrows: ["constitution", "charisma"],
    proficiencies: [
      "Daggers",
      "Darts",
      "Slings",
      "Quarterstaffs",
      "Light crossbows",
    ],
    combatSkills: ["Sorcerous Origin", "Chaos Bolt"],
    spellSlots: { 1: { total: 2, used: 0 } },
  },
  Warlock: {
    hitDice: "1d8",
    savingThrows: ["wisdom", "charisma"],
    proficiencies: ["Light armor", "Simple weapons"],
    combatSkills: ["Eldritch Blast", "Pact Magic"],
    spellSlots: { 1: { total: 1, used: 0 } },
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
    combatSkills: ["Arcane Recovery", "Magic Missile"],
    spellSlots: { 1: { total: 2, used: 0 } },
  },
};

const RACE_DATA: { [key: string]: { speed: number; languages: string[] } } = {
  Human: { speed: 30, languages: ["Common", "One Extra"] },
  Elf: { speed: 30, languages: ["Common", "Elvish"] },
  Dwarf: { speed: 25, languages: ["Common", "Dwarvish"] },
  Halfling: { speed: 25, languages: ["Common", "Halfling"] },
  Dragonborn: { speed: 30, languages: ["Common", "Draconic"] },
  Gnome: { speed: 25, languages: ["Common", "Gnomish"] },
  "Half-Elf": { speed: 30, languages: ["Common", "Elvish", "One Extra"] },
  "Half-Orc": { speed: 30, languages: ["Common", "Orcish"] },
  Tiefling: { speed: 30, languages: ["Common", "Infernal"] },
};

// Skill mapping disesuaikan dengan Interface "Skills" yang tersedia di kode Anda
// (athletics, acrobatics, stealth, arcana, history, investigation, perception, persuasion, deception)
const BACKGROUND_SKILLS: { [key: string]: (keyof Skills)[] } = {
  Acolyte: ["history", "persuasion"], // Insight/Religion (Mapped to available)
  Charlatan: ["deception", "stealth"], // Deception/Sleight of Hand
  Criminal: ["deception", "stealth"],
  Entertainer: ["acrobatics", "persuasion"], // Acrobatics/Performance
  "Folk Hero": ["athletics", "perception"], // Animal Handling/Survival (Mapped to available)
  "Guild Artisan": ["persuasion", "investigation"], // Insight/Persuasion
  Hermit: ["arcana", "history"], // Medicine/Religion (Mapped to available)
  Noble: ["history", "persuasion"],
  Outlander: ["athletics", "perception"], // Survival/Athletics
  Sage: ["arcana", "history"],
  Sailor: ["athletics", "perception"],
  Soldier: ["athletics", "persuasion"], // Intimidation (Mapped to Persuasion)
  Urchin: ["stealth", "deception"], // Sleight of Hand (Mapped to Deception)
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
    if (!name || !race || !background) {
      alert("Please enter a name, and select a race and background first.");
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await generateCharacterBackstory(
        name,
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

  // Styles
  const labelClass =
    "block text-lg font-semibold mb-2 cinzel text-red-900 text-glow";
  const statLabelClass = "block text-sm font-bold text-red-900 text-glow";
  const inactiveButtonClass = "bg-stone-600 text-stone-100 hover:bg-stone-700";
  const activeButtonClass = "bg-red-800 text-white font-bold";
  const inputStyleBase =
    "w-full bg-stone-100/70 border-2 border-stone-700/50 rounded-xl shadow-inner focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none text-stone-800 placeholder-stone-600";
  const inputBaseClass = `${inputStyleBase} p-3`;
  const selectBaseClass = `${inputStyleBase} p-2 mt-1`;
  const textAreaClass = `${inputStyleBase} p-3`;
  const cancelLinkClass =
    "cinzel text-md text-stone-700 hover:text-stone-900 transition underline text-glow";
  const genButtonClass =
    "cinzel text-sm bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-stone-500 disabled:cursor-not-allowed";

  // ... state lainnya (name, race, charClass, dll)

  // State untuk melacak hover. Jika null, kita tampilkan deskripsi item yang 'Selected'.
  const [hoveredRace, setHoveredRace] = useState(null);
  const [hoveredClass, setHoveredClass] = useState(null);
  const [hoveredBackground, setHoveredBackground] = useState(null);
  // Komponen UI untuk Kotak Deskripsi (Sesuai Gambar)
  const InfoCard = ({ title, description, defaultText, type }) => {
    // Jika tidak ada data (tidak di-hover dan tidak ada yang dipilih)
    if (!title && !description) {
      return (
        <div className="mt-3 p-4 bg-stone-900/40 rounded-lg border-2 border-dashed border-stone-600/50 min-h-[140px] flex flex-col items-center justify-center text-stone-500 italic text-sm transition-all duration-300">
          <span className="opacity-50 text-2xl mb-2">?</span>
          {defaultText}
        </div>
      );
    }

    // Tampilan Box RPG
    return (
      <div className="mt-3 relative overflow-hidden rounded-lg border-2 border-stone-600 bg-stone-800 shadow-inner min-h-[140px] transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Dekorasi sudut (opsional untuk estetika RPG) */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-600/50 rounded-tl-sm"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-600/50 rounded-tr-sm"></div>

        <div className="p-4">
          {/* Label Kecil di atas (Misal: RACE, CLASS) */}
          <div className="text-[10px] tracking-widest uppercase text-stone-500 font-bold mb-1">
            {type}
          </div>

          {/* Judul (Warna Emas/Kuning) */}
          <h4 className="text-xl font-bold text-yellow-500 mb-3 font-cinzel border-b border-stone-600 pb-2">
            {title}
          </h4>

          {/* Deskripsi */}
          <p className="text-sm leading-relaxed text-stone-300 font-sans">
            {description}
          </p>
        </div>
      </div>
    );
  };
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

  // Helper untuk mengatur posisi tooltip agar tidak keluar layar
  const getButtonTooltipPosition = (index: number, total: number) => {
    // Jika item berada di kolom paling kiri (asumsi visual grid), tooltip ke kanan/kiri bisa diatur
    // Sederhananya: Item awal -> left-0, Item akhir -> right-0
    if (index === 0) return "left-0";
    if (index === total - 1) return "right-0";
    return "left-1/2 -translate-x-1/2";
  };

  return (
    <div className="h-screen w-screen welcome-bg text-stone-800 flex flex-col items-center justify-center p-4">
      <div className="content-frame relative p-8 sm:p-12 shadow-2xl max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-red-900 mb-6 cinzel text-center text-glow">
          {t("createAdventurer")}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar"
        >
          {/* === Layout Grid 2 Kolom === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
            {/* --- KOLOM KIRI (NAMA & RAS) --- */}
            <div className="space-y-6">
              {/* Input Nama */}
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

              {/* Pilihan Ras */}
              <div>
                <label className={labelClass}>{t("race")}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {RACES.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRace(r)}
                      onMouseEnter={() => setHoveredRace(r)}
                      onMouseLeave={() => setHoveredRace(null)}
                      className={`px-4 py-2 rounded-md text-sm transition-all duration-200 transform hover:-translate-y-0.5 ${
                        race === r
                          ? "bg-yellow-700 text-white shadow-md border border-yellow-500"
                          : "bg-stone-300 text-stone-800 hover:bg-stone-400 border border-transparent"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* BOX DESKRIPSI RAS */}
                <InfoCard
                  type={t("race")}
                  title={hoveredRace || race}
                  description={
                    hoveredRace || race
                      ? t(
                          `race${(hoveredRace || race).replace(
                            /[\s-]/g,
                            ""
                          )}Description`
                        )
                      : null
                  }
                  defaultText={
                    t("racePlaceholder") ||
                    "Pilih Ras untuk melihat kemampuan uniknya."
                  }
                />
              </div>
            </div>

            {/* --- KOLOM KANAN (KELAS & LATAR BELAKANG) --- */}
            <div className="space-y-6">
              {/* Pilihan Kelas */}
              <div>
                <label className={labelClass}>{t("class")}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {CLASSES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCharClass(c)}
                      onMouseEnter={() => setHoveredClass(c)}
                      onMouseLeave={() => setHoveredClass(null)}
                      className={`px-4 py-2 rounded-md text-sm transition-all duration-200 transform hover:-translate-y-0.5 ${
                        charClass === c
                          ? "bg-yellow-700 text-white shadow-md border border-yellow-500"
                          : "bg-stone-300 text-stone-800 hover:bg-stone-400 border border-transparent"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* BOX DESKRIPSI KELAS */}
                <InfoCard
                  type={t("class")}
                  title={hoveredClass || charClass}
                  description={
                    hoveredClass || charClass
                      ? t(`class${hoveredClass || charClass}Description`)
                      : null
                  }
                  defaultText={
                    t("classPlaceholder") ||
                    "Pilih Kelas untuk menentukan gaya bertarung."
                  }
                />
              </div>

              {/* Pilihan Background */}
              <div>
                <label className={labelClass}>{t("background")}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {BACKGROUNDS.map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setBackground(b)}
                      onMouseEnter={() => setHoveredBackground(b)}
                      onMouseLeave={() => setHoveredBackground(null)}
                      className={`px-4 py-2 rounded-md text-sm transition-all duration-200 transform hover:-translate-y-0.5 ${
                        background === b
                          ? "bg-yellow-700 text-white shadow-md border border-yellow-500"
                          : "bg-stone-300 text-stone-800 hover:bg-stone-400 border border-transparent"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                {/* BOX DESKRIPSI BACKGROUND */}
                <InfoCard
                  type={t("background")}
                  title={hoveredBackground || background}
                  description={
                    hoveredBackground || background
                      ? t(
                          `bg${(hoveredBackground || background).replace(
                            /\s/g,
                            ""
                          )}Description`
                        )
                      : null
                  }
                  defaultText={
                    t("bgPlaceholder") ||
                    "Pilih Latar Belakang masa lalu karaktermu."
                  }
                />
              </div>
            </div>
          </div>

          {/* --- Bagian Bawah (STATS) --- */}
          <div className="pt-4 border-t border-stone-400/30">
            <label className={labelClass}>{t("assignStats")}</label>
            <p className="text-sm text-stone-700 mb-4 italic">
              {t("assignStatsDesc", { scores: STANDARD_ARRAY.join(", ") })}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {STAT_NAMES.map((stat, index) => {
                // Logika Tooltip Posisi (Tetap dipertahankan untuk stats karena ini item kecil)
                const getTooltipPosition = (index) => {
                  const totalItems = STAT_NAMES.length;
                  if (index < 2) return "left-0";
                  if (index >= totalItems - 2) return "right-0";
                  return "left-1/2 -translate-x-1/2";
                };
                const tooltipPositionClass = getTooltipPosition(index);

                return (
                  <div key={stat} className="relative group/stat">
                    <label
                      htmlFor={stat}
                      className={`${statLabelClass} flex items-center justify-center gap-1.5 mb-2 cursor-help`}
                    >
                      <span className="capitalize font-bold text-stone-800">
                        {stat}
                      </span>
                      <span className="text-[10px] text-stone-500 border border-stone-500 rounded-full w-3 h-3 flex items-center justify-center">
                        ?
                      </span>

                      {/* Tooltip Kecil khusus Stat (Melayang) */}
                      <div
                        className={`
                        absolute hidden group-hover/stat:block 
                        bottom-full mb-2 
                        w-48 p-2 bg-stone-900 text-stone-100 
                        text-xs rounded shadow-xl z-50
                        pointer-events-none
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
                      className={`${selectBaseClass} w-full text-center font-mono font-bold`}
                    >
                      <option style={{ backgroundColor: "#e7e5e4" }} value="">
                        -
                      </option>
                      {stats[stat] && (
                        <option
                          style={{ backgroundColor: "#e7e5e4" }}
                          value={stats[stat]}
                        >
                          {stats[stat]}
                        </option>
                      )}
                      {unassignedScores.map((score, idx) => (
                        <option
                          key={`${score}-${idx}`}
                          style={{ backgroundColor: "#e7e5e4" }}
                          value={score}
                        >
                          {score}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- Bagian Backstory --- */}
          <div>
            <label htmlFor="backstory" className={labelClass}>
              {t("backstory")}
            </label>
            <div className="relative">
              <textarea
                id="backstory"
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                className={`${textAreaClass} min-h-[100px]`}
                rows={3}
                placeholder={t("backstoryPlaceholder")}
              />
              <button
                type="button"
                onClick={handleGenerateBackstory}
                disabled={!race || !background || isGenerating}
                className={`absolute bottom-3 right-3 text-xs px-3 py-1 rounded border shadow-sm transition-colors ${
                  !race || !background || isGenerating
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-stone-200 hover:bg-white text-stone-800 border-stone-400"
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-spin">⏳</span> {t("generating")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    ✨ {t("generateWithAi")}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* --- Tombol Aksi --- */}
          <div className="flex justify-center items-center gap-6 pt-6 border-t border-stone-300">
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
              bg-gradient-to-b from-yellow-700 to-yellow-900
              border-2 border-yellow-500
              rounded-lg px-10 py-3
              shadow-[0_4px_10px_rgba(0,0,0,0.5)]
              hover:from-yellow-600 hover:to-yellow-800
              hover:shadow-[0_6px_15px_rgba(0,0,0,0.6)]
              hover:border-yellow-400
              disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale
              transition-all duration-300 ease-in-out
              transform hover:scale-105 active:scale-95
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
