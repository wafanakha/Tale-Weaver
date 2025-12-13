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
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  isDefeated: boolean;
}

export interface DiceRoll {
  skill: string; // e.g., 'Perception', 'Strength'
  roll: number; // The d20 roll
  modifier: number;
  total: number;
  dc: number; // Difficulty Class
  success: boolean;
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
  error: string | null;
  lastPlayerAction: PlayerAction | null;
  loreCodex?: LoreEntry[];
  worldSetting?: WorldSetting;
}

export interface WorldSetting {
  name: string;
  genre: string;
  description: string;
}

export interface GeminiResponse {
  story: string;
  choices: string[];
  dice_roll?: DiceRoll;
  player_updates?: {
    playerName: string;
    hp?: number;
    inventory_add?: Item[];
    inventory_remove?: string[];
    spell_slot_used?: {
      level: number;
    };
  }[];
  enemy_update?: {
    name: string;
    hp: number;
    maxHp: number;
    is_defeated: boolean;
  };
  next_player_index?: number;
  lore_entries?: LoreEntry[];
}
