import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_STATS = '@bloomly_stats';

export async function getSavedStats(): Promise<any | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_STATS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('getSavedStats failed', e);
    return null;
  }
}

export async function saveStats(obj: any): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_STATS, JSON.stringify(obj));
  } catch (e) {
    console.warn('saveStats failed', e);
  }
}

export async function clearStats(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_STATS);
  } catch (e) {
    console.warn('clearStats failed', e);
  }
}

export default {
  getSavedStats,
  saveStats,
  clearStats,
  STORAGE_STATS,
};
