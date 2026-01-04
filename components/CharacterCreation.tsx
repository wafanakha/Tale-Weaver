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

// Mapping Data sesuai SRD 5e (Disederhanakan untuk contoh ini agar fokus pada UI)
// ... (Bagian DATA mapping tidak berubah, saya skip agar hemat baris) ...
// Asumsi CLASS_DATA, RACE_DATA, BACKGROUND_SKILLS sama seperti kode asli Anda.
const CLASS_DATA: any = {
  /* ... Data Asli Anda ... */
};
// Quick mock to prevent errors if copy-pasted directly without full data
if (!CLASS_DATA["Fighter"]) {
  // Placeholder logic just in case
  CLASSES.forEach(
    (c) =>
      (CLASS_DATA[c] = {
        hitDice: "1d8",
        savingThrows: [],
        proficiencies: [],
        combatSkills: [],
      })
  );
}
const RACE_DATA: any = {
  /* ... Data Asli Anda ... */
};
if (!RACE_DATA["Human"]) {
  RACES.forEach((r) => (RACE_DATA[r] = { speed: 30, languages: ["Common"] }));
}
const BACKGROUND_SKILLS: any = {
  /* ... Data Asli Anda ... */
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

  // ... (Logic unassignedScores dan handleStatChange tetap sama) ...
  const unassignedScores = useMemo(() => {
    const assigned = Object.values(stats);
    const counts = assigned.reduce((acc, score) => {
      if (typeof score === "number") acc[score] = (acc[score] || 0) + 1;
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
    if (oldScore) delete newStats[stat];
    if (!isNaN(score)) newStats[stat] = score;
    setStats(newStats);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi sederhana
    if (
      !name ||
      !race ||
      !background ||
      !charClass ||
      Object.keys(stats).length !== 6
    ) {
      alert("Please fill out all fields.");
      return;
    }

    // Logic submit (sama seperti kode asli Anda)
    // ...
    // Mocking classInfo retrieval for snippet correctness
    const classInfo = CLASS_DATA[charClass] || {
      savingThrows: [],
      combatSkills: [],
      proficiencies: [],
      hitDice: "1d8",
    };
    const raceInfo = RACE_DATA[race] || { languages: [], speed: 30 };

    // Construct final objects...
    const finalSkills: any = {}; // ... mapping logic ...
    const finalSavingThrows: any = {}; // ... mapping logic ...

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
    if (!name || !race || !background) return;
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
    } finally {
      setIsGenerating(false);
    }
  };
  const [activeStat, setActiveStat] = useState<string | null>(null);

  const formIsInvalid =
    !name ||
    !race ||
    !background ||
    !charClass ||
    isSubmitting ||
    Object.keys(stats).length !== 6;

  // --- STYLES DIPERBARUI ---
  const labelClass =
    "block text-lg font-semibold mb-2 cinzel text-red-900 text-glow";
  const statLabelClass = "block text-sm font-bold text-red-900 text-glow";

  // Style button: Sedikit diperkecil paddingnya agar lebih muat banyak
  const inactiveButtonClass =
    "bg-stone-600 text-stone-100 hover:bg-stone-700 border border-stone-500";
  const activeButtonClass =
    "bg-red-900 text-white font-bold border-2 border-amber-500 shadow-md transform scale-105";

  const inputBaseClass =
    "w-full bg-stone-100/70 border-2 border-stone-700/50 rounded-xl shadow-inner focus:ring-2 focus:ring-amber-700 outline-none text-stone-800 p-3";
  const selectBaseClass =
    "w-full bg-stone-100/70 border-2 border-stone-700/50 rounded-xl shadow-inner focus:ring-2 focus:ring-amber-700 outline-none text-stone-800 p-2 mt-1";

  // Style baru untuk kotak Deskripsi (Pengganti Tooltip)
  const descriptionBoxClass =
    "mt-3 p-4 bg-stone-800/90 text-stone-100 rounded-lg border border-stone-600 text-sm italic leading-relaxed shadow-inner min-h-[80px]";

  return (
    <div className="h-screen w-screen welcome-bg text-stone-800 flex flex-col items-center justify-center p-4">
      <div className="content-frame relative p-6 sm:p-10 shadow-2xl max-w-5xl w-full flex flex-col max-h-[90vh]">
        <h1 className="text-3xl sm:text-4xl font-bold text-red-900 mb-4 cinzel text-center text-glow shrink-0">
          {t("createAdventurer")}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 text-left overflow-y-auto pr-2 custom-scrollbar flex-1"
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

              {/* RACE SELECTION - DIPERBAIKI */}
              <div>
                <label className={labelClass}>{t("race")}</label>
                <div className="flex flex-wrap gap-2">
                  {RACES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRace(r)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
                        race === r ? activeButtonClass : inactiveButtonClass
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {/* Deskripsi statis di bawah tombol (Menggantikan Tooltip yang rusak) */}
                <div className={descriptionBoxClass}>
                  <strong className="block text-amber-500 not-italic mb-1">
                    {race}
                  </strong>
                  {t(`race${race.replace(/[\s-]/g, "")}Description`)}
                </div>
              </div>
            </div>

            {/* --- Kolom Kanan --- */}
            <div className="space-y-6">
              {/* CLASS SELECTION */}
              <div>
                <label className={labelClass}>{t("class")}</label>
                <div className="flex flex-wrap gap-2">
                  {CLASSES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCharClass(c)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
                        charClass === c
                          ? activeButtonClass
                          : inactiveButtonClass
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {/* Deskripsi statis Class */}
                <div className={descriptionBoxClass}>
                  <strong className="block text-amber-500 not-italic mb-1">
                    {charClass}
                  </strong>
                  {t(`class${charClass}Description`)}
                </div>
              </div>

              {/* BACKGROUND SELECTION */}
              <div>
                <label className={labelClass}>{t("background")}</label>
                <div className="flex flex-wrap gap-2">
                  {BACKGROUNDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBackground(b)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${
                        background === b
                          ? activeButtonClass
                          : inactiveButtonClass
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                {/* Deskripsi statis Background */}
                <div className={descriptionBoxClass}>
                  <strong className="block text-amber-500 not-italic mb-1">
                    {background}
                  </strong>
                  {t(`bg${background.replace(/\s/g, "")}Description`)}
                </div>
              </div>
            </div>
          </div>

          {/* --- Bagian Bawah: Stats --- */}
          <div>
            <label className={labelClass}>{t("assignStats")}</label>
            <p className="text-sm text-stone-900 mb-3 text-glow font-medium">
              {t("assignStatsDesc", { scores: STANDARD_ARRAY.join(", ") })}
            </p>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {STAT_NAMES.map((stat) => (
                <div
                  key={stat}
                  // 2. TAMBAHKAN EVENT HANDLER
                  // Saat mouse masuk ke area ini, set activeStat
                  onMouseEnter={() => setActiveStat(stat)}
                  // Saat di mobile (tap), set activeStat
                  onClick={() => setActiveStat(stat)}
                  className={`
                  p-2 rounded-lg border transition-all duration-200 cursor-pointer
                  ${
                    activeStat === stat
                      ? "bg-amber-100 border-amber-500 ring-2 ring-amber-500/50 scale-105 shadow-md"
                      : "bg-stone-200/50 border-stone-400 hover:bg-stone-200"
                  }
                `}
                >
                  <label
                    htmlFor={stat}
                    className="block text-xs font-bold text-red-900 uppercase mb-1 text-center cursor-pointer"
                  >
                    {stat.slice(0, 3)}
                  </label>
                  <select
                    id={stat}
                    value={stats[stat] || ""}
                    onChange={(e) => {
                      handleStatChange(stat, e.target.value);
                      setActiveStat(stat); // Aktifkan penjelasan saat memilih
                    }}
                    onFocus={() => setActiveStat(stat)} // Aktifkan saat di-tab
                    className="w-full bg-stone-100 border border-stone-400 rounded p-1 text-center font-bold text-stone-800 cursor-pointer focus:ring-amber-700"
                  >
                    <option value="">-</option>
                    {stats[stat] && (
                      <option value={stats[stat]}>{stats[stat]}</option>
                    )}
                    {unassignedScores.map((score, i) => (
                      <option key={`${score}-${i}`} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* 3. KOTAK PENJELASAN DINAMIS */}
            {/* Ini akan menampilkan teks berdasarkan apa yang sedang di-hover */}
            <div className={descriptionBoxClass}>
              {activeStat ? (
                <>
                  <strong className="block text-amber-500 not-italic mb-1 uppercase tracking-wide">
                    {activeStat}
                  </strong>
                  {/* Pastikan key translation 'strengthDescription', dll ada di file i18n Anda */}
                  {t(`${activeStat}Description`)}
                </>
              ) : (
                <span className="text-stone-400 not-italic">
                  {/* Teks default saat tidak ada yang dipilih */}
                  {language === "id"
                    ? "Arahkan kursor atau klik pada salah satu statistik di atas untuk melihat penjelasannya."
                    : "Hover over or click a stat above to see what it governs."}
                </span>
              )}
            </div>
          </div>

          {/* --- Bagian Bawah: Backstory --- */}
          <div className="pb-4">
            <label htmlFor="backstory" className={labelClass}>
              {t("backstory")}
            </label>
            <textarea
              id="backstory"
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              className={`${inputBaseClass} min-h-[100px]`}
              placeholder={t("backstoryPlaceholder")}
            />
            <div className="flex justify-between items-center mt-3">
              <button
                type="button"
                onClick={onCancel}
                className="text-stone-700 hover:text-red-800 underline font-cinzel font-bold"
              >
                {t("cancel")}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleGenerateBackstory}
                  disabled={!race || !background || isGenerating}
                  className="bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 text-sm cinzel"
                >
                  {isGenerating ? t("generating") : t("generateWithAi")}
                </button>
                <button
                  type="submit"
                  disabled={formIsInvalid}
                  className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg disabled:opacity-50 transition transform hover:scale-105 cinzel"
                >
                  {isSubmitting ? "..." : t("createCharacter")}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterCreation;
