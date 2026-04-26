import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChildStore } from '../store/childStore';
import { useProgressStore } from '../store/progressStore';
import { getProgress } from '../lib/supabase';
import type { Progress } from '../lib/supabase';

export default function RootLayout() {
  const router = useRouter();
  const { child, isLoading, hydrate } = useChildStore();
  const { setProgress } = useProgressStore();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!child) {
      router.replace('/onboarding');
      return;
    }
    AsyncStorage.getItem('progressData').then((local) => {
      if (local) setProgress(JSON.parse(local) as Progress[]);
    });
    getProgress(child.id).then(setProgress).catch(() => {});
  }, [isLoading, child]);

  return (
    <>
      <Slot />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFD600" />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
