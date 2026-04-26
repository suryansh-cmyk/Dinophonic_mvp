import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import StepProgress from './StepProgress';
import type { Sound } from '../../constants/sounds';

type Props = {
  sound: Sound;
  onNext: () => void;
  onBack: () => void;
  step: 1 | 2 | 3;
};

export default function MeetStep({ sound, onNext, onBack, step }: Props) {
  const { play, stop } = useAudioPlayer();
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    play(sound.introFile);
    // Fallback: show name after 2s in case the Lottie finish event doesn't fire
    const fallback = setTimeout(() => setShowName(true), 2000);
    return () => {
      clearTimeout(fallback);
      stop();
    };
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/images/background-jungle.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backText}>← Map</Text>
          </TouchableOpacity>
          <StepProgress currentStep={step} color={sound.color} />
          <View style={styles.backBtn} />
        </View>

        <View style={styles.content}>
          <LottieView
            source={sound.lottieFile}
            autoPlay
            loop={false}
            style={styles.lottie}
            onAnimationFinish={() => setShowName(true)}
          />

          {showName && (
            <Text style={[styles.dinoName, { color: sound.color }]}>
              {sound.dinoName}!
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={onNext}
          accessibilityLabel="Continue to next step"
          hitSlop={16}
        >
          <Text style={styles.continueText}>Tap to continue ▶</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  lottie: {
    width: 280,
    height: 280,
  },
  dinoName: {
    fontSize: 48,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  continueBtn: {
    alignSelf: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  continueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
