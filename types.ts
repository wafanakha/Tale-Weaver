import { Type } from "@google/genai";

export enum ItemType {
  WEAPON = "weapon",
  ARMOR = "armor",
  POTION = "potion",
  MISC = "misc",
}

export interface Item {
  name: string;
  type: ItemType;
  description: string;
  damage?: number;
  armorClass?: number;
  healing?: number;
}

export enum StatusType {
  BUFF = "buff",
  DEBUFF = "debuff",
}

export interface StatusEffect {
  name: string;
  type: StatusType;
  description: string;
  icon?: string; // Optional emoji or symbol
}

export interface Stats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Skills {
  athletics: boolean;
  acrobatics: boolean;
  stealth: boolean;
  arcana: boolean;
  history: boolean;
  investigation: boolean;
  perception: boolean;
  persuasion: boolean;
  deception: boolean;
}

export interface SavingThrows {
  strength: boolean;
  dexterity: boolean;
  constitution: boolean;
  intelligence: boolean;
  wisdom: boolean;
  charisma: boolean;
}

export interface SpellSlots {
  [level: number]: {
    total: number;
    used: number;
  };
}

export interface Player {
  id: string; // Unique client ID for this player
  name: string;
  race: string;
  class: string;
  background: string;
  hp: number;
  maxHp: number;
  xp: number; // Current experience points
  maxXp: number; // XP threshold for next level
  level: number;
  speed: number;
  hitDice: string;
  stats: Stats;
  skills: Skills;
  savingThrows: SavingThrows;
  combatSkills: string[];
  proficiencies: string[];
  languages: string[];
  inventory: Item[];
  equipment: {
    weapon: Item | null;
    armor: Item | null;
  };
  spellSlots: SpellSlots;
  statusEffects?: StatusEffect[];
  initiativeBonus?: number;
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  xpValue: number; // XP rewarded when defeated
  isDefeated: boolean;
  isFinalBoss?: boolean;
}

export interface DiceRoll {
  skill: string; // e.g., 'Perception', 'Strength'
  roll: number; // The d20 roll
  modifier: number;
  total: number;
  dc: number; // Difficulty Class
  success: boolean;
  isRevealed?: boolean;
  rollingPlayerId?: string; // NEW: Explicit ID of who rolls
}

export interface StoryLogEntry {
  id: number;
  speaker: string;
  text: string;
  diceRoll?: DiceRoll;
}

export interface PlayerAction {
  playerId: string;
  choice: string;
}

export type GameStatus = "lobby" | "playing" | "finished";

export interface LoreEntry {
  title: string;
  description: string;
}

export interface WorldSetting {
  name: string;
  genre: string;
  description: string;
  finalBossName: string;
}
export interface LevelUpData {
  playerName: string;
  newLevel: number;
  newMaxHp: number;
  hpIncrease: number;
  newSkills: string[];
  statsIncreased: Partial<Stats>;
}
export interface GameState {
  gameId: string;
  hostId: string;
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  storyLog: StoryLogEntry[];
  choices: string[];
  currentEnemy: Enemy | null;
  isLoading: boolean;
  isProcessingAI?: boolean; // New flag to prevent duplicate calls
  error: string | null;
  lastPlayerAction: PlayerAction | null;
  worldSetting?: WorldSetting;
  loreCodex?: LoreEntry[];
  isGameOver?: boolean;
  endingType?: "victory" | "defeat";
  levelUpQueue: LevelUpData[];
}

export interface LevelUpDetails {
  level: number;
  maxHpIncrease: number;
  newSkill?: string;
  statsIncrease?: Partial<Stats>;
}

export interface GeminiResponse {
  story: string;
  choices: string[];
  dice_roll?: DiceRoll & { rolling_player_name?: string };
  player_updates?: {
    playerName: string;
    hp?: number;
    maxHp?: number;
    xp?: number; // Updated current XP
    maxXp?: number; // New threshold if leveled up
    level?: number;
    new_skills?: string[];
    stats_update?: Partial<Stats>;
    inventory_add?: Item[];
    inventory_remove?: string[];
    // Fix: Added equipment_weapon and equipment_armor to resolve property errors in App.tsx
    equipment_weapon?: Item;
    equipment_armor?: Item;
    spell_slot_used?: {
      level: number;
    };
    status_effects_add?: StatusEffect[];
    status_effects_remove?: string[];
    initiativeBonus?: number;
  }[];
  enemy_update?: {
    name: string;
    hp: number;
    maxHp: number;
    xpValue?: number; // How much XP this enemy is worth
    is_defeated: boolean;
  };
  next_player_index?: number;
  lore_entries?: LoreEntry[];
  is_game_over?: boolean;
  ending_type?: "victory" | "defeat";
}
