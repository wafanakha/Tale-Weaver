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
            "Bagian cerita selanjutnya untuk kelompok. Jelaskan suasana, peristiwa, dan hasil dari tindakan pemain saat ini, termasuk pertempuran. Jadilah deskriptif dan menarik. Narasikan hasil dari setiap lemparan dadu.",
          choices:
            "Daftar 3-4 tindakan *saran* yang singkat dan relevan dengan konteks yang dapat diambil pemain saat ini. Pemain tidak terbatas pada pilihan ini.",
          dice_roll:
            "Jika tindakan pemain memerlukan uji keterampilan, berikan detail lemparan di sini. Abaikan jika tidak ada lemparan yang diperlukan.",
          dice_skill:
            "Keterampilan yang sedang diuji (misalnya, 'Persepsi', 'Atletik').",
          dice_roll_val:
            "Lemparan d20 yang disimulasikan (angka acak antara 1 dan 20).",
          dice_modifier:
            "Pengubah pemain untuk uji keterampilan ini, dihitung dari statistik dan kemahiran mereka.",
          dice_total: "Jumlah dari lemparan dan pengubah.",
          dice_dc: "Tingkat Kesulitan (angka target) untuk ujian ini.",
          dice_success: "Benar jika totalnya lebih besar atau sama dengan DC.",
          player_updates:
            "Daftar pembaruan status pemain. HANYA sertakan pemain yang statusnya telah berubah.",
          player_name: "Nama pemain yang sedang diperbarui.",
          player_hp: "HP saat ini (Current HP).",
          player_max_hp: "HP Maksimum baru (jika naik level).",
          player_level: "Level baru (jika naik level).",
          new_skills:
            "Daftar nama keterampilan/kemampuan/mantra baru yang diperoleh (jika naik level).",
          stats_update:
            "Objek yang berisi statistik yang ditingkatkan (misalnya { strength: 16 }).",
          inventory_add:
            "Daftar item untuk ditambahkan ke inventaris pemain (misalnya, barang rampasan).",
          inventory_remove:
            "Daftar NAMA item yang akan dihapus dari inventaris (misalnya, setelah menggunakan ramuan).",
          spell_slot_used:
            "Jika pemain merapal mantra yang menggunakan slot, catat di sini. Abaikan jika tidak ada slot yang digunakan.",
          spell_slot_level:
            "Tingkat slot mantra yang digunakan (harus 1 atau lebih).",
          enemy_update:
            "Pembaruan tentang musuh dalam pertempuran. Berikan detail lengkap untuk musuh baru. Atur is_defeated menjadi true jika HP adalah 0.",
          next_player:
            "Indeks pemain berikutnya yang akan bertindak. Dalam pertempuran, ini harus berputar melalui pemain. Di luar pertempuran, bisa jadi pemain mana pun yang relevan dengan cerita.",
          lore_entries:
            "Daftar entri lore baru yang ditemukan. Buat entri untuk orang, tempat, atau item penting saat diperkenalkan. Periksa `loreCodex` yang ada untuk menghindari duplikat.",
          equipment_weapon:
            "Senjata baru untuk dipasang langsung (objek Item).",
          equipment_armor: "Zirah baru untuk dipasang langsung (objek Item).",
        }
      : {
          story:
            "The next part of the story for the party. Describe the scene, events, and results of the current player's actions, including combat. Be descriptive and engaging. Narrate the outcome of any dice rolls.",
          choices:
            "A list of 3-4 brief, context-aware *suggested actions* the current player can take next. The player is not limited to these.",
          dice_roll:
            "If the player's action requires a skill check, provide the details of the roll here. Omit if no roll is needed.",
          dice_skill:
            "The skill being checked (e.g., 'Perception', 'Athletics').",
          dice_roll_val:
            "The simulated d20 roll (a random number between 1 and 20).",
          dice_modifier:
            "The player's modifier for this skill check, calculated from their stats and proficiency.",
          dice_total: "The sum of the roll and the modifier.",
          dice_dc: "The Difficulty Class (target number) for this check.",
          dice_success: "True if the total is greater than or equal to the DC.",
          player_updates:
            "A list of updates to any player's state. ONLY include players whose state has changed.",
          player_name: "The name of the player being updated.",
          player_hp: "The player's new Current HP.",
          player_max_hp:
            "The player's new Max HP (only if leveling up or buffed).",
          player_level: "The player's new Level (only if leveling up).",
          new_skills:
            "List of new ability/spell names gained (only if leveling up).",
          stats_update:
            "Object containing updated stats (e.g. { strength: 16 }) (only if leveling up).",
          inventory_add:
            "A list of items to add to the player's inventory (e.g., loot).",
          inventory_remove:
            "A list of item NAMES to remove from inventory (e.g., after using a potion).",
          spell_slot_used:
            "If the player casts a spell that uses a slot, note it here. Omit if no slot was used.",
          spell_slot_level:
            "The level of the spell slot expended (must be 1 or greater).",
          enemy_update:
            "Updates on the enemy in combat. Provide full details for a new enemy. Set is_defeated to true if HP is 0.",
          next_player:
            "The index of the next player to act. In combat, this should cycle through players. Outside combat, it could be any player relevant to the story.",
          lore_entries:
            "A list of new lore entries discovered. Create entries for important people, places, or items as they are introduced. Check the existing `loreCodex` to avoid duplicates.",
          equipment_weapon:
            "A new weapon to be automatically equipped (Item object).",
          equipment_armor:
            "A new armor to be automatically equipped (Item object).",
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
      is_game_over: { type: Type.BOOLEAN },
      ending_type: { type: Type.STRING, enum: ["victory", "defeat"] },
    },
    required: ["story", "choices"],
  };
};

const getSystemInstruction = (lang: Language, world?: WorldSetting): string => {
  const worldInfo = world
    ? `Setting: ${world.name}. Genre: ${world.genre}. Final Boss: ${world.finalBossName}. Description: ${world.description}`
    : "Setting: High Fantasy.";

  const languageRule =
    lang === "id"
      ? "IMPORTANT: You MUST write the 'story', 'choices', and descriptions in INDONESIAN (Bahasa Indonesia)."
      : "IMPORTANT: You MUST write the 'story', 'choices', and descriptions in ENGLISH.";

  return `You are a master Dungeon Master. 
${worldInfo}

**LANGUAGE MANDATE:**
${languageRule}
Even if the 'Current Game State' contains text in a different language, you must switch back to the target language defined above for your response.

**LEVEL UP RULES (CRITICAL):**
When a player reaches a new Level (XP >= MaxXP):
1. Increment their 'level'.
2. Set a new, higher 'maxXp' (Level 2: 100, Level 3: 300, Level 4: 600, Level 5: 1000).
3. Provide a GENEROUS 'stats_update'. Increase their primary stats (e.g., Strength for Fighters, Intelligence for Wizards) by +2 or +3.
4. Provide at least one powerful 'new_skills'. Give it a cool name like "Heavenly Strike" or "Shadow Step".
5. Increase 'maxHp' significantly (by 10-15 points).
6. Narrate the level up with epic flair, describing how their power manifests.
7. get health to new maxHP

**START OF ADVENTURE (MANDATORY):**
When the first action is "The adventure begins...", you MUST:
1. Greet the party and describe their immediate surroundings vividly.
2. In 'player_updates', you MUST provide starting gear for EVERY player in the party.
3. Assign each player a primary 'equipment_weapon' (e.g., Longsword, Staff), 'equipment_armor' (e.g., Leather Armor, Robes), and 2 'inventory_add' items (e.g., Health Potion, Torch).

**WORLD BUILDING & LORE:**
- Whenever you introduce a significant NPC, a historical event, or a specific landmark, you MUST include a matching entry in the 'lore_entries' array.
- This Lore Codex is how players track the world's secrets. DO NOT leave it empty if you mentioned something important in the story.

**ENDING CONDITIONS:**
1. **Victory**: Trigger 'is_game_over: true' and 'ending_type: victory' ONLY when the final boss (${world?.finalBossName}) is defeated. Write a triumphant conclusion.
2. **Defeat**: Trigger 'is_game_over: true' and 'ending_type: defeat' if the entire party reaches 0 HP or a critical story failure occurs. Write a tragic ending.

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
  )} \n Player Action: "${playerChoice}" language: ${
    lang === "id" ? "Indonesian" : "English"
  }`;

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
