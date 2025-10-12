import React, { useState } from "react";
import { useLanguage } from "../i18n";

interface ActionInputProps {
  onActionSubmit: (action: string) => void;
  disabled?: boolean;
}

const ActionInput: React.FC<ActionInputProps> = ({
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={actionText}
        onChange={(e) => setActionText(e.target.value)}
        disabled={disabled}
        placeholder={t("enterYourAction")}
        className="flex-grow bg-gray-700 text-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-800 disabled:text-gray-500"
        aria-label={t("enterYourAction")}
      />
      <button
        type="submit"
        disabled={disabled || !actionText.trim()}
        className="bg-yellow-500 text-gray-900 font-bold p-3 rounded-lg transition duration-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {t("send")}
      </button>
    </form>
  );
};

export default ActionInput;
