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
          className="w-full bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          aria-label={t("actionInputPlaceholder")}
        />
        <button
          type="submit"
          disabled={disabled || !actionText.trim()}
          className="bg-yellow-600 text-gray-900 font-bold px-6 py-3 rounded-lg transition duration-300 ease-in-out hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          aria-label={t("submitAction")}
        >
          {t("submitAction")}
        </button>
      </form>
      {suggestions && suggestions.length > 0 && (
        <div className="text-center text-sm text-gray-400">
          <span className="font-semibold">{t("suggestions")}:</span>
          <span className="italic ml-1">{suggestions.join(", ")}</span>
        </div>
      )}
    </div>
  );
};

export default ActionInputPanel;
