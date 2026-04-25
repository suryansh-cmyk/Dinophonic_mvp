import { create } from 'zustand';
import { Progress, updateProgressStatus } from '../lib/supabase';
import { useChildStore } from './childStore';

type ProgressState = {
  progress: Progress[];
  setProgress: (progress: Progress[]) => void;
  markComplete: (soundId: string) => Promise<void>;
  markUnlocked: (soundId: string) => Promise<void>;
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: [],
  setProgress: (progress) => set({ progress }),
  markComplete: async (soundId) => {
    const childId = useChildStore.getState().child?.id;
    if (!childId) return;
    await updateProgressStatus(childId, soundId, 'complete');
    set({
      progress: get().progress.map((p) =>
        p.sound_id === soundId ? { ...p, status: 'complete' as const } : p
      ),
    });
  },
  markUnlocked: async (soundId) => {
    const childId = useChildStore.getState().child?.id;
    if (!childId) return;
    await updateProgressStatus(childId, soundId, 'unlocked');
    set({
      progress: get().progress.map((p) =>
        p.sound_id === soundId ? { ...p, status: 'unlocked' as const } : p
      ),
    });
  },
}));
