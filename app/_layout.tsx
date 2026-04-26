import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useChildStore } from '../store/childStore';
import { useProgressStore } from '../store/progressStore';
import { getProgress } from '../lib/supabase';
import type { Progress } from '../lib/supabase';

export default function RootLayout() {
  const router = useRouter();
  const { child, isLoading, hydrate } = useChildStore();
  const { setProgress } = useProgressStore();

  useEffect(() => {
    // Set once at app startup — not on every audio play call
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
    hydrate();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!child) {
      router.replace('/onboarding');
      return;
    }
    // Local first (instant, works offline), then Supabase overwrites if available
    AsyncStorage.getItem('progressData')
      .then((local) => {
        if (local) {
          try {
            setProgress(JSON.parse(local) as Progress[]);
          } catch {
            // Corrupt local data — clear it and wait for Supabase
            AsyncStorage.removeItem('progressData').catch(() => {});
          }
        }
        return getProgress(child.id);
      })
      .then((remote) => {
        if (remote.length > 0) {
          setProgress(remote);
          AsyncStorage.setItem('progressData', JSON.stringify(remote)).catch(() => {});
        }
      })
      .catch(() => {
        // Supabase unavailable — local data already loaded above
      });
  }, [isLoading, child, router]);

  return (
    <>
      <Slot />
      {isLoading && (
        <View style={styles.splash}>
          <Text style={styles.splashEmoji}>🦕</Text>
          <Text style={styles.splashTitle}>Dinophonics</Text>
          <ActivityIndicator size="large" color="#FFD600" style={styles.spinner} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  splashEmoji: {
    fontSize: 72,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD600',
  },
  spinner: {
    marginTop: 32,
  },
});
