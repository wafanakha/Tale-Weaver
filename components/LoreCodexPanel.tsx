import React, { useState } from "react";
import { LoreEntry } from "../types";
import { useLanguage } from "../i18n";

interface LoreCodexPanelProps {
  loreCodex?: LoreEntry[];
}

const LoreCodexPanel: React.FC<LoreCodexPanelProps> = ({ loreCodex = [] }) => {
  const { t } = useLanguage();
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const handleToggle = (title: string) => {
    setExpandedEntry((prev) => (prev === title ? null : title));
  };

  return (
    <div className="border-2 border-stone-400 bg-stone-500/10 p-3 rounded-md shadow-sm flex flex-col">
      <h2 className="text-center text-red-900 cinzel font-bold text-lg mb-2">
        {t("loreCodex")}
      </h2>
      <div
        className="flex-grow overflow-y-auto pr-2"
        style={{ maxHeight: "300px" }}
      >
        {loreCodex.length > 0 ? (
          <div className="space-y-2">
            {loreCodex.map((entry) => (
              <div key={entry.title} className="bg-stone-200/50 rounded-md">
                <button
                  onClick={() => handleToggle(entry.title)}
                  className="w-full text-left p-2 flex justify-between items-center hover:bg-stone-300/50 transition-colors duration-200"
                  aria-expanded={expandedEntry === entry.title}
                >
                  <span className="font-bold text-red-800">{entry.title}</span>
                  <span
                    className={`transform transition-transform duration-200 text-xs ${
                      expandedEntry === entry.title ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {expandedEntry === entry.title && (
                  <div className="p-3 border-t border-stone-400">
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stone-500 italic text-sm text-center mt-4">
            {t("noDiscoveries")}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoreCodexPanel;
