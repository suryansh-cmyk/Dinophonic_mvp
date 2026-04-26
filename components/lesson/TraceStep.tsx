import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import type { Sound } from '../../constants/sounds';

type Point = { x: number; y: number };

type Props = {
  sound: Sound;
  onNext: () => void;
};

export default function TraceStep({ sound, onNext }: Props) {
  const { play } = useAudioPlayer();
  const [dots, setDots] = useState<Point[]>([]);
  const [traceCount, setTraceCount] = useState(0);
  const done = traceCount >= 3;
  const playRef = useRef(play);
  playRef.current = play;
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setDots((prev) => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setDots((prev) => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        playRef.current(soundRef.current.audioFile);
        setTraceCount((n) => n + 1);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Trace the letter! {Math.min(traceCount, 3)}/3
      </Text>

      <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
        {/* Guide letter behind the canvas */}
        <Text style={[styles.letterGuide, { color: sound.color + '30' }]}>
          {sound.symbol}
        </Text>
        <Canvas style={StyleSheet.absoluteFill}>
          {dots.map((pt, i) => (
            <Circle key={i} cx={pt.x} cy={pt.y} r={9} color={sound.color} />
          ))}
        </Canvas>
      </View>

      {done && (
        <Text style={styles.wellDone}>Well done! 🎉</Text>
      )}

      <View style={styles.buttons}>
        {done && (
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: sound.color }]} onPress={onNext}>
            <Text style={styles.nextText}>Next →</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.skipBtn} onPress={onNext}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    paddingTop: 32,
    gap: 16,
  },
  instruction: {
    fontSize: 20,
    color: '#C8E6C9',
  },
  canvasWrapper: {
    width: 320,
    height: 320,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  letterGuide: {
    fontSize: 260,
    fontWeight: 'bold',
    position: 'absolute',
  },
  wellDone: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD600',
  },
  buttons: {
    gap: 12,
    alignItems: 'center',
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
  skipBtn: {
    padding: 12,
  },
  skipText: {
    color: '#6A9A6A',
    fontSize: 14,
  },
});
