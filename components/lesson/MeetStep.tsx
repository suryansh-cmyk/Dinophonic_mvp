import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import type { Sound } from '../../constants/sounds';

type Props = {
  sound: Sound;
  onNext: () => void;
};

export default function MeetStep({ sound, onNext }: Props) {
  const { play, stop } = useAudioPlayer();
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    play(sound.introFile);
    const t = setTimeout(() => setShowName(true), 1800);
    return () => {
      clearTimeout(t);
      stop();
    };
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/images/background-jungle.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
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

        <TouchableOpacity style={styles.continueBtn} onPress={onNext}>
          <Text style={styles.continueText}>Tap to continue ▶</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    position: 'absolute',
    bottom: 48,
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
