import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse } from "../types";
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
            "Daftar 3-4 tindakan berbeda yang relevan dengan konteks yang dapat diambil pemain saat ini selanjutnya. Sertakan opsi tempur dan keterampilan tempur yang tersedia jika sedang dalam pertarungan.",
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
          player_hp:
            "HP baru pemain setelah menerima kerusakan atau penyembuhan.",
          inventory_add:
            "Daftar item untuk ditambahkan ke inventaris pemain (misalnya, barang rampasan).",
          inventory_remove:
            "Daftar NAMA item yang akan dihapus dari inventaris (misalnya, setelah menggunakan ramuan).",
          enemy_update:
            "Pembaruan tentang musuh dalam pertempuran. Berikan detail lengkap untuk musuh baru. Atur is_defeated menjadi true jika HP adalah 0.",
          next_player:
            "Indeks pemain berikutnya yang akan bertindak. Dalam pertempuran, ini harus berputar melalui pemain. Di luar pertempuran, bisa jadi pemain mana pun yang relevan dengan cerita.",
        }
      : {
          story:
            "The next part of the story for the party. Describe the scene, events, and results of the current player's actions, including combat. Be descriptive and engaging. Narrate the outcome of any dice rolls.",
          choices:
            "A list of 3-4 distinct, context-aware actions the current player can take next. Include combat options and available combat skills if in a fight.",
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
          player_hp: "The player's new HP after taking damage or healing.",
          inventory_add:
            "A list of items to add to the player's inventory (e.g., loot).",
          inventory_remove:
            "A list of item NAMES to remove from inventory (e.g., after using a potion).",
          enemy_update:
            "Updates on the enemy in combat. Provide full details for a new enemy. Set is_defeated to true if HP is 0.",
          next_player:
            "The index of the next player to act. In combat, this should cycle through players. Outside combat, it could be any player relevant to the story.",
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
        description: d.dice_roll,
        properties: {
          skill: { type: Type.STRING, description: d.dice_skill },
          roll: { type: Type.INTEGER, description: d.dice_roll_val },
          modifier: { type: Type.INTEGER, description: d.dice_modifier },
          total: { type: Type.INTEGER, description: d.dice_total },
          dc: { type: Type.INTEGER, description: d.dice_dc },
          success: { type: Type.BOOLEAN, description: d.dice_success },
        },
      },
      player_updates: {
        type: Type.ARRAY,
        description: d.player_updates,
        items: {
          type: Type.OBJECT,
          properties: {
            playerName: { type: Type.STRING, description: d.player_name },
            hp: { type: Type.INTEGER, description: d.player_hp },
            inventory_add: {
              type: Type.ARRAY,
              description: d.inventory_add,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: ["weapon", "armor", "potion", "misc"],
                  },
                  description: { type: Type.STRING },
                  damage: {
                    type: Type.INTEGER,
                    description: "Damage value if it's a weapon.",
                  },
                  armorClass: {
                    type: Type.INTEGER,
                    description: "Armor value if it's armor.",
                  },
                  healing: {
                    type: Type.INTEGER,
                    description: "HP to restore if it's a potion.",
                  },
                },
              },
            },
            inventory_remove: {
              type: Type.ARRAY,
              description: d.inventory_remove,
              items: { type: Type.STRING },
            },
          },
        },
      },
      enemy_update: {
        type: Type.OBJECT,
        description: d.enemy_update,
        properties: {
          name: { type: Type.STRING },
          hp: { type: Type.INTEGER },
          maxHp: { type: Type.INTEGER },
          is_defeated: { type: Type.BOOLEAN },
        },
      },
      next_player_index: { type: Type.INTEGER, description: d.next_player },
    },
    required: ["story", "choices"],
  };
};

const getSystemInstruction = (lang: Language): string => {
  if (lang === "id") {
    return `Anda adalah pencerita ahli dan Dungeon Master untuk RPG berbasis teks multipemain yang dinamis berdasarkan aturan Dungeons & Dragons. Anda mengelola sebuah kelompok petualang. Berkomunikasi secara eksklusif dalam Bahasa Indonesia.

**MEKANIKA INTI:**
1.  **Kelompok & Giliran:** Anda akan mengelola kelompok pemain. 'currentPlayerIndex' menunjukkan giliran siapa. Sapa pemain dengan nama. Respons Anda harus selalu menunjukkan pemain berikutnya yang akan bertindak melalui 'next_player_index'.
2.  **Statistik & Pengubah:** Setiap pemain memiliki enam statistik inti. Pengubah untuk sebuah statistik dihitung sebagai floor((stat - 10) / 2).
3.  **Uji Keterampilan:** Ketika seorang pemain mencoba tindakan dengan hasil yang tidak pasti, Anda akan memulai uji keterampilan.
    *   **Tentukan Keterampilan & DC:** Putuskan keterampilan yang sesuai dan tetapkan Tingkat Kesulitan (DC) berdasarkan tantangan (mis., Mudah=10, Sedang=15, Sulit=20).
    *   **Hitung Pengubah:** Gunakan statistik dan keterampilan pemain SAAT INI. Pengubahnya adalah pengubah stat mereka + bonus kemahiran +2 jika mereka mahir dalam keterampilan tersebut.
    *   **Simulasikan Lemparan & Tentukan Hasil:** Hasilkan lemparan d20. Jika lemparan + pengubah >= DC, ujian berhasil.
    *   **Laporkan:** Anda HARUS melaporkan detail ujian di bidang 'dice_roll' dari respons JSON Anda.
4.  **Narasikan:** Di bidang 'story', narasikan hasil tindakan untuk seluruh kelompok. Jelaskan apa yang terjadi karena keberhasilan atau kegagalan.
5.  **Pertempuran:**
    *   Pertempuran berbasis giliran. Berputar melalui pemain menggunakan 'next_player_index'.
    *   Jelaskan tindakan pemain saat ini dan musuh apa pun.
    *   Tawarkan keterampilan tempur pemain saat ini sebagai pilihan.
    *   Kerusakan dari musuh dapat memengaruhi pemain mana pun; sebutkan siapa yang menjadi target dalam cerita dan perbarui HP mereka di 'player_updates'.
6.  **Status Game:** Kelola semua status pemain, inventaris, dan pertemuan pertempuran berdasarkan status JSON yang disediakan.

**FORMAT RESPON:**
- Anda HARUS SELALU merespons dalam format JSON yang disediakan dengan skema yang ditentukan. Isi dari bidang 'story' dan 'choices' HARUS dalam Bahasa Indonesia.

**SAAT MEMULAI:**
- Kelompok karakter akan disediakan.
- Buat adegan pembuka yang menarik yang menyatukan kelompok.
- Beri setiap pemain senjata awal yang sederhana dan ramuan kesehatan yang sesuai dengan latar belakang mereka. Gunakan bidang 'player_updates' untuk menambahkan item ini.`;
  }

  return `You are a master storyteller and Dungeon Master for a dynamic, multiplayer text-based RPG based on Dungeons & Dragons rules. You are managing a party of adventurers.

**CORE MECHANICS:**
1.  **Party & Turns:** You will manage a party of players. The 'currentPlayerIndex' indicates whose turn it is. Address players by name. Your response should always indicate the next player to act via 'next_player_index'.
2.  **Stats & Modifiers:** Each player has six core stats. The modifier for a stat is calculated as floor((stat - 10) / 2).
3.  **Skill Checks:** When a player attempts an action with an uncertain outcome, you will initiate a skill check.
    *   **Determine Skill & DC:** Decide the appropriate skill and set a Difficulty Class (DC) based on the challenge (e.g., Easy=10, Medium=15, Hard=20).
    *   **Calculate Modifier:** Use the CURRENT player's stats and skills. The modifier is their stat modifier + a proficiency bonus of +2 if they are proficient in the skill.
    *   **Simulate Roll & Determine Outcome:** Generate a d20 roll. If roll + modifier >= DC, the check succeeds.
    *   **Report:** You MUST report the check's details in the 'dice_roll' field of your JSON response.
4.  **Narrate:** In the 'story' field, narrate the outcome of actions for the whole party. Describe what happens because of success or failure.
5.  **Combat:**
    *   Combat is turn-based. Cycle through players using 'next_player_index'.
    *   Describe the actions of the current player and any enemies.
    *   Offer the current player's combat skills as choices.
    *   Damage from enemies can affect any player; specify who is targeted in the story and update their HP in 'player_updates'.
6.  **Game State:** Manage all players' states, inventories, and combat encounters based on the provided JSON state.

**RESPONSE FORMAT:**
- You MUST ALWAYS respond in the provided JSON format with the specified schema.

**ON STARTING:**
- The party of characters will be provided.
- Create a compelling opening scene that brings the party together.
- Give each player a simple starting weapon and a health potion that fits their background. Use the 'player_updates' field to add these items.`;
};

export const getNextStoryPart = async (
  currentState: GameState,
  playerChoice: string,
  lang: Language
): Promise<GeminiResponse> => {
  const isFirstTurn =
    !currentState.storyLog || currentState.storyLog.length === 0;

  const actingPlayerName =
    currentState.players.length > 0
      ? currentState.players[currentState.currentPlayerIndex].name
      : "System";

  const stateForPrompt = {
    ...currentState,
    storyLog: (currentState.storyLog || []).slice(-10),
  };

  let actionText: string;
  let instructionText: string;

  if (isFirstTurn) {
    actionText = "";
    instructionText =
      lang === "id"
        ? `Ini adalah awal petualangan. Hasilkan adegan pembuka yang menarik untuk kelompok yang disediakan dalam status permainan, dan berikan setiap pemain item awal (senjata dan ramuan kesehatan) yang sesuai dengan latar belakang mereka menggunakan bidang 'player_updates'. Tetapkan pemain berikutnya ke indeks 0.`
        : `This is the start of the adventure. Generate a compelling opening scene for the party provided in the game state, and provide each player with starting items (a weapon and a health potion) that fit their background using the 'player_updates' field. Set the next player to index 0.`;
  } else {
    actionText =
      lang === "id"
        ? `Tindakan Pemain dari ${actingPlayerName}: "${playerChoice}"`
        : `Player's Action from ${actingPlayerName}: "${playerChoice}"`;
    instructionText =
      lang === "id"
        ? `Berdasarkan keadaan saat ini dan tindakan pemain, hasilkan bagian cerita selanjutnya untuk kelompok, ikuti semua aturan.`
        : `Based on the current state and the player's action, generate the next part of the story for the party, following all the rules.`;
  }

  const prompt = `
    Current Game State (summary of recent events):
    ${JSON.stringify(stateForPrompt, null, 2)}

    ${actionText}

    ${instructionText}
    `;

  let rawResponseText = "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(lang),
        responseMimeType: "application/json",
        responseSchema: getResponseSchema(lang),
        temperature: 0.8,
      },
    });

    rawResponseText = response.text;
    let jsonText = rawResponseText.trim();

    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.substring(7);
      if (jsonText.endsWith("```")) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();
    }

    const parsedResponse: GeminiResponse = JSON.parse(jsonText);
    return parsedResponse;
  } catch (e) {
    console.error("Error generating content from Gemini:", e);
    if (e instanceof SyntaxError) {
      console.error(
        "Failed to parse JSON response from Gemini:",
        rawResponseText
      );
    }
    throw new Error("Failed to get a valid response from the storyteller.");
  }
};

export const generateStoryImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "16:9",
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (e) {
    console.error("Error generating image from Imagen:", e);
    // Fail gracefully in the UI
    return "";
  }
};

export const generateCharacterBackstory = async (
  race: string,
  background: string,
  lang: Language
): Promise<string> => {
  const prompt =
    lang === "id"
      ? `Buatlah kisah latar karakter yang singkat dan menarik untuk ${race} ${background} di dunia fantasi tinggi. Kisah latar harus sepanjang 2-4 kalimat dan memberikan kaitan untuk sebuah petualangan.`
      : `Generate a short, compelling character backstory for a ${race} ${background} in a high-fantasy world. The backstory should be 2-4 sentences long and provide a hook for an adventure.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.9,
      },
    });
    return response.text.trim();
  } catch (e) {
    console.error("Error generating character backstory:", e);
    throw new Error("Failed to generate backstory from the storyteller.");
  }
};

export const generateCharacterAvatar = async (
  race: string,
  background: string
): Promise<string> => {
  const prompt = `Fantasy character portrait of a ${race} ${background}. Shoulder-level portrait. Simple background.`;
  try {
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "1:1",
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No avatar image was generated.");
    }
  } catch (e) {
    console.error("Error generating character avatar from Imagen:", e);
    return "";
  }
};
