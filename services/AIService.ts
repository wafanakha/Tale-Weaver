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
            new_skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "New combat abilities or spells learned.",
            },
            stats_update: {
              type: Type.OBJECT,
              properties: {
                strength: { type: Type.INTEGER },
                dexterity: { type: Type.INTEGER },
                constitution: { type: Type.INTEGER },
                intelligence: { type: Type.INTEGER },
                wisdom: { type: Type.INTEGER },
                charisma: { type: Type.INTEGER },
              },
              description:
                "The amount to INCREASE each stat by during level up.",
            },
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

**LEVEL UP RULES (CRITICAL):**
When a player reaches a new Level (XP >= MaxXP):
1. Increment their 'level'.
2. Set a new, higher 'maxXp' (Level 2: 100, Level 3: 300, Level 4: 600, Level 5: 1000).
3. Provide a GENEROUS 'stats_update'. Increase their primary stats (e.g., Strength for Fighters, Intelligence for Wizards) by +2 or +3.
4. Provide at least one powerful 'new_skills'. Give it a cool name like "Heavenly Strike" or "Shadow Step".
5. Increase 'maxHp' significantly (by 10-15 points).
6. Narrate the level up with epic flair, describing how their power manifests.

**START OF ADVENTURE (MANDATORY):**
When the first action is "The adventure begins...", you MUST:
1. Greet the party and describe their immediate surroundings vividly.
2. In 'player_updates', you MUST provide starting gear for EVERY player in the party.
3. Assign each player a primary 'equipment_weapon' (e.g., Longsword, Staff), 'equipment_armor' (e.g., Leather Armor, Robes), and 2 'inventory_add' items (e.g., Health Potion, Torch).

**WORLD BUILDING & LORE:**
- Whenever you introduce a significant NPC, a historical event, or a specific landmark, you MUST include a matching entry in the 'lore_entries' array.
- This Lore Codex is how players track the world's secrets. DO NOT leave it empty if you mentioned something important in the story.

**LEVEL UP RULES:**
- When XP >= MaxXP, increment 'level', increase primary stats by +2 or +3 in 'stats_update', and provide a unique named skill in 'new_skills'.


**TURN ORDER & ROLLS:**
1. Track which player is currently acting.
2. If a player performs an action that requires a dice roll:
   - Include 'dice_roll' and set 'rolling_player_name'.
   - DO NOT increment the turn until the roll is resolved.
3. Only move to 'next_player_index' when an action is completed.

**CORE RULES:**
- Narrate results vividly.
- Use **bold** for key items/locations.
- Resolve combat rounds efficiently but narratively.`;
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
