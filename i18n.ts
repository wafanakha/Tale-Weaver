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
    classBarbarianDescription:
      "A fierce warrior of primitive background who can enter a battle rage. Known for high hit points and raw strength.",
    classBardDescription:
      "An inspiring magician whose power echoes the music of creation. Skilled in support magic and bardic inspiration.",
    classClericDescription:
      "A priestly champion who wields divine magic in service of a higher power. A master of healing and protection.",
    classDruidDescription:
      "A priest of the Old Faith, wielding the powers of nature and adopting animal forms through Wild Shape.",
    classFighterDescription:
      "A master of martial combat, skilled with a variety of weapons and armor. Known for stamina and tactical maneuvers.",
    classMonkDescription:
      "A master of martial arts, harnessing the power of the body and soul (Ki) to perform deadly unarmed strikes.",
    classPaladinDescription:
      "A holy warrior bound to a sacred oath. Combines heavy martial prowess with divine healing and smiting capabilities.",
    classRangerDescription:
      "A warrior who uses martial prowess and nature magic to combat threats on the edges of civilization.",
    classRogueDescription:
      "A scoundrel who uses stealth and trickery to overcome obstacles and enemies. Deadly when striking from the shadows.",
    classSorcererDescription:
      "A spellcaster who draws on inherent magic from a gift or bloodline. Their magic is raw, natural, and flexible.",
    classWarlockDescription:
      "A practitioner of magic who has struck a bargain with an otherworldly patron (like a Fiend or Fey).",
    classWizardDescription:
      "A scholarly magic-user capable of manipulating the structures of reality. Physically fragile, but magically versatile.",

    // --- RACE DESCRIPTIONS (D&D 5e Standard) ---
    raceHumanDescription:
      "The most adaptable and ambitious people among the common races. Known for their versatility and varied cultures.",
    raceElfDescription:
      "A magical people of otherworldly grace, living in the world but not entirely part of it. They have keen senses.",
    raceDwarfDescription:
      "Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal.",
    raceHalflingDescription:
      "The diminutive halflings survive in a world full of larger creatures by avoiding notice or, barring that, stout luck.",
    raceDragonbornDescription:
      "Born of dragons, they walk proudly through a world that often fears them. They possess a breath weapon.",
    raceGnomeDescription:
      "A slight, energetic people with a knack for invention, illusion, and a vibrant curiosity about the world.",
    raceHalfElfDescription:
      "Walking two worlds but truly belonging to neither, they combine human ambition with elven grace.",
    raceHalfOrcDescription:
      "They combine the physical strength and endurance of orcs with the cunning and adaptability of humans.",
    raceTieflingDescription:
      "To be greeted with stares and whispers, to suffer violence and insult, is the lot of the tiefling and their infernal heritage.",

    // --- BACKGROUND DESCRIPTIONS (D&D 5e Standard) ---
    bgAcolyteDescription:
      "You have spent your life in the service of a temple. Proficient in Insight and Religion.",
    bgCharlatanDescription:
      "You have always had a way with people, often at their expense. Proficient in Deception and Sleight of Hand.",
    bgCriminalDescription:
      "You have a history of breaking the law and contacts in the underworld. Proficient in Deception and Stealth.",
    bgEntertainerDescription:
      "You thrive in front of an audience, knowing how to captivate them. Proficient in Acrobatics and Performance.",
    bgFolkHeroDescription:
      "You come from humble ranks, but you are destined for so much more. Proficient in Animal Handling and Survival.",
    bgGuildArtisanDescription:
      "You are a member of a guild, skilled in a particular craft. Proficient in Insight and Persuasion.",
    bgHermitDescription:
      "You lived in seclusion for a formative part of your life. Proficient in Medicine and Religion.",
    bgNobleDescription:
      "You were raised in a family of wealth, power, and privilege. Proficient in History and Persuasion.",
    bgOutlanderDescription:
      "You grew up in the wilds, far from civilization. Proficient in Athletics and Survival.",
    bgSageDescription:
      "You spent years learning the lore of the multiverse. Proficient in Arcana and History.",
    bgSailorDescription:
      "You sailed on a seagoing vessel for years. Proficient in Athletics and Perception.",
    bgSoldierDescription:
      "War has been your life for as long as you care to remember. Proficient in Athletics and Intimidation.",
    bgUrchinDescription:
      "You grew up on the streets alone, poor, and orphaned. Proficient in Sleight of Hand and Stealth.",

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
    classBarbarianDescription:
      "Pejuang ganas dari latar belakang primitif yang dapat memasuki 'Rage' (amarah) dalam pertempuran. Sangat kuat dan tahan banting.",
    classBardDescription:
      "Penyihir inspiratif yang kekuatannya menggema dari musik ciptaan. Mahir dalam memberikan inspirasi dan sihir pendukung.",
    classClericDescription:
      "Seorang pejuang suci yang menggunakan sihir ilahi untuk melayani kekuatan yang lebih tinggi. Penyembuh dan pelindung yang tangguh.",
    classDruidDescription:
      "Pendeta dari Kepercayaan Lama, memegang kekuatan alam dan cahaya bulan, serta mampu berubah wujud menjadi binatang liar.",
    classFighterDescription:
      "Seorang ahli tempur yang menguasai berbagai senjata dan zirah. Memiliki stamina tinggi dan kemampuan manuver taktis.",
    classMonkDescription:
      "Seorang ahli bela diri yang menyalurkan kekuatan tubuh dan jiwa (Ki) untuk melakukan serangan fisik yang mematikan tanpa senjata.",
    classPaladinDescription:
      "Ksatria suci yang terikat pada sumpah sakral. Menggabungkan kemampuan tempur berat dengan sihir penyembuhan dan perlindungan.",
    classRangerDescription:
      "Pejuang yang menggunakan kecakapan bela diri dan sihir alam untuk melawan ancaman di perbatasan peradaban dan alam liar.",
    classRogueDescription:
      "Bajingan licik yang menggunakan kesunyian (Stealth) dan tipu daya. Mematikan jika menyerang dari bayang-bayang atau titik buta musuh.",
    classSorcererDescription:
      "Penyihir yang menarik kekuatan sihir bawaan dari anugerah garis keturunan atau kejadian magis. Sihir mereka liar dan alami.",
    classWarlockDescription:
      "Penyihir yang mendapatkan kekuatan melalui pakta atau perjanjian dengan entitas luar biasa (seperti Iblis atau Fey).",
    classWizardDescription:
      "Penyihir terpelajar yang mampu memanipulasi struktur realitas. Rapuh secara fisik, namun memiliki koleksi mantra yang sangat luas.",

    // --- RACE DESCRIPTIONS (D&D 5e Standard) ---
    raceHumanDescription:
      "Bangsa yang paling mudah beradaptasi dan ambisius. Dikenal karena keserbagunaan dan variasi budaya mereka.",
    raceElfDescription:
      "Bangsa magis dengan keanggunan dunia lain, berumur panjang, dan memiliki ketajaman indra yang luar biasa.",
    raceDwarfDescription:
      "Tangguh dan keras, dwarf dikenal sebagai penambang, pengrajin logam ulung, dan pejuang yang kokoh seperti batu.",
    raceHalflingDescription:
      "Bertubuh kecil namun berhati besar. Mereka bertahan hidup dengan keberuntungan, kelincahan, dan keberanian yang mengejutkan.",
    raceDragonbornDescription:
      "Lahir dari naga, mereka memiliki kulit bersisik dan kemampuan menyemburkan napas elemen (api, es, atau petir).",
    raceGnomeDescription:
      "Makhluk kecil yang energik, penuh rasa ingin tahu, dan memiliki bakat alami dalam penemuan mekanis atau ilusi.",
    raceHalfElfDescription:
      "Menggabungkan ambisi manusia dan keanggunan elf. Mereka adalah diplomat alami dan pengelana yang karismatik.",
    raceHalfOrcDescription:
      "Mewarisi ketangguhan dan kemarahan orc, namun dengan kapasitas untuk bertindak lebih dari sekadar naluri buas.",
    raceTieflingDescription:
      "Membawa warisan darah iblis (infernal), terlihat dari tanduk dan ekor mereka. Sering disalahpahami, namun memiliki bakat sihir alami.",

    // --- BACKGROUND DESCRIPTIONS (D&D 5e Standard) ---
    bgAcolyteDescription:
      "Anda menghabiskan hidup melayani di kuil. Mahir dalam pengetahuan agama dan wawasan intuitif.",
    bgCharlatanDescription:
      "Anda ahli dalam memanipulasi orang lain demi keuntungan. Mahir dalam tipu muslihat dan menyamar.",
    bgCriminalDescription:
      "Anda memiliki sejarah melanggar hukum dan kontak di dunia bawah. Mahir dalam mengendap-endap dan menipu.",
    bgEntertainerDescription:
      "Anda hidup di depan penonton, menguasai seni pertunjukan. Mahir dalam akrobatik dan performa panggung.",
    bgFolkHeroDescription:
      "Anda berasal dari rakyat jelata, namun takdir memanggil Anda untuk melindungi mereka. Mahir bertahan hidup dan menjinakkan hewan.",
    bgGuildArtisanDescription:
      "Anda adalah anggota serikat dagang yang terampil dalam kerajinan. Mahir dalam wawasan dan persuasi bisnis.",
    bgHermitDescription:
      "Anda hidup dalam pengasingan demi pencerahan spiritual. Mahir dalam pengobatan dan pengetahuan agama.",
    bgNobleDescription:
      "Anda lahir dengan gelar dan kekuasaan. Mahir dalam sejarah dan membujuk orang lain (Persuasi).",
    bgOutlanderDescription:
      "Anda tumbuh di alam liar, jauh dari kota. Mahir dalam atletik dan bertahan hidup di lingkungan keras.",
    bgSageDescription:
      "Anda menghabiskan tahun-tahun dalam studi akademis. Mahir dalam ilmu sihir (Arcana) dan sejarah.",
    bgSailorDescription:
      "Laut adalah rumah Anda. Mahir dalam atletik dan navigasi, serta memiliki persepsi tajam terhadap cuaca.",
    bgSoldierDescription:
      "Anda adalah veteran perang yang terlatih. Mahir dalam atletik dan intimidasi medan tempur.",
    bgUrchinDescription:
      "Anda tumbuh besar di jalanan kota yang keras, sendirian dan miskin. Mahir dalam menyelinap dan kecepatan tangan.",
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
