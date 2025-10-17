import React from "react";
import { useLanguage } from "../i18n";

const LoadingSpinner: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 border-4 border-yellow-400 border-dashed rounded-full animate-spin border-t-transparent"></div>
      <p className="mt-3 text-yellow-400 text-sm italic">
        {t("storytellerWeavingFate")}
      </p>
    </div>
  );
};

export default LoadingSpinner;
