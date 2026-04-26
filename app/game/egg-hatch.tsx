import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { getSoundById, getNextSoundId, SOUNDS } from '../../constants/sounds';
import { useProgressStore } from '../../store/progressStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

function pickLetters(correctSymbol: string): { letters: string[]; correctIndex: number } {
  const others = SOUNDS.filter((s) => s.symbol !== correctSymbol);
  // Fisher-Yates shuffle for uniform distribution
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const distractors = others.slice(0, 2).map((s) => s.symbol);
  const pool = [correctSymbol, ...distractors];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { letters: pool, correctIndex: pool.indexOf(correctSymbol) };
}

export default function EggHatch() {
  const { soundId } = useLocalSearchParams<{ soundId: string }>();
  const router = useRouter();
  const sound = getSoundById(soundId);
  const { markComplete, markUnlocked } = useProgressStore();
  const { play } = useAudioPlayer();

  const [letters, setLetters] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [hatchedIndex, setHatchedIndex] = useState<number | null>(null);
  const [stars, setStars] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const processingRef = useRef(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wobble0 = useRef(new Animated.Value(0)).current;
  const wobble1 = useRef(new Animated.Value(0)).current;
  const wobble2 = useRef(new Animated.Value(0)).current;
  const wobbles = [wobble0, wobble1, wobble2];

  function showFeedback(text: string, durationMs = 1000) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedbackText(text);
    feedbackTimer.current = setTimeout(() => setFeedbackText(null), durationMs);
  }

  function setupRound() {
    if (!sound) return;
    const { letters: l, correctIndex: ci } = pickLetters(sound.symbol);
    setLetters(l);
    setCorrectIndex(ci);
    setHatchedIndex(null);
    processingRef.current = false;
  }

  useEffect(() => {
    if (!sound) {
      router.replace('/');
      return;
    }
    setupRound();
    play(sound.audioFile);
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  async function handleGameEnd(newStars: number) {
    if (!sound) return;
    if (newStars >= 3) {
      await markComplete(sound.id);
      const nextId = getNextSoundId(sound.id);
      if (nextId) await markUnlocked(nextId);
      setTimeout(() => setGameOver(true), 1400);
    } else {
      showFeedback('⭐ Nice!', 900);
      setTimeout(setupRound, 1500);
    }
  }

  function handleTap(index: number) {
    if (processingRef.current || hatchedIndex !== null || gameOver || !sound) return;
    processingRef.current = true;

    if (index === correctIndex) {
      setHatchedIndex(index);
      play(sound.audioFile);
      const newStars = stars + 1;
      setStars(newStars);
      handleGameEnd(newStars);
    } else {
      Animated.sequence([
        Animated.timing(wobbles[index], { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbles[index], { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbles[index], { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbles[index], { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbles[index], { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => {
        showFeedback('Try again! 🔊');
        play(sound.audioFile);
        processingRef.current = false;
      });
    }
  }

  if (!sound) return null;

  if (gameOver) {
    return (
      <View style={styles.celebration}>
        <LottieView
          source={sound.lottieFile}
          autoPlay
          loop
          style={styles.celebLottie}
        />
        <Text style={styles.celebTitle}>Amazing!</Text>
        <View style={styles.celebStars}>
          <Text style={styles.celebStarIcon}>⭐</Text>
          <Text style={styles.celebStarIcon}>⭐</Text>
          <Text style={styles.celebStarIcon}>⭐</Text>
        </View>
        <Text style={styles.celebSub}>
          You learned the "{sound.symbol}" sound!
        </Text>
        <Text style={styles.celebMnemonic}>"{sound.mnemonic}"</Text>
        <TouchableOpacity
          style={[styles.mapBtn, { backgroundColor: sound.color }]}
          onPress={() => router.replace('/')}
          accessibilityLabel="Go back to map"
        >
          <Text style={styles.mapBtnText}>Back to Map →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background-jungle.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Top bar with back button and stars */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back to lesson"
            hitSlop={12}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.starsRow}>
            {[0, 1, 2].map((i) => (
              <Text key={i} style={styles.starIcon}>{i < stars ? '⭐' : '☆'}</Text>
            ))}
          </View>
          <View style={styles.backBtn} />
        </View>

        <Text style={styles.instruction}>
          Which egg has the "{sound.id}" sound?
        </Text>

        {/* Feedback banner */}
        {feedbackText && (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackText}>{feedbackText}</Text>
          </View>
        )}

        <View style={styles.eggsRow}>
          {letters.map((letter, i) => (
            <Animated.View key={i} style={{ transform: [{ translateX: wobbles[i] }] }}>
              <TouchableOpacity
                onPress={() => handleTap(i)}
                activeOpacity={0.85}
                style={styles.eggWrapper}
                accessibilityLabel={`Egg with letter ${letter}`}
              >
                <View
                  style={[
                    styles.egg,
                    { borderColor: sound.color },
                    hatchedIndex === i && styles.eggHatched,
                  ]}
                >
                  {hatchedIndex === i ? (
                    <LottieView
                      source={require('../../assets/lotties/egg-hatch.json')}
                      autoPlay
                      loop={false}
                      style={styles.lottie}
                    />
                  ) : (
                    <Text style={[styles.eggLetter, { color: sound.color }]}>{letter}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.replayBtn}
          onPress={() => play(sound.audioFile)}
          accessibilityLabel="Replay the sound"
        >
          <Text style={styles.replayText}>🔊 Hear the sound</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
  },
  backBtn: {
    minWidth: 64,
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  starIcon: {
    fontSize: 36,
  },
  instruction: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  feedbackBanner: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  feedbackText: {
    color: '#FFD600',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eggsRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  eggWrapper: {
    alignItems: 'center',
  },
  egg: {
    width: 96,
    height: 120,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  eggHatched: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  eggLetter: {
    fontSize: 52,
    fontWeight: 'bold',
  },
  lottie: {
    width: 96,
    height: 120,
  },
  replayBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  replayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  // Celebration screen
  celebration: {
    flex: 1,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 32,
  },
  celebLottie: {
    width: 200,
    height: 200,
  },
  celebTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFD600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  celebStars: {
    flexDirection: 'row',
    gap: 8,
  },
  celebStarIcon: {
    fontSize: 40,
  },
  celebSub: {
    fontSize: 22,
    color: '#C8E6C9',
    textAlign: 'center',
    fontWeight: '600',
  },
  celebMnemonic: {
    fontSize: 16,
    color: '#A5D6A7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mapBtn: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 32,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mapBtnText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
});
