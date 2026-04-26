import { useEffect, useRef } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import type { Sound } from '../constants/sounds';

type Props = {
  sound: Sound;
  status: 'locked' | 'unlocked' | 'complete';
  onPress: () => void;
};

export default function DinoCard({ sound, status, onPress }: Props) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (status === 'unlocked') {
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -8, duration: 500, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      );
      animRef.current.start();
    } else {
      animRef.current?.stop();
      bounceAnim.setValue(0);
    }
    return () => animRef.current?.stop();
  }, [status]);

  const isLocked = status === 'locked';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      style={styles.container}
      activeOpacity={0.8}
    >
      <View style={[styles.card, { borderColor: isLocked ? 'transparent' : sound.color }]}>
        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <Image
            source={sound.imageFile}
            style={[styles.image, isLocked && styles.imageGreyed]}
          />
        </Animated.View>

        {isLocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}

        {status === 'complete' && (
          <View style={styles.starBadge}>
            <Text style={styles.starIcon}>⭐</Text>
          </View>
        )}
      </View>
      <Text style={[styles.name, isLocked && styles.nameGreyed]}>
        {sound.dinoName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 6,
  },
  card: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },
  imageGreyed: {
    opacity: 0.35,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  lockIcon: {
    fontSize: 18,
  },
  starBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  starIcon: {
    fontSize: 22,
  },
  name: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  nameGreyed: {
    opacity: 0.5,
  },
});
