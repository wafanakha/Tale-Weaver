import { ref, set, get, onValue, off, update, push, DataSnapshot } from 'firebase/database';
import { db } from './firebase';
import { GameState, Player, PlayerAction } from '../types';

// Simple session-based client ID generator
const getClientId = (): string => {
    let clientId = sessionStorage.getItem('clientId');
    if (!clientId) {
        clientId = 'client_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('clientId', clientId);
    }
    return clientId;
};

// Function to generate a random 5-letter game ID
const generateGameId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const createGame = async (hostId: string): Promise<string> => {
    const gameId = generateGameId();
    const initialGameState: GameState = {
        gameId,
        hostId,
        status: 'lobby',
        players: [],
        currentPlayerIndex: 0,
        storyLog: [],
        choices: [],
        currentEnemy: null,
        isLoading: false,
        error: null,
        lastPlayerAction: null,
    };
    const gameRef = ref(db, `games/${gameId}`);
    await set(gameRef, initialGameState);
    return gameId;
};

const getGameState = async (gameId: string): Promise<GameState | null> => {
    const gameRef = ref(db, `games/${gameId}`);
    const snapshot = await get(gameRef);
    return snapshot.exists() ? snapshot.val() : null;
};

const addPlayer = async (gameId: string, player: Player): Promise<void> => {
    const state = await getGameState(gameId);
    if (state) {
        const players = state.players || [];
        // Prevent adding player with same id twice
        if (players.some(p => p.id === player.id)) return;
        
        const newPlayers = [...players, player];
        await update(ref(db, `games/${gameId}`), { players: newPlayers });
    }
};

const updatePlayer = async (gameId: string, playerId: string, updates: Partial<Player>): Promise<void> => {
    const state = await getGameState(gameId);
    if(state) {
        const playerIndex = state.players.findIndex(p => p.id === playerId);
        if(playerIndex > -1) {
            const playerRef = ref(db, `games/${gameId}/players/${playerIndex}`);
            await update(playerRef, updates);
        }
    }
};

const listenToGame = (gameId: string, callback: (state: GameState) => void): (() => void) => {
    const gameRef = ref(db, `games/${gameId}`);
    // FIX: A named listener function is required so the same reference can be passed to `off()` for removal.
    // The original anonymous function for `onValue` and the `callback` function passed to `off` were different references.
    const listener = (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        }
    };
    onValue(gameRef, listener);
    return () => off(gameRef, 'value', listener);
};

const updateGameState = async (gameId: string, updates: Partial<GameState>): Promise<void> => {
    const gameRef = ref(db, `games/${gameId}`);
    await update(gameRef, updates);
};

const postAction = async (gameId: string, playerId: string, choice: string): Promise<void> => {
    const action: PlayerAction = { playerId, choice };
    await update(ref(db, `games/${gameId}`), { lastPlayerAction: action });
};

export const gameService = {
    getClientId,
    createGame,
    getGameState,
    addPlayer,
    updatePlayer,
    listenToGame,
    updateGameState,
    postAction
};