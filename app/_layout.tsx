import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useChildStore } from '../store/childStore';
import { useProgressStore } from '../store/progressStore';
import { getProgress } from '../lib/supabase';

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
    getProgress(child.id).then(setProgress).catch(console.error);
  }, [isLoading, child]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1B5E20', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FFD600" />
      </View>
    );
  }

  return <Slot />;
}
