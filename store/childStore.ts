import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Child, getChildById } from '../lib/supabase';

type ChildState = {
  child: Child | null;
  isLoading: boolean;
  setChild: (child: Child) => void;
  clearChild: () => void;
  hydrate: () => Promise<void>;
};

export const useChildStore = create<ChildState>((set) => ({
  child: null,
  isLoading: true,
  setChild: (child) => set({ child }),
  clearChild: () => set({ child: null }),
  hydrate: async () => {
    try {
      const childId = await AsyncStorage.getItem('childId');
      if (!childId) {
        set({ isLoading: false });
        return;
      }

      // Try local cache first — instant, works offline
      const localData = await AsyncStorage.getItem('childData');
      if (localData) {
        try {
          set({ child: JSON.parse(localData) as Child, isLoading: false });
        } catch {
          // Corrupt cache — clear and fall through to Supabase
          await AsyncStorage.removeItem('childData');
        }

        // Refresh from Supabase in background and keep local cache current
        getChildById(childId)
          .then(async (remote) => {
            if (remote) {
              set({ child: remote });
              await AsyncStorage.setItem('childData', JSON.stringify(remote));
            }
          })
          .catch(() => {});
        return;
      }

      // No local cache — fetch from Supabase
      const child = await getChildById(childId);
      if (!child) {
        // Stale childId (e.g. row deleted from Supabase) — force re-onboarding
        await AsyncStorage.removeItem('childId');
        set({ isLoading: false });
        return;
      }
      await AsyncStorage.setItem('childData', JSON.stringify(child));
      set({ child, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
