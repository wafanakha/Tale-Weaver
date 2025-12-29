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
    loadGame: "Load Game",
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
    // --- CLASS DESCRIPTIONS (RENAMED) ---
    classClericDescription:
      "A divine warrior who wields magic in service of a higher power. Proficient with medium armor and spells like Guiding Bolt.",
    classFighterDescription:
      "A master of combat, proficient with all armor and weapons. With high stamina (1d10 Hit Dice), they are a force on the battlefield.",
    classThiefDescription:
      "A cunning opportunist who uses stealth (Sneak Attack) and dexterity to overcome foes. Excels in skills and finesse.",
    classWizardDescription:
      "A scholarly master of arcane magic. Though fragile (1d6 Hit Dice), they command powerful spells like Fire Bolt and Magic Missile.",

    // --- RACE DESCRIPTIONS (NEW) ---
    raceHumanDescription:
      "Versatile and ambitious. Humans gain one extra language and have a standard speed of 30 ft.",
    raceElfDescription:
      "Graceful and perceptive. Elves are proficient in Elvish and have a standard speed of 30 ft.",
    raceDwarfDescription:
      "Resilient and hardy. Dwarves are proficient in Dwarvish and have a movement speed of 25 ft due to their shorter legs.",
    raceHalflingDescription:
      "Small and lucky. Halflings are proficient in their own tongue and have a movement speed of 25 ft.",
    raceOrcDescription:
      "Strong and imposing. Orcs are proficient in Orcish and have a standard speed of 30 ft.",

    // --- BACKGROUND DESCRIPTIONS (NEW) ---
    bgNobleDescription:
      "You are a person of privilege and power. You are proficient in Persuasion and History.",
    bgRogueDescription:
      "You have a shady past, living in a world of secrets and illicit deeds. You are proficient in Stealth and Deception.",
    bgScholarDescription:
      "You have spent your life in study and contemplation. You are proficient in Arcana and Investigation.",
    bgSoldierDescription:
      "You are a trained warrior, familiar with the chain of command. You are proficient in Athletics and Perception.",
    bgOutcastDescription:
      "You grew up on the fringes of society, fending for yourself. You are proficient in Stealth and Perception.",
    // --- STAT DESCRIPTIONS (NEW) ---
    strengthDescription:
      "Measures physical power, athletic training, and the extent to which you can exert raw physical force.",

    dexterityDescription: "Measures agility, reflexes, and balance.",

    constitutionDescription: "Measures health, stamina, and vital force.",

    intelligenceDescription:
      "Measures mental acuity, accuracy of recall, and the ability to reason.",

    wisdomDescription:
      "Measures perceptiveness, intuition, and practical judgment.",

    charismaDescription:
      "Measures force of personality, persuasiveness, and leadership.",

    createAdventurer: "Create Your Adventurer",
    name: "Name",
    characterNamePlaceholder: "Character's name",
    race: "Race",
    class: "Class",
    background: "Background",
    assignStats: "Assign Stats",
    assignStatsDesc:
      "Assign each score from the standard array ({scores}) to a stat.",
    backstory: "Backstory (Optional)",
    backstoryPlaceholder: "Write a short backstory, or let us generate one.",
    generateWithAi: "✨ Generate with AI",
    generating: "Generating...",
    cancel: "Cancel",
    createCharacter: "Create Character",
    addingToParty: "Adding to party...",
    // Game Screen
    yourStory: "Your Story",
    whatWillPlayerDo: "It is {playerName}'s turn.",
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
    actionInputPlaceholder: "What do you do?",
    submitAction: "Submit",
    suggestions: "Suggestions",
    loreCodex: "Lore Codex",
    noDiscoveries: "No discoveries yet.",
    // Character Sheet
    characterSheet: "Character Sheet",
    savingThrows: "Saving Throws",
    skills: "Skills",
    proficienciesAndLanguages: "Proficiencies & Languages",
    armorClass: "Armor Class",
    initiative: "Initiative",
    speed: "Speed",
    hitPoints: "Hit Points",
    current: "Current",
    max: "Max",
    hitDice: "Hit Dice",
    attacksAndSpellcasting: "Attacks & Spellcasting",
    combatSkills: "Combat Skills",
    spellSlots: "Spell Slots",
    activeEffects: "Active Effects",
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
    // Load Game Screen
    players: "Players",
    noPlayersYet: "No players yet",
    status: "Status",
    noSavedGames: "No saved games found.",
    back: "Back",
  },
  id: {
    // Welcome
    welcomeTitle: "Tale Weaver",
    welcomeDescription:
      "Kumpulkan kelompokmu, para petualang pemberani! Dunia fantasi, bahaya, dan kisah tak terhingga menanti. Perjalananmu dibentuk oleh pilihanmu, dan narasinya ditenun oleh seorang ahli cerita. Apakah kamu siap untuk memulai?",
    assembleParty: "Kumpulkan Kelompokmu",
    loadGame: "Muat Game",
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
    // --- CLASS DESCRIPTIONS (RENAMED) ---
    classClericDescription:
      "Seorang pejuang suci yang menggunakan sihir untuk melayani kekuatan yang lebih tinggi. Mahir dengan zirah medium dan mantra seperti Guiding Bolt.",
    classFighterDescription:
      "Seorang ahli tempur, mahir dengan semua zirah dan senjata. Dengan stamina tinggi (d10 Dadu Nyawa), mereka adalah kekuatan di medan perang.",
    classThiefDescription:
      "Seorang oportunis licik yang menggunakan kesunyian (Sneak Attack) dan kegesitan untuk mengalahkan musuh. Unggul dalam keterampilan dan ketangkasan.",
    classWizardDescription:
      "Seorang ahli sihir misterius yang terpelajar. Meskipun rapuh (d6 Dadu Nyawa), mereka menguasai mantra kuat seperti Fire Bolt dan Magic Missile.",

    // --- RACE DESCRIPTIONS (NEW) ---
    raceHumanDescription:
      "Serbaguna dan ambisius. Manusia mendapatkan satu bahasa ekstra dan memiliki kecepatan standar 30 kaki.",
    raceElfDescription:
      "Anggun dan perseptif. Elf mahir berbahasa Elvish dan memiliki kecepatan standar 30 kaki.",
    raceDwarfDescription:
      "Tangguh dan kuat. Dwarf mahir berbahasa Dwarvish dan memiliki kecepatan gerak 25 kaki karena kaki mereka yang lebih pendek.",
    raceHalflingDescription:
      "Kecil dan beruntung. Halfling mahir dalam bahasa mereka sendiri dan memiliki kecepatan gerak 25 kaki.",
    raceOrcDescription:
      "Kuat dan mengesankan. Orc mahir berbahasa Orcish dan memiliki kecepatan standar 30 kaki.",

    // --- BACKGROUND DESCRIPTIONS (NEW) ---
    bgNobleDescription:
      "Anda adalah orang yang memiliki hak istimewa dan kekuasaan. Anda mahir dalam Persuasi dan Sejarah.",
    bgRogueDescription:
      "Anda memiliki masa lalu yang kelam, hidup di dunia rahasia dan perbuatan terlarang. Anda mahir dalam Kesunyian dan Penipuan.",
    bgScholarDescription:
      "Anda telah menghabiskan hidup Anda dalam studi dan kontemplasi. Anda mahir dalam Arcana dan Investigasi.",
    bgSoldierDescription:
      "Anda adalah pejuang terlatih, akrab dengan rantai komando. Anda mahir dalam Atletik dan Persepsi.",
    bgOutcastDescription:
      "Anda tumbuh di pinggiran masyarakat, berjuang sendiri. Anda mahir dalam Kesunyian dan Persepsi.",
    // --- STAT DESCRIPTIONS (NEW) ---
    strengthDescription:
      "Mengukur kekuatan fisik, latihan atletik, dan sejauh mana Anda dapat menggunakan kekuatan fisik murni.",

    dexterityDescription: "Mengukur kegesitan, refleks, dan keseimbangan.",

    constitutionDescription: "Mengukur kesehatan, stamina, dan kekuatan vital.",

    intelligenceDescription:
      "Mengukur ketajaman mental, akurasi ingatan, dan kemampuan bernalar.",

    wisdomDescription: "MengKukur persepsi, intuisi, dan penilaian praktis.",

    charismaDescription:
      "Mengukur kekuatan kepribadian, kemampuan membujuk, dan kepemimpinan.",
    createAdventurer: "Ciptakan Petualangmu",
    name: "Nama",
    characterNamePlaceholder: "Nama karakter",
    race: "Ras",
    class: "Kelas",
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
    whatWillPlayerDo: "Sekarang giliran {playerName}.",
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
    actionInputPlaceholder: "Apa yang kamu lakukan?",
    submitAction: "Kirim",
    suggestions: "Saran",
    loreCodex: "Kodeks Lore",
    noDiscoveries: "Belum ada penemuan.",
    // Character Sheet
    characterSheet: "Lembar Karakter",
    savingThrows: "Lemparan Penyelamatan",
    skills: "Keterampilan",
    proficienciesAndLanguages: "Kecakapan & Bahasa",
    armorClass: "Kelas Zirah",
    initiative: "Inisiatif",
    speed: "Kecepatan",
    hitPoints: "Poin Nyawa",
    current: "Saat Ini",
    max: "Maks",
    hitDice: "Dadu Nyawa",
    attacksAndSpellcasting: "Serangan & Perapalan Mantra",
    combatSkills: "Keterampilan Tempur",
    spellSlots: "Slot Mantra",
    activeEffects: "Efek Aktif",
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
    // Load Game Screen
    players: "Pemain",
    noPlayersYet: "Belum ada pemain",
    status: "Status",
    noSavedGames: "Tidak ada game yang tersimpan.",
    back: "Kembali",
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
