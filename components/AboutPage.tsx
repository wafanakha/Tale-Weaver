import React from "react";
import { useLanguage } from "../i18n";

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const { t, language } = useLanguage();

  const content = {
    en: {
      title: "Technical Architecture",
      subtitle: "Under the Hood of Tale-Weaver",
      frontendTitle: "Frontend Architecture",
      frontendDesc:
        "Built with React 18 and TypeScript for type-safe component logic. The UI utilizes Tailwind CSS with a custom configuration for the 'Cinzel' typography and medieval aesthetics. State management relies heavily on React Hooks (useReducer, useEffect) to handle complex game loops and UI updates.",
      backendTitle: "Serverless Infrastructure",
      backendDesc:
        "Powered by Firebase Realtime Database. The application uses a listener-based architecture where clients subscribe to game state changes. This enables real-time multiplayer synchronization without a dedicated WebSocket server, ensuring low-latency updates for party actions and combat states.",
      aiTitle: "Generative AI Engine",
      aiDesc:
        "The Core Logic utilizes Google's Gemini 2.5 model. Unlike standard chatbots, this implementation forces Structured JSON Outputs to ensure game data integrity (HP, XP, Inventory). The prompt engineering includes a rigorous 'World Bible' context injection to maintain lore consistency across turns.",
      features: [
        {
          label: "Context Caching",
          value: "Optimizes token usage for long-running campaigns.",
        },
        {
          label: "JSON Schema Validation",
          value: "Parses AI responses to prevent game-breaking logic errors.",
        },
        {
          label: "Optimistic UI",
          value:
            "Immediate feedback on player actions while awaiting server ack.",
        },
        {
          label: "RNG Logic",
          value: "Hybrid client-server dice roll validation system.",
        },
      ],
      stackTitle: "Technology Stack",
    },
    id: {
      title: "Arsitektur Teknis",
      subtitle: "Di Balik Layar Tale-Weaver",
      frontendTitle: "Arsitektur Frontend",
      frontendDesc:
        "Dibangun dengan React 18 dan TypeScript untuk logika komponen yang aman (type-safe). UI menggunakan Tailwind CSS dengan konfigurasi kustom untuk tipografi 'Cinzel' dan estetika abad pertengahan. Manajemen state sangat bergantung pada React Hooks (useReducer, useEffect) untuk menangani loop permainan yang kompleks.",
      backendTitle: "Infrastruktur Serverless",
      backendDesc:
        "Ditenagai oleh Firebase Realtime Database. Aplikasi ini menggunakan arsitektur berbasis pendengar (listener) di mana klien berlangganan perubahan state game. Ini memungkinkan sinkronisasi multiplayer real-time tanpa server WebSocket khusus.",
      aiTitle: "Mesin Generative AI",
      aiDesc:
        "Logika Inti menggunakan model Google Gemini 2.5. Berbeda dengan chatbot standar, implementasi ini memaksa Output JSON Terstruktur untuk memastikan integritas data game (HP, XP, Inventaris). Prompt engineering mencakup injeksi konteks 'World Bible' untuk menjaga konsistensi cerita.",
      features: [
        {
          label: "Context Caching",
          value: "Mengoptimalkan penggunaan token untuk kampanye panjang.",
        },
        {
          label: "Validasi Skema JSON",
          value: "Memparsing respons AI untuk mencegah error logika game.",
        },
        {
          label: "Optimistic UI",
          value: "Umpan balik instan pada aksi pemain sambil menunggu server.",
        },
        {
          label: "Logika RNG",
          value: "Sistem validasi dadu hibrida client-server.",
        },
      ],
      stackTitle: "Stack Teknologi",
    },
  };

  const active = language === "id" ? content.id : content.en;

  // Styles adapted from CharacterCreation.tsx
  const labelClass =
    "block text-lg font-semibold mb-2 cinzel text-red-900 text-glow border-b border-red-900/20 pb-1";
  const cardBaseClass =
    "bg-stone-100/70 border-2 border-stone-700/50 rounded-xl shadow-inner p-5 text-stone-800";
  const textClass = "text-sm text-stone-900 leading-relaxed font-serif";
  const badgeClass =
    "px-3 py-1 bg-stone-800 text-amber-500 text-xs font-mono rounded border border-amber-600";

  return (
    <div className="h-screen w-screen welcome-bg text-stone-800 flex flex-col items-center justify-center p-4">
      <div className="content-frame relative p-8 sm:p-12 shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col">
        {/* Header */}
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-4xl font-bold text-red-900 mb-2 cinzel text-glow">
            {active.title}
          </h1>
          <p className="text-stone-700 cinzel font-semibold text-lg">
            {active.subtitle}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar space-y-6">
          {/* Top Row: Frontend & Backend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardBaseClass}>
              <h3 className={labelClass}>{active.frontendTitle}</h3>
              <p className={textClass}>{active.frontendDesc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={badgeClass}>React 18</span>
                <span className={badgeClass}>TypeScript</span>
                <span className={badgeClass}>Vite</span>
                <span className={badgeClass}>Tailwind</span>
              </div>
            </div>

            <div className={cardBaseClass}>
              <h3 className={labelClass}>{active.backendTitle}</h3>
              <p className={textClass}>{active.backendDesc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={badgeClass}>Firebase Realtime DB</span>
                <span className={badgeClass}>NoSQL</span>
                <span className={badgeClass}>Event Listeners</span>
              </div>
            </div>
          </div>

          {/* Middle Row: AI Core (Full Width) */}
          <div className={cardBaseClass}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <h3 className={labelClass}>{active.aiTitle}</h3>
                <p className={textClass}>{active.aiDesc}</p>
              </div>
              <div className="md:w-1/3 bg-stone-200/50 rounded p-3 border border-stone-300">
                <h4 className="text-xs font-bold text-red-900 uppercase mb-2 tracking-widest">
                  Model Params
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Model:</span>
                    <span className="font-mono font-bold">Gemini 2.5</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Temp:</span>
                    <span className="font-mono font-bold">0.7</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Output:</span>
                    <span className="font-mono font-bold">JSON Mode</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Key Features */}
          <div>
            <h3 className={`text-center ${labelClass} border-none mb-4`}>
              {active.stackTitle} & Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {active.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="bg-stone-800 text-stone-300 p-4 rounded-lg border border-stone-600 shadow-lg"
                >
                  <div className="text-amber-500 font-cinzel font-bold text-sm mb-1">
                    {feat.label}
                  </div>
                  <div className="text-xs leading-tight text-stone-400">
                    {feat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer / Back Button */}
        <div className="flex-shrink-0 pt-6 mt-2 flex justify-center border-t border-stone-400/30">
          <button
            onClick={onBack}
            className="
                font-cinzel text-lg font-bold text-white
                bg-gradient-to-b from-yellow-600 to-yellow-800
                border-2 border-yellow-400
                rounded-lg px-8 py-2
                shadow-lg shadow-black/30
                hover:from-yellow-500 hover:to-yellow-700
                hover:shadow-xl
                transition-all duration-300 ease-in-out
                transform hover:scale-105
              "
          >
            {t("back")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
