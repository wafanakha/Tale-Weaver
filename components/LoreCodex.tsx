import React, { useState } from "react";
import { LoreEntry, LoreCategory } from "../types";
import { useLanguage } from "../i18n";

interface LoreCodexProps {
  isOpen: boolean;
  onClose: () => void;
  loreEntries: LoreEntry[];
}

const LoreCodex: React.FC<LoreCodexProps> = ({
  isOpen,
  onClose,
  loreEntries,
}) => {
  const { t } = useLanguage();
  const categories = [
    LoreCategory.CHARACTERS,
    LoreCategory.LOCATIONS,
    LoreCategory.RACES,
    LoreCategory.BACKGROUNDS,
  ];
  const [activeCategory, setActiveCategory] = useState<LoreCategory>(
    categories[0]
  );
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null);

  const filteredEntries = loreEntries.filter(
    (entry) => entry.category === activeCategory
  );

  if (!isOpen) return null;

  const handleSelectEntry = (entry: LoreEntry) => {
    setSelectedEntry(entry);
  };

  const handleClose = () => {
    setSelectedEntry(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-gray-800 text-gray-200 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border-2 border-yellow-500/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h1 className="text-3xl font-bold text-yellow-400 cinzel">
            {t("loreCodex")}
          </h1>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-grow overflow-hidden">
          {/* Sidebar/Categories */}
          <aside className="w-1/3 md:w-1/4 border-r border-gray-700 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedEntry(null); // Deselect entry when changing category
                  }}
                  className={`w-full text-left p-3 rounded-md text-lg transition-colors cinzel ${
                    activeCategory === cat
                      ? "bg-yellow-500 text-gray-900 font-bold"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {t(cat.toLowerCase() as any)}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="w-2/3 md:w-3/4 flex overflow-hidden">
            {/* Entry List */}
            <div
              className={`w-full md:w-1/2 border-r border-gray-700 p-4 overflow-y-auto ${
                selectedEntry ? "hidden md:block" : "block"
              }`}
            >
              {filteredEntries.length > 0 ? (
                <ul className="space-y-2">
                  {filteredEntries.map((entry) => (
                    <li key={entry.id}>
                      <button
                        onClick={() => handleSelectEntry(entry)}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                          selectedEntry?.id === entry.id
                            ? "bg-gray-900 ring-2 ring-yellow-400"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        {entry.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic text-center mt-4">
                  {t("noEntriesFound")}
                </p>
              )}
            </div>

            {/* Entry Details */}
            <div
              className={`w-full md:w-1/2 p-6 overflow-y-auto ${
                selectedEntry ? "block" : "hidden md:block"
              }`}
            >
              {selectedEntry ? (
                <div>
                  <button
                    className="md:hidden mb-4 text-yellow-400"
                    onClick={() => setSelectedEntry(null)}
                  >
                    &larr; {t("backToList")}
                  </button>
                  <h2 className="text-2xl font-bold text-yellow-400 cinzel mb-4">
                    {selectedEntry.title}
                  </h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.content}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 italic">{t("selectEntry")}</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LoreCodex;
