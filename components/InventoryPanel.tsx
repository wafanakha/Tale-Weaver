import React from "react";
import { Player, Item, ItemType } from "../types";
import { useLanguage } from "../i18n";

interface InventoryPanelProps {
  player?: Player;
  onEquip: (item: Item) => void;
}

const ItemCard: React.FC<{
  item: Item;
  onEquip: (item: Item) => void;
  isEquippable: boolean;
}> = ({ item, onEquip, isEquippable }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-stone-200/50 p-2 rounded-md hover:bg-stone-300/50 transition-colors duration-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-red-800">{item.name}</p>
          <p className="text-xs text-stone-600 italic">{item.description}</p>
        </div>
        {isEquippable && (
          <button
            onClick={() => onEquip(item)}
            className="text-xs bg-red-800 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2 flex-shrink-0"
          >
            {t("equip")}
          </button>
        )}
      </div>
    </div>
  );
};

const InventoryPanel: React.FC<InventoryPanelProps> = ({ player, onEquip }) => {
  const { t } = useLanguage();
  if (!player) {
    return null;
  }

  const equipment = player.equipment || { weapon: null, armor: null };
  const inventory = player.inventory || [];

  return (
    <div className="border-2 border-stone-400 bg-stone-500/10 p-3 rounded-md shadow-sm flex-grow flex flex-col h-1/3">
      <h2 className="text-center text-red-900 cinzel font-bold text-lg mb-1">
        {t("yourInventory")}
      </h2>

      <div className="mb-1">
        <h3 className="text-sm uppercase text-stone-500 font-semibold mb-1">
          {t("equipped")}
        </h3>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-bold text-stone-700">{t("weapon")}:</span>{" "}
            {equipment.weapon?.name || t("none")}
          </p>
          <p>
            <span className="font-bold text-stone-700">{t("armor")}:</span>{" "}
            {equipment.armor?.name || t("none")}
          </p>
        </div>
      </div>

      <div
        className="border-t border-stone-400 pt-4 flex-grow overflow-y-auto"
        style={{ maxHeight: "400px" }}
      >
        <h3 className="text-sm uppercase text-stone-500 font-semibold mb-2 " >
          {t("carriedItems")}
        </h3>
        {inventory.length > 0 ? (
          <div className="space-y-2">
            {inventory.map((item, index) => (
              <ItemCard
                key={`${item.name}-${index}`}
                item={item}
                onEquip={onEquip}
                isEquippable={
                  item.type === ItemType.WEAPON || item.type === ItemType.ARMOR
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-stone-500 italic text-sm text-center mt-4">
            {t("backpackEmpty")}
          </p>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;
