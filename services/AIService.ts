import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse, WorldSetting } from "../types";
import { Language } from "../i18n";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getResponseSchema = (lang: Language) => {
  const d =
    lang === "id"
      ? {
          story:
            "Bagian cerita selanjutnya. Narasikan hasil tindakan dan perkembangan cerita.",
          choices: "3-4 saran tindakan berikutnya.",
          dice_roll: "Detail lemparan dadu jika ada uji keterampilan.",
          player_updates: "Pembaruan status pemain.",
          equipment_weapon:
            "Senjata baru untuk dipasang langsung (objek Item).",
          equipment_armor: "Zirah baru untuk dipasang langsung (objek Item).",
          inventory_add: "Item baru untuk ditambahkan ke tas punggung.",
          inventory_remove: "Nama item yang dihapus.",
          next_player: "Indeks pemain berikutnya (0, 1, dst).",
          lore_entries: "Penemuan lore baru.",
        }
      : {
          story:
            "The next part of the story. Narrate results of actions and story progression.",
          choices: "3-4 suggested next actions.",
          dice_roll: "Dice roll details if a skill check occurred.",
          player_updates: "Updates to player states.",
          equipment_weapon:
            "A new weapon to be automatically equipped (Item object).",
          equipment_armor:
            "A new armor to be automatically equipped (Item object).",
          inventory_add: "New items to add to the backpack.",
          inventory_remove: "Names of items to remove.",
          next_player: "The index of the next player to act (0, 1, etc).",
          lore_entries: "New lore discoveries.",
        };

  const itemSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      type: { type: Type.STRING, enum: ["weapon", "armor", "potion", "misc"] },
      description: { type: Type.STRING },
      damage: { type: Type.INTEGER },
      armorClass: { type: Type.INTEGER },
      healing: { type: Type.INTEGER },
    },
    required: ["name", "type", "description"],
  };

  return {
    type: Type.OBJECT,
    properties: {
      story: { type: Type.STRING, description: d.story },
      choices: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: d.choices,
      },
      dice_roll: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          roll: { type: Type.INTEGER },
          modifier: { type: Type.INTEGER },
          total: { type: Type.INTEGER },
          dc: { type: Type.INTEGER },
          success: { type: Type.BOOLEAN },
          rolling_player_name: {
            type: Type.STRING,
            description: "The name of the character who must roll the dice.",
          },
        },
        required: [
          "skill",
          "roll",
          "modifier",
          "total",
          "dc",
          "success",
          "rolling_player_name",
        ],
      },
      player_updates: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            playerName: { type: Type.STRING },
            hp: { type: Type.INTEGER },
            maxHp: { type: Type.INTEGER },
            xp: { type: Type.INTEGER },
            maxXp: { type: Type.INTEGER },
            level: { type: Type.INTEGER },
            equipment_weapon: {
              ...itemSchema,
              description: d.equipment_weapon,
            },
            equipment_armor: { ...itemSchema, description: d.equipment_armor },
            inventory_add: {
              type: Type.ARRAY,
              items: itemSchema,
              description: d.inventory_add,
            },
            inventory_remove: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: d.inventory_remove,
            },
            status_effects_add: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["buff", "debuff"] },
                  description: { type: Type.STRING },
                  icon: { type: Type.STRING },
                },
              },
            },
          },
          required: ["playerName"],
        },
      },
      enemy_update: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hp: { type: Type.INTEGER },
          maxHp: { type: Type.INTEGER },
          xpValue: { type: Type.INTEGER },
          is_defeated: { type: Type.BOOLEAN },
        },
      },
      next_player_index: { type: Type.INTEGER, description: d.next_player },
      lore_entries: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
        },
      },
    },
    required: ["story", "choices"],
  };
};

const getSystemInstruction = (lang: Language, world?: WorldSetting): string => {
  const worldInfo = world
    ? `Setting: ${world.name}. Genre: ${world.genre}. Description: ${world.description}`
    : "Setting: High Fantasy.";

  return `You are a master Dungeon Master. 
${worldInfo}

**TURN ORDER & ROLLS:**
1. You MUST track which player is currently acting.
2. If a player performs an action that requires a dice roll (like a Perception check):
   - You MUST include 'dice_roll' in your response.
   - You MUST set 'rolling_player_name' to the character currently rolling.
   - You MUST NOT increment the turn until the roll is resolved. Set 'next_player_index' to that same player's index.
3. Only move to the next player's index when an action is fully completed or after a roll's outcome is narrated.

**STARTING THE JOURNEY:**
In the very first turn (when 'Adventure Begins'), you MUST:
1. Introduce the party in their current location.
2. Assign appropriate starting equipment to EVERY player in the 'player_updates' array.
3. Use 'equipment_weapon' and 'equipment_armor' to equip them immediately.
4. Give Fighters/Paladins armor and martial weapons, Wizards staves/robes, Rogues daggers/leather, etc.
5. Add basic survival items (rations, torches, potions) to their 'inventory_add'.

**FAST PROGRESSION & XP:**
Eldoria is a fast-paced adventure. Reward XP generously to make leveling up easier!
- **XP Thresholds:** Level 2 (100 XP), Level 3 (300 XP), Level 4 (600 XP), Level 5 (1000 XP).
- **Combat:** Killing even a simple guard or wolf should give 25-50 XP to each player.
- **Exploration:** Give 10-20 XP for discovering a new room, a secret door, or reading a lore entry.
- **Roleplay:** Give 15-30 XP for clever ideas, successful persuasion, or creative solutions.
- **Goal Reached:** Give 50+ XP for finishing a quest or reaching a safe haven.

**CORE RULES:**
- Narrate outcomes of player actions and dice rolls.
- Use **bold** (double asterisks) for important names, locations, and key items.
- Maintain a consistent, immersive tone.
- Resolve combat rounds in a single response. Describe enemy attacks if the player round ends.`;
};

export const getNextStoryPart = async (
  gameState: GameState,
  playerChoice: string,
  lang: Language
): Promise<GeminiResponse> => {
  const prompt = `Current Game State: ${JSON.stringify(
    gameState
  )} \n Player Action: "${playerChoice}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getResponseSchema(lang),
        systemInstruction: getSystemInstruction(lang, gameState.worldSetting),
      },
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini Error:", e);
    throw new Error("The storyteller is momentarily distracted...");
  }
};

export const generateCharacterBackstory = async (
  name: string,
  race: string,
  background: string,
  lang: Language
): Promise<string> => {
  const prompt = `Write a short, immersive fantasy backstory (2-3 paragraphs) for a ${race} character named ${name} with a ${background} background. Language: ${
    lang === "id" ? "Indonesian" : "English"
  }.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "";
  } catch (e) {
    console.error("Backstory generation failed:", e);
    return "";
  }
};
