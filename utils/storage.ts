// src/utils/storage.ts
import { Preferences } from '@capacitor/preferences';
import { Game, PlayerCount } from '../types';

export interface StoredList {
  id: number;
  date: string;
  players: string[];
  mode: '3er' | '4er';
  totalGames: number;
  playedGames: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  games: Game[];
  playerCounts: PlayerCount[];
}

interface StorageData {
  nextId: number;
  lists: StoredList[];
}

const STORAGE_KEY = 'skat_tracker_lists';
const MAX_LISTS = 50;

export class StorageManager {
  private static async getData(): Promise<StorageData> {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (!value) {
      return { nextId: 1, lists: [] };
    }
    return JSON.parse(value);
  }

  private static async saveData(data: StorageData): Promise<void> {
    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(data)
    });
  }

  static async getAllLists(): Promise<StoredList[]> {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    console.log('Raw storage value:', value);

    if (!value) {
      console.log('No stored lists found');
      return [];
    }

    const data = JSON.parse(value);
    console.log('Parsed storage data:', data);

    return data.lists.sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  static async getCurrentList(): Promise<StoredList | null> {
    const lists = await this.getAllLists();
    return lists.find(list => list.status === 'in_progress') || null;
  }

  static async createList(
    players: string[],
    mode: '3er' | '4er',
    totalGames: number
  ): Promise<StoredList> {
    const data = await this.getData();

    // Mark any in-progress list as abandoned
    data.lists = data.lists.map(list => ({
      ...list,
      status: list.status === 'in_progress' ? 'abandoned' : list.status
    }));

    // Remove oldest lists if at capacity
    while (data.lists.length >= MAX_LISTS) {
      data.lists.shift();
    }

    const newList: StoredList = {
      id: data.nextId,
      date: new Date().toISOString(),
      players,
      mode,
      totalGames,
      playedGames: 0,
      status: 'in_progress',
      games: [],
      playerCounts: players.map(() => ({
        wonCount: 0,
        lostCount: 0,
        basePoints: 0,
        totalPoints: 0
      }))
    };

    data.lists.push(newList);
    console.log('99', newList)
    data.nextId++;

    await this.saveData(data);
    return newList;
  }

  static async updateList(updatedList: StoredList): Promise<void> {
    const data = await this.getData();

    // If list is being edited, mark current in-progress as abandoned
    if (updatedList.status === 'in_progress') {
      data.lists = data.lists.map(list => ({
        ...list,
        status: list.status === 'in_progress' ? 'abandoned' : list.status
      }));
    }

    // Update the list
    data.lists = data.lists.map(list =>
      list.id === updatedList.id ? updatedList : list
    );

    await this.saveData(data);
  }

  static async deleteList(id: number): Promise<void> {
    const data = await this.getData();
    data.lists = data.lists.filter(list => list.id !== id);
    await this.saveData(data);
  }

  static async updateGameInList(
    listId: number,
    game: Game,
    playerCounts: PlayerCount[]
  ): Promise<void> {
    try {
      console.log('137', game)
      const data = await this.getData();
      const listIndex = data.lists.findIndex(list => list.id === listId);

      if (listIndex === -1) return;

      const list = data.lists[listIndex];

      // Find if game already exists in the list
      const gameIndex = list.games.findIndex(g => g.gameNumber === game.gameNumber);

      // Store complete game data
      const gameToStore = {
        ...game,
        played: true,
        isEditing: false,
        // Ensure all game properties are included
        gameNumber: game.gameNumber,
        dealer: game.dealer,
        player: game.player,
        gameType: game.gameType,
        hand: game.hand,
        schneider: game.schneider,
        schwarz: game.schwarz,
        ouvert: game.ouvert,
        schneiderAnnounced: game.schneiderAnnounced,
        schwarzAnnounced: game.schwarzAnnounced,
        won: game.won,
        mitOhne: game.mitOhne,
        multiplier: game.multiplier
      };

      if (gameIndex === -1) {
        list.games.push(gameToStore);
      } else {
        list.games[gameIndex] = gameToStore;
      }

      // Update player counts
      list.playerCounts = playerCounts;
      list.playedGames = list.games.filter(g => g.played).length;

      // Update list status
      list.status = list.playedGames === list.totalGames ? 'completed' : 'in_progress';

      data.lists[listIndex] = list;
      await this.saveData(data);
      console.log(list)
    } catch (error) {
      console.error('Error updating game in list:', error);
      throw error;
    }
  }
}