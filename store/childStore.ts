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
      const child = await getChildById(childId);
      if (!child) {
        await AsyncStorage.removeItem('childId');
      }
      set({ child, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
