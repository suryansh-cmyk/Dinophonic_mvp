import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import type { Sound } from '../../constants/sounds';

type Props = {
  sound: Sound;
  onNext: () => void;
};

export default function HearStep({ sound, onNext }: Props) {
  const { play, stop } = useAudioPlayer();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    play(sound.audioFile);
    return () => { stop(); };
  }, []);

  function handleLetterTap() {
    play(sound.audioFile);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.25, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Tap the letter to hear it!</Text>

      <View style={styles.centerRow}>
        <TouchableOpacity onPress={handleLetterTap} activeOpacity={0.85}>
          <Animated.Text
            style={[
              styles.letter,
              { color: sound.color, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {sound.symbol}
          </Animated.Text>
        </TouchableOpacity>

        <Image source={sound.imageFile} style={styles.dinoImage} />
      </View>

      <Text style={styles.mnemonic}>{sound.mnemonic}</Text>

      <TouchableOpacity style={[styles.nextBtn, { backgroundColor: sound.color }]} onPress={onNext}>
        <Text style={styles.nextText}>Next →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  instruction: {
    fontSize: 20,
    color: '#C8E6C9',
    textAlign: 'center',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  letter: {
    fontSize: 140,
    fontWeight: 'bold',
  },
  dinoImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  mnemonic: {
    fontSize: 16,
    color: '#A5D6A7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nextBtn: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 32,
    marginTop: 8,
  },
  nextText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
});
