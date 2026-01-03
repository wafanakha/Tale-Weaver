import React from "react";
import { useLanguage } from "../i18n";

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const { t, language } = useLanguage();

  const content = {
    en: {
      title: "Adventurer's Handbook",
      subtitle: "Rules of Engagement in the Realm of Aetheria",
      section1Title: "The Master of Ceremonies",
      section1Desc:
        "At the heart of Tale-Weaver lies the Gemini AI, your tireless Dungeon Master. It doesn't just read a script; it reacts to your creative inputs, calculates the consequences of your failures, and celebrates your critical successes. Every line of dialogue and every trap you encounter is woven specifically for your party.",
      section2Title: "The Sacred d20 System",
      section2Desc:
        "Success is never guaranteed. When you attempt a feat—be it scale a wall or deceive a guard—the Master calls for a Skill Check. Your d20 roll, combined with your character's Ability Modifiers, must beat a hidden Difficulty Class (DC).",
      mechanics: [
        { label: "Strength", desc: "Raw power and athletics." },
        { label: "Dexterity", desc: "Agility, reflexes, and stealth." },
        { label: "Intelligence", desc: "Logic, memory, and arcane knowledge." },
        { label: "Wisdom", desc: "Intuition, perception, and survival." },
      ],
      goldenRulesTitle: "The Golden Rules of Roleplay",
      rules: [
        "Be Creative: The AI understands intent. Instead of 'I attack', try 'I swing my blade at the torch to plunge the room into darkness'.",
        "Respect the Dice: A '1' is a critical failure that leads to chaos; a '20' turns the impossible into legend.",
        "Teamwork: Coordinate with your party. A Wizard's spell can set the stage for a Rogue's sneak attack.",
      ],
    },
    id: {
      title: "Panduan Sang Petualang",
      subtitle: "Aturan Main di Dunia Aetheria",
      section1Title: "Sang Penguasa Cerita",
      section1Desc:
        "Di jantung Tale-Weaver terdapat Gemini AI, Dungeon Master Anda yang tak kenal lelah. Ia tidak hanya membaca naskah; ia bereaksi terhadap masukan kreatif Anda, menghitung konsekuensi dari kegagalan Anda, dan merayakan keberhasilan kritis Anda. Setiap baris dialog dan setiap jebakan yang Anda temui ditenun khusus untuk kelompok Anda.",
      section2Title: "Sistem Dadu d20",
      section2Desc:
        "Keberhasilan tidak pernah dijamin. Saat Anda mencoba suatu tindakan—baik itu memanjat dinding atau menipu penjaga—Sang Master akan meminta Uji Keterampilan. Lemparan d20 Anda, digabung dengan Modifikasi Kemampuan karakter Anda, harus mengalahkan Tingkat Kesulitan (DC) yang tersembunyi.",
      mechanics: [
        { label: "Kekuatan", desc: "Tenaga mentah dan atletik." },
        {
          label: "Ketangkasan",
          desc: "Kelincahan, refleks, dan mengendap-endap.",
        },
        { label: "Kecerdasan", desc: "Logika, ingatan, dan pengetahuan gaib." },
        {
          label: "Kebijaksanaan",
          desc: "Intuisi, persepsi, dan bertahan hidup.",
        },
      ],
      goldenRulesTitle: "Aturan Emas Roleplay",
      rules: [
        "Jadilah Kreatif: AI memahami niat. Daripada 'Saya menyerang', cobalah 'Saya mengayunkan pedang ke obor untuk membuat ruangan menjadi gelap gulita'.",
        "Hormati Dadu: Angka '1' adalah kegagalan kritis yang membawa kekacauan; angka '20' mengubah hal mustahil menjadi legenda.",
        "Kerja Sama Tim: Berkoordinasilah dengan rekanmu. Mantra Penyihir bisa membuka jalan bagi serangan diam-diam pencuri.",
      ],
    },
  };

  const active = language === "id" ? content.id : content.en;

  return (
    <div className="min-h-screen w-screen parchment-bg text-stone-800 flex flex-col items-center justify-center p-4">
      <div className="bg-[#f3e9d2] p-6 md:p-12 rounded-lg shadow-2xl max-w-5xl w-full border-4 border-double border-amber-800 my-4 overflow-y-auto max-h-[95vh] relative shadow-[inset_0_0_50px_rgba(0,0,0,0.1)]">
        {/* Decorative Header */}
        <div className="text-center mb-10 border-b-2 border-amber-900/20 pb-6">
          <div className="text-4xl mb-2">📜</div>
          <h1 className="text-5xl font-bold text-red-900 medieval mb-2 uppercase tracking-tighter">
            {active.title}
          </h1>
          <p className="text-xl text-amber-800 cinzel font-bold">
            {active.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: AI and Mechanics */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-red-900 cinzel mb-3 flex items-center gap-3">
                <span className="text-3xl">⚔️</span> {active.section1Title}
              </h2>
              <p className="text-stone-700 leading-relaxed text-justify first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2">
                {active.section1Desc}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-red-900 cinzel mb-3 flex items-center gap-3">
                <span className="text-3xl">🎲</span> {active.section2Title}
              </h2>
              <p className="text-stone-700 leading-relaxed mb-4">
                {active.section2Desc}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {active.mechanics.map((m, i) => (
                  <div
                    key={i}
                    className="bg-amber-900/5 p-3 rounded border border-amber-900/10"
                  >
                    <span className="block font-bold text-red-800 text-xs uppercase">
                      {m.label}
                    </span>
                    <span className="text-xs text-stone-600">{m.desc}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Golden Rules */}
          <div className="flex flex-col">
            <section className="bg-stone-800 text-stone-200 p-8 rounded-lg shadow-xl border-t-4 border-amber-600 flex-grow">
              <h2 className="text-2xl font-bold text-amber-500 cinzel mb-6 text-center underline decoration-amber-600 underline-offset-8">
                {active.goldenRulesTitle}
              </h2>
              <ul className="space-y-6">
                {active.rules.map((rule, i) => {
                  const [title, desc] = rule.split(":");
                  return (
                    <li key={i} className="flex gap-4">
                      <span className="text-amber-500 font-bold text-xl cinzel">
                        {i + 1}.
                      </span>
                      <div className="text-sm">
                        <strong className="text-amber-400 uppercase tracking-widest block mb-1">
                          {title}
                        </strong>
                        <span className="text-stone-300 italic">{desc}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 pt-6 border-t border-stone-600 text-center">
                <p className="text-xs text-stone-400 font-serif">
                  "In the tapestry of fate, the dice only provide the thread;
                  your courage provides the pattern."
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-center mt-12 gap-4">
          <button
            onClick={onBack}
            className="cinzel text-xl bg-red-900 hover:bg-red-800 text-white font-bold py-3 px-16 rounded shadow-[0_5px_0_rgb(127,29,29)] active:translate-y-1 active:shadow-none transition-all"
          >
            {t("back")}
          </button>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 text-amber-900/10 text-6xl pointer-events-none select-none font-serif">
          ✥
        </div>
        <div className="absolute top-4 right-4 text-amber-900/10 text-6xl pointer-events-none select-none font-serif">
          ✥
        </div>
        <div className="absolute bottom-4 left-4 text-amber-900/10 text-6xl pointer-events-none select-none font-serif">
          ✥
        </div>
        <div className="absolute bottom-4 right-4 text-amber-900/10 text-6xl pointer-events-none select-none font-serif">
          ✥
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
