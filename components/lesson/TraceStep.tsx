import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  SafeAreaView,
  Animated,
  ImageBackground,
} from 'react-native';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import StepProgress from './StepProgress';
import type { Sound } from '../../constants/sounds';

type Point = { x: number; y: number };

type Props = {
  sound: Sound;
  onNext: () => void;
  onBack: () => void;
  step: 1 | 2 | 3;
};

export default function TraceStep({ sound, onNext, onBack, step }: Props) {
  const { play } = useAudioPlayer();

  // Refs used inside PanResponder closure (avoids stale closure problem)
  const playRef = useRef(play);
  playRef.current = play;
  const soundRef = useRef(sound);
  soundRef.current = sound;

  // currentStrokeRef is the single source of truth during an active stroke.
  // currentStroke state mirrors it to drive re-renders.
  const currentStrokeRef = useRef<Point[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [completedStrokes, setCompletedStrokes] = useState<Point[][]>([]);
  const [traceCount, setTraceCount] = useState(0);
  // Ref mirrors traceCount so the PanResponder closure (created once) always sees the latest value
  const traceCountRef = useRef(0);
  const done = traceCount >= 3;

  const wellDoneScale = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const pt = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
        currentStrokeRef.current = [pt];
        setCurrentStroke([pt]);
      },
      onPanResponderMove: (e) => {
        const pt = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
        currentStrokeRef.current.push(pt);
        // Functional update is safe inside stale closure
        setCurrentStroke((prev) => [...prev, pt]);
      },
      onPanResponderRelease: () => {
        // Snapshot the finished stroke from ref before resetting
        const finishedStroke = currentStrokeRef.current;
        currentStrokeRef.current = [];
        setCurrentStroke([]);
        setCompletedStrokes((prev) => [...prev, finishedStroke]);

        playRef.current(soundRef.current.audioFile);

        traceCountRef.current += 1;
        setTraceCount(traceCountRef.current);
        if (traceCountRef.current >= 3) {
          Animated.spring(wellDoneScale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 4,
          }).start();
        }
      },
    })
  ).current;

  const allDots = [...completedStrokes.flat(), ...currentStroke];

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

        <Text style={styles.instruction}>
          Trace the letter!{'  '}
          <Text style={{ color: sound.color }}>
            {[1, 2, 3].map((i) => (i <= traceCount ? '★' : '☆')).join(' ')}
          </Text>
        </Text>

        <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
          {/* Ghost letter guide behind the drawing area */}
          <Text style={[styles.letterGuide, { color: sound.color + '20' }]}>
            {sound.symbol}
          </Text>

          {/* Dashed outline hint on the letter shape */}
          <Text style={[styles.letterOutline, { color: sound.color + '40' }]}>
            {sound.symbol}
          </Text>

          {/* Sparkle trail dots — each dot is a touch point */}
          {allDots.map((pt, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { left: pt.x - 6, top: pt.y - 6, backgroundColor: sound.color },
              ]}
            />
          ))}
        </View>

        {done && (
          <Animated.Text
            style={[styles.wellDone, { transform: [{ scale: wellDoneScale }] }]}
          >
            Well done! 🎉
          </Animated.Text>
        )}

        <View style={styles.buttons}>
          {done ? (
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: sound.color }]}
              onPress={onNext}
              accessibilityLabel="Play the game"
            >
              <Text style={styles.nextText}>Play the Game! 🎮</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => play(sound.audioFile)}
                accessibilityLabel="Replay sound"
                hitSlop={12}
              >
                <Text style={styles.iconBtnText}>🔊</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => {
                  currentStrokeRef.current = [];
                  traceCountRef.current = 0;
                  setCurrentStroke([]);
                  setCompletedStrokes([]);
                  setTraceCount(0);
                  wellDoneScale.setValue(0);
                }}
                accessibilityLabel="Clear canvas"
                hitSlop={12}
              >
                <Text style={styles.iconBtnText}>🗑️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={onNext}
                accessibilityLabel="Skip tracing"
                hitSlop={12}
              >
                <Text style={styles.skipText}>Skip →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    paddingTop: 8,
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
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
  },
  canvasWrapper: {
    width: 320,
    height: 320,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  letterGuide: {
    fontSize: 260,
    fontWeight: 'bold',
    position: 'absolute',
  },
  letterOutline: {
    fontSize: 260,
    fontWeight: 'bold',
    position: 'absolute',
    // Slightly smaller so it shows as an inner glow around the guide
    transform: [{ scale: 0.97 }],
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.88,
  },
  wellDone: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  buttons: {
    gap: 12,
    alignItems: 'center',
    paddingBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  iconBtnText: {
    fontSize: 22,
  },
  nextBtn: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nextText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipBtn: {
    padding: 12,
  },
  skipText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 16,
  },
});
