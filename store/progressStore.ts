import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Progress, updateProgressStatus } from '../lib/supabase';
import { useChildStore } from './childStore';

type ProgressState = {
  progress: Progress[];
  setProgress: (progress: Progress[]) => void;
  markComplete: (soundId: string) => Promise<void>;
  markUnlocked: (soundId: string) => Promise<void>;
};

async function saveProgressLocally(progress: Progress[]) {
  await AsyncStorage.setItem('progressData', JSON.stringify(progress));
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: [],
  setProgress: (progress) => set({ progress }),
  markComplete: async (soundId) => {
    const updated = get().progress.map((p) =>
      p.sound_id === soundId ? { ...p, status: 'complete' as const } : p
    );
    set({ progress: updated });
    await saveProgressLocally(updated);

    // Sync to Supabase in the background
    const childId = useChildStore.getState().child?.id;
    if (childId) {
      updateProgressStatus(childId, soundId, 'complete').catch(() => {});
    }
  },
  markUnlocked: async (soundId) => {
    const updated = get().progress.map((p) =>
      p.sound_id === soundId ? { ...p, status: 'unlocked' as const } : p
    );
    set({ progress: updated });
    await saveProgressLocally(updated);

    // Sync to Supabase in the background
    const childId = useChildStore.getState().child?.id;
    if (childId) {
      updateProgressStatus(childId, soundId, 'unlocked').catch(() => {});
    }
  },
}));
