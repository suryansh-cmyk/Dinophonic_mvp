import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import StepProgress from './StepProgress';
import type { Sound } from '../../constants/sounds';

type Props = {
  sound: Sound;
  onNext: () => void;
  onBack: () => void;
  step: 1 | 2 | 3;
};

export default function HearStep({ sound, onNext, onBack, step }: Props) {
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
    <ImageBackground
      source={require('../../assets/images/background-jungle.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <StepProgress currentStep={step} color={sound.color} />
          <View style={styles.backBtn} />
        </View>

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

        <Text style={styles.mnemonic}>"{sound.mnemonic}"</Text>

        <View style={styles.sampleWordsRow}>
          {sound.sampleWords.map((word) => (
            <TouchableOpacity
              key={word}
              onPress={handleLetterTap}
              style={[styles.wordBubble, { borderColor: sound.color }]}
              accessibilityLabel={`Word: ${word}`}
              hitSlop={8}
            >
              <Text style={[styles.wordText, { color: sound.color }]}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: sound.color }]}
          onPress={onNext}
        >
          <Text style={styles.nextText}>Next →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    minWidth: 64,
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 20,
    color: '#C8E6C9',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  letter: {
    fontSize: 130,
    fontWeight: 'bold',
  },
  dinoImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  mnemonic: {
    fontSize: 16,
    color: '#E8F5E9',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 32,
  },
  sampleWordsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  wordBubble: {
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextBtn: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 32,
  },
  nextText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
});
