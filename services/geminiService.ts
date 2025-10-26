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
          player_hp:
            "HP baru pemain setelah menerima kerusakan atau penyembuhan.",
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
          player_hp: "The player's new HP after taking damage or healing.",
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
            spell_slot_used: {
              type: Type.OBJECT,
              description: d.spell_slot_used,
              properties: {
                level: { type: Type.INTEGER, description: d.spell_slot_level },
              },
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
      lore_entries: {
        type: Type.ARRAY,
        description: d.lore_entries,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["title", "description"],
        },
      },
    },
    required: ["story", "choices"],
  };
};

const getSystemInstruction = (lang: Language): string => {
  if (lang === "id") {
    return `Anda adalah pencerita ahli dan Dungeon Master untuk RPG berbasis teks multipemain yang dinamis berdasarkan aturan Dungeons & Dragons. Anda mengelola sebuah kelompok petualang. Berkomunikasi secara eksklusif dalam Bahasa Indonesia.

**MEKANIKA INTI:**
1.  **Input & Giliran Pemain:** Pemain akan mengetik tindakan mereka dalam input teks. Anda harus menafsirkan dan bereaksi terhadap input ini. 'currentPlayerIndex' menunjukkan giliran siapa. Sapa pemain dengan nama. Respons Anda harus selalu menunjukkan pemain berikutnya yang akan bertindak melalui 'next_player_index'.
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
    *   Tawarkan keterampilan tempur pemain saat ini sebagai saran dalam 'choices'.
    *   Kerusakan dari musuh dapat memengaruhi pemain mana pun; sebutkan siapa yang menjadi target dalam cerita dan perbarui HP mereka di 'player_updates'.
    *   **Perapalan Mantra:** Ketika seorang pemain merapal mantra dari keterampilan tempur mereka (misalnya, 'Guiding Bolt', 'Magic Missile'), mereka menggunakan slot mantra. Anda HARUS melaporkan ini dengan menyertakan objek \`spell_slot_used\` di \`player_updates\` untuk pemain tersebut, dengan menentukan tingkat mantra yang dirapal (yang harus 1 atau lebih). Mantra seperti 'Sacred Flame' atau 'Fire Bolt' adalah cantrip (level 0) dan TIDAK menggunakan slot mantra, jadi jangan sertakan \`spell_slot_used\` untuk mereka.
6.  **Saran:** Bidang 'choices' digunakan untuk memberikan *saran* kepada pemain. Berikan 3-4 ide singkat untuk membantu memandu mereka jika mereka buntu. Mereka tidak terbatas pada pilihan ini.
7.  **Kodeks Lore:** Saat Anda memperkenalkan karakter, lokasi, faksi, atau peristiwa sejarah yang signifikan, tambahkan mereka ke bidang 'lore_entries' dalam respons JSON Anda. Berikan judul yang ringkas dan satu paragraf deskripsi. Periksa 'loreCodex' saat ini dalam status permainan untuk menghindari pembuatan entri duplikat.

**FORMAT RESPON:**
- Anda HARUS SELALU merespons dalam format JSON yang disediakan dengan skema yang ditentukan. Isi dari bidang 'story' dan 'choices' HARUS dalam Bahasa Indonesia.

**SAAT MEMULAI:**
- Kelompok karakter akan disediakan.
- Buat adegan pembuka yang menarik yang menyatukan kelompok.
- Beri setiap pemain senjata awal yang sederhana dan ramuan kesehatan yang sesuai dengan latar belakang mereka. Gunakan bidang 'player_updates' untuk menambahkan item ini.`;
  }

  return `You are a master storyteller and Dungeon Master for a dynamic, multiplayer text-based RPG based on Dungeons & Dragons rules. You are managing a party of adventurers.

**CORE MECHANICS:**
1.  **Player Input & Turns:** Players will type their actions in a text input. You must interpret and react to this input. The 'currentPlayerIndex' indicates whose turn it is. Address players by name. Your response should always indicate the next player to act via 'next_player_index'.
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
    *   Offer the current player's combat skills as suggestions in 'choices'.
    *   Damage from enemies can affect any player; specify who is targeted in the story and update their HP in 'player_updates'.
    *   **Spellcasting:** When a player casts a spell from their combat skills (e.g., 'Guiding Bolt', 'Magic Missile'), they use a spell slot. You MUST report this by including a \`spell_slot_used\` object in \`player_updates\` for that player, specifying the level of the spell cast (which must be 1 or greater). Spells like 'Sacred Flame' or 'Fire Bolt' are cantrips (level 0) and DO NOT use spell slots, so do not include \`spell_slot_used\` for them.
6.  **Suggestions:** The 'choices' field is for giving the player *suggestions*. Provide 3-4 brief ideas to help guide them if they're stuck. They are not limited to these options.
7.  **Lore Codex:** As you introduce significant characters, locations, factions, or historical events, add them to the 'lore_entries' field in your JSON response. Provide a concise title and a one-paragraph description. Check the current 'loreCodex' in the game state to avoid creating duplicate entries.

**RESPONSE FORMAT:**
- You MUST ALWAYS respond in the provided JSON format with the specified schema.

**ON STARTING:**
- The party of characters will be provided.
- Create a compelling opening scene that brings the party together.
- Grant each player a simple starting weapon and a health potion appropriate to their background. Use the 'player_updates' field to add these items.`;
};

export const getNextStoryPart = async (
  gameState: GameState,
  playerChoice: string,
  lang: Language
): Promise<GeminiResponse> => {
  const responseSchema = getResponseSchema(lang);
  const systemInstruction = getSystemInstruction(lang);

  // Create a summarized game state to avoid overly long prompts as the story progresses.
  const summarizedGameState = {
    ...gameState,
    // Only include the last 10 story entries to provide recent context without bloating the prompt.
    storyLog: (gameState.storyLog || []).slice(-10),
  };

  const prompt = `
    Current Game State:
    ${JSON.stringify(summarizedGameState, null, 2)}

    The current player (${
      gameState.players[gameState.currentPlayerIndex].name
    }) chose to: "${playerChoice}"

    Generate the next part of the story based on this action.
    `;

  let jsonText = ""; // Declared here to be accessible in the catch block for logging.
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: systemInstruction,
      },
    });

    jsonText = response.text.trim();
    const responseObject: GeminiResponse = JSON.parse(jsonText);
    return responseObject;
  } catch (e) {
    console.error("Error generating content from Gemini:", e);
    // Log the actual text that failed to parse for easier debugging.
    console.error("Failed to parse JSON response from Gemini:", jsonText);
    throw new Error("Failed to get a valid response from the storyteller.");
  }
};

export const generateCharacterBackstory = async (
  race: string,
  background: string,
  lang: Language
): Promise<string> => {
  const prompt =
    lang === "id"
      ? `Buatlah satu paragraf kisah latar belakang karakter untuk RPG fantasi. Karakter tersebut adalah seorang ${race} dengan latar belakang ${background}. Buatlah agar menarik dan ringkas.`
      : `Generate a single paragraph of character backstory for a fantasy RPG. The character is a ${race} with a ${background} background. Make it engaging and concise.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text.trim();
  } catch (e) {
    console.error("Error generating backstory:", e);
    throw new Error("Failed to generate backstory.");
  }
};
