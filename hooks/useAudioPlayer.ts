import { useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);

  async function play(source: ReturnType<typeof require>) {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(source);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      if (__DEV__) console.warn('[AudioPlayer] play error:', e);
    }
  }

  async function stop() {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (e) {
      if (__DEV__) console.warn('[AudioPlayer] stop error:', e);
    }
  }

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  return { play, stop };
}
