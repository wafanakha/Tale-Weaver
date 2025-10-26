import React, { useState } from "react";
import { useLanguage } from "../i18n";

interface ActionInputPanelProps {
  suggestions: string[];
  onActionSubmit: (action: string) => void;
  disabled?: boolean;
}

const ActionInputPanel: React.FC<ActionInputPanelProps> = ({
  suggestions,
  onActionSubmit,
  disabled = false,
}) => {
  const [actionText, setActionText] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionText.trim() && !disabled) {
      onActionSubmit(actionText.trim());
      setActionText("");
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={actionText}
          onChange={(e) => setActionText(e.target.value)}
          disabled={disabled}
          placeholder={t("actionInputPlaceholder")}
          className="w-full bg-stone-200 text-stone-800 p-3 rounded-lg border border-stone-400 focus:outline-none focus:ring-2 focus:ring-red-800 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed"
          aria-label={t("actionInputPlaceholder")}
        />
        <button
          type="submit"
          disabled={disabled || !actionText.trim()}
          className="bg-red-800 text-white font-bold px-6 py-3 rounded-lg transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-amber-600 disabled:bg-stone-500 disabled:text-stone-700 disabled:cursor-not-allowed"
          aria-label={t("submitAction")}
        >
          {t("submitAction")}
        </button>
      </form>
      {suggestions && suggestions.length > 0 && (
        <div className="text-center text-sm text-stone-600">
          <span className="font-semibold">{t("suggestions")}:</span>
          <span className="italic ml-1">{suggestions.join(", ")}</span>
        </div>
      )}
    </div>
  );
};

export default ActionInputPanel;
