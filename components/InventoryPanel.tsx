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
    <div className="bg-gray-700 p-2 rounded-md hover:bg-gray-600 transition-colors duration-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-yellow-400">{item.name}</p>
          <p className="text-xs text-gray-400 italic">{item.description}</p>
        </div>
        {isEquippable && (
          <button
            onClick={() => onEquip(item)}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded ml-2 flex-shrink-0"
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

  // Defensively handle cases where player.equipment might be missing from the state object.
  const equipment = player.equipment || { weapon: null, armor: null };
  // Defensively handle cases where player.inventory might be missing from the state object.
  const inventory = player.inventory || [];

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 shadow-md flex-grow border border-gray-700 flex flex-col">
      <h2 className="text-xl font-bold text-center mb-4 text-yellow-400 cinzel">
        {t("yourInventory")}
      </h2>

      <div className="mb-4">
        <h3 className="text-sm uppercase text-gray-400 font-semibold mb-2">
          {t("equipped")}
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-bold text-gray-300">{t("weapon")}:</span>{" "}
            {equipment.weapon?.name || t("none")}
          </p>
          <p>
            <span className="font-bold text-gray-300">{t("armor")}:</span>{" "}
            {equipment.armor?.name || t("none")}
          </p>
        </div>
      </div>

      <div
        className="border-t border-gray-600 pt-4 flex-grow overflow-y-auto"
        style={{ maxHeight: "400px" }}
      >
        <h3 className="text-sm uppercase text-gray-400 font-semibold mb-2">
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
          <p className="text-gray-500 italic text-sm text-center mt-4">
            {t("backpackEmpty")}
          </p>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;
