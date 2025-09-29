
import React from 'react';

interface ChoicePanelProps {
  choices: string[];
  onChoice: (choice: string) => void;
  disabled?: boolean;
}

const ChoicePanel: React.FC<ChoicePanelProps> = ({ choices, onChoice, disabled = false }) => {
  if (!choices || choices.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => onChoice(choice)}
          disabled={disabled}
          className="w-full bg-gray-700 text-gray-200 font-semibold p-3 rounded-lg text-left transition duration-300 ease-in-out hover:bg-yellow-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {choice}
        </button>
      ))}
    </div>
  );
};

export default ChoicePanel;
