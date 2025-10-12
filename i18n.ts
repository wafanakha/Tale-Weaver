import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

const translations = {
  en: {
    // Welcome
    welcomeTitle: "Tale Weaver",
    welcomeDescription:
      "Gather your party, brave adventurers! A world of fantasy, danger, and untold stories awaits. Your journey is shaped by your choices, and the narrative is woven by a master storyteller. Are you ready to begin?",
    assembleParty: "Assemble Your Party",
    // Lobby
    joinAdventure: "Join the Adventure",
    createNewGame: "Create New Game",
    or: "OR",
    joinExistingGame: "Join Existing Game",
    enterGameId: "ENTER GAME ID",
    joinGame: "Join Game",
    partyLobby: "Party Lobby",
    shareGameId: "Share this Game ID with your friends to invite them:",
    adventurersJoined: "Adventurers Joined",
    waitingForAdventurers: "Waiting for adventurers to arrive...",
    startAdventure: "Start Adventure",
    waitingForHost: "Waiting for the host to start the game...",
    // Character Creation
    createAdventurer: "Create Your Adventurer",
    name: "Name",
    characterNamePlaceholder: "Character's name",
    race: "Race",
    background: "Background",
    assignStats: "Assign Stats",
    assignStatsDesc:
      "Assign each score from the standard array ({scores}) to a stat.",
    backstory: "Backstory (Optional)",
    backstoryPlaceholder: "Write a short backstory, or let us generate one.",
    generateWithAi: "Generate with AI",
    generating: "Generating...",
    cancel: "Cancel",
    createCharacter: "Create Character",
    addingToParty: "Adding to party...",
    // Game Screen
    yourStory: "Your Story",
    whatWillPlayerDo: "What will {playerName} do?",
    theParty: "The Party",
    you: "(You)",
    yourInventory: "Your Inventory",
    equipped: "Equipped",
    weapon: "Weapon",
    armor: "Armor",
    none: "None",
    carriedItems: "Carried Items",
    backpackEmpty: "Backpack is empty.",
    equip: "Equip",
    combat: "Combat",
    // Loading/Messages
    storytellerWeavingFate: "The storyteller is weaving your fate...",
    playerEquippedItem: "{playerName} equipped the {itemName}.",
    // Gemini Service Related
    storytellerError:
      "The storyteller seems to have lost their train of thought.",
    adventureBegins:
      "The adventure begins for our party of heroes. Introduce them and the scene.",
    // Dice Roll
    skillCheck: "{skill} Check",
    success: "Success",
    failure: "Failure",
    // Game Errors
    failedToCreateGame: "Failed to create a new game. Please try again.",
    gameAlreadyStarted: "This game has already started.",
    gameNotFound: "Game not found.",
    failedToJoinGame: "Failed to join game. Please check the ID and try again.",
  },
  id: {
    // Welcome
    welcomeTitle: "Tale Weaver",
    welcomeDescription:
      "Kumpulkan kelompokmu, para petualang pemberani! Dunia fantasi, bahaya, dan kisah tak terhingga menanti. Perjalananmu dibentuk oleh pilihanmu, dan narasinya ditenun oleh seorang ahli cerita. Apakah kamu siap untuk memulai?",
    assembleParty: "Kumpulkan Kelompokmu",
    // Lobby
    joinAdventure: "Ikuti Petualangan",
    createNewGame: "Buat Game Baru",
    or: "ATAU",
    joinExistingGame: "Gabung Game yang Ada",
    enterGameId: "MASUKKAN ID GAME",
    joinGame: "Gabung Game",
    partyLobby: "Lobi Kelompok",
    shareGameId:
      "Bagikan ID Game ini dengan teman-temanmu untuk mengundang mereka:",
    adventurersJoined: "Petualang yang Bergabung",
    waitingForAdventurers: "Menunggu para petualang tiba...",
    startAdventure: "Mulai Petualangan",
    waitingForHost: "Menunggu tuan rumah memulai permainan...",
    // Character Creation
    createAdventurer: "Ciptakan Petualangmu",
    name: "Nama",
    characterNamePlaceholder: "Nama karakter",
    race: "Ras",
    background: "Latar Belakang",
    assignStats: "Atur Statistik",
    assignStatsDesc:
      "Tetapkan setiap skor dari set standar ({scores}) ke sebuah statistik.",
    backstory: "Kisah Latar (Opsional)",
    backstoryPlaceholder:
      "Tulis kisah latar singkat, atau biarkan kami yang membuatnya.",
    generateWithAi: "✨ Buat dengan AI",
    generating: "Membuat...",
    cancel: "Batal",
    createCharacter: "Buat Karakter",
    addingToParty: "Menambahkan ke kelompok...",
    // Game Screen
    yourStory: "Kisahmu",
    whatWillPlayerDo: "Apa yang akan {playerName} lakukan?",
    theParty: "Kelompok",
    you: "(Anda)",
    yourInventory: "Inventaris Anda",
    equipped: "Terpasang",
    weapon: "Senjata",
    armor: "Zirah",
    none: "Tidak ada",
    carriedItems: "Barang Bawaan",
    backpackEmpty: "Tas punggung kosong.",
    equip: "Pasang",
    combat: "Pertarungan",
    // Loading/Messages
    storytellerWeavingFate: "Sang pencerita sedang menenun takdirmu...",
    playerEquippedItem: "{playerName} memasang {itemName}.",
    // Gemini Service Related
    storytellerError: "Sang pencerita sepertinya kehilangan alur pikirannya.",
    adventureBegins:
      "Petualangan dimulai untuk kelompok pahlawan kita. Perkenalkan mereka dan latarnya.",
    // Dice Roll
    skillCheck: "Uji {skill}",
    success: "Berhasil",
    failure: "Gagal",
    // Game Errors
    failedToCreateGame: "Gagal membuat game baru. Silakan coba lagi.",
    gameAlreadyStarted: "Game ini sudah dimulai.",
    gameNotFound: "Game tidak ditemukan.",
    failedToJoinGame:
      "Gagal bergabung dengan game. Silakan periksa ID dan coba lagi.",
  },
};

export type Language = "en" | "id";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "en";
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    localStorage.setItem("language", lang);
    setLanguageState(lang);
  };

  const t = (
    key: string,
    replacements: Record<string, string | number> = {}
  ): string => {
    const text =
      translations[language][key as keyof typeof translations.en] ||
      translations.en[key as keyof typeof translations.en];

    if (!text) return key;

    let result = String(text);
    for (const placeholder in replacements) {
      result = result.replace(
        `{${placeholder}}`,
        String(replacements[placeholder])
      );
    }
    return result;
  };

  // FIX: Replaced JSX with React.createElement to resolve parsing issues in this .ts file. The compiler was not interpreting JSX syntax correctly, leading to multiple errors.
  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
