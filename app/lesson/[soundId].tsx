import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSoundById } from '../../constants/sounds';

export default function Lesson() {
  const { soundId } = useLocalSearchParams<{ soundId: string }>();
  const router = useRouter();
  const sound = getSoundById(soundId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lesson: {sound?.dinoName ?? soundId}</Text>
      <Text style={styles.subtitle}>Coming in Part 5!</Text>
      <TouchableOpacity style={styles.back} onPress={() => router.replace('/')}>
        <Text style={styles.backText}>← Back to Map</Text>
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
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#C8E6C9',
  },
  back: {
    marginTop: 24,
    backgroundColor: '#FFD600',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
});
