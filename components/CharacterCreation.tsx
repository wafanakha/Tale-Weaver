import React, { useState, useMemo } from "react";
import { generateCharacterBackstory } from "../services/AIService";
import { Stats, Skills } from "../types";
import { useLanguage } from "../i18n";

export interface CharacterDetails {
  name: string;
  race: string;
  background: string;
  backstory: string;
  stats: Stats;
  skills: Skills;
  combatSkills: string[];
}

interface CharacterCreationProps {
  onCharacterCreate: (details: CharacterDetails) => void;
  onCancel: () => void;
}

const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Orc"];
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

const BACKGROUND_BENEFITS: {
  [key: string]: { skills: (keyof Skills)[]; combat: string[] };
} = {
  Noble: { skills: ["persuasion", "history"], combat: ["Rallying Cry"] },
  Rogue: { skills: ["stealth", "deception"], combat: ["Precise Strike"] },
  Scholar: {
    skills: ["arcana", "investigation"],
    combat: ["Analyze Weakness"],
  },
  Soldier: { skills: ["athletics", "perception"], combat: ["Power Attack"] },
  Outcast: { skills: ["stealth", "perception"], combat: ["Dirty Fighting"] },
};

const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onCharacterCreate,
  onCancel,
}) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState("");
  const [race, setRace] = useState("Human");
  const [background, setBackground] = useState("Soldier");
  const [backstory, setBackstory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<Partial<Stats>>({});

  const unassignedScores = useMemo(() => {
    const assigned = Object.values(stats);
    const counts = assigned.reduce((acc, score) => {
      acc[score] = (acc[score] || 0) + 1;
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
      // Effectively 'unassign' it for a moment
      delete newStats[stat];
    }

    if (!isNaN(score)) {
      newStats[stat] = score;
    }

    setStats(newStats);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !race || !background || Object.keys(stats).length !== 6) {
      alert(
        "Please fill out your name, race, background, and assign all stats."
      );
      return;
    }
    setIsSubmitting(true);

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
    const benefits = BACKGROUND_BENEFITS[background];
    if (benefits) {
      benefits.skills.forEach((skill) => {
        finalSkills[skill] = true;
      });
    }

    onCharacterCreate({
      name,
      race,
      background,
      backstory,
      stats: stats as Stats,
      skills: finalSkills,
      combatSkills: benefits ? benefits.combat : [],
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
    isSubmitting ||
    Object.keys(stats).length !== 6;

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-4xl w-full my-8">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6 cinzel text-center">
          {t("createAdventurer")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* Name, Race, Background */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <label
                htmlFor="name"
                className="block text-lg font-semibold mb-2 cinzel text-gray-300"
              >
                {t("name")}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder={t("characterNamePlaceholder")}
                required
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-lg font-semibold mb-2 cinzel text-gray-300">
                {t("race")}
              </label>
              <div className="flex flex-wrap gap-2">
                {RACES.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRace(r)}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      race === r
                        ? "bg-yellow-500 text-gray-900 font-bold"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-lg font-semibold mb-2 cinzel text-gray-300">
                {t("background")}
              </label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUNDS.map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setBackground(b)}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${
                      background === b
                        ? "bg-yellow-500 text-gray-900 font-bold"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stat Assignment */}
          <div>
            <label className="block text-lg font-semibold mb-2 cinzel text-gray-300">
              {t("assignStats")}
            </label>
            <p className="text-sm text-gray-400 mb-2">
              {t("assignStatsDesc", { scores: STANDARD_ARRAY.join(", ") })}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {STAT_NAMES.map((stat) => (
                <div key={stat}>
                  <label
                    htmlFor={stat}
                    className="block text-sm font-bold capitalize text-yellow-400"
                  >
                    {stat}
                  </label>
                  <select
                    id={stat}
                    value={stats[stat] || ""}
                    onChange={(e) => handleStatChange(stat, e.target.value)}
                    className="w-full p-2 mt-1 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="">-</option>
                    {stats[stat] && (
                      <option value={stats[stat]}>{stats[stat]}</option>
                    )}
                    {unassignedScores.map((score, index) => (
                      <option key={`${score}-${index}`} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Backstory */}
          <div>
            <label
              htmlFor="backstory"
              className="block text-lg font-semibold mb-2 cinzel text-gray-300"
            >
              {t("backstory")}
            </label>
            <textarea
              id="backstory"
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none"
              rows={3}
              placeholder={t("backstoryPlaceholder")}
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleGenerateBackstory}
                disabled={!race || !background || isGenerating}
                className="cinzel text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isGenerating ? t("generating") : t("generateWithAi")}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="cinzel text-lg bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={formIsInvalid}
              className="cinzel text-xl bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
