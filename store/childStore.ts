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

      // Try local cache first (instant, works offline)
      const localData = await AsyncStorage.getItem('childData');
      if (localData) {
        set({ child: JSON.parse(localData) as Child, isLoading: false });
        // Sync from Supabase in the background
        getChildById(childId).then((remote) => {
          if (remote) set({ child: remote });
        }).catch(() => {});
        return;
      }

      // Fall back to Supabase if no local cache
      const child = await getChildById(childId);
      if (!child) {
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
