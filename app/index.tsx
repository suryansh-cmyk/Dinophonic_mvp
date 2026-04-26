import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChildStore } from '../store/childStore';
import { useProgressStore } from '../store/progressStore';
import { SOUNDS } from '../constants/sounds';
import DinoCard from '../components/DinoCard';

export default function WorldMap() {
  const router = useRouter();
  const { child, clearChild } = useChildStore();
  const { progress, setProgress } = useProgressStore();
  const [showSettings, setShowSettings] = useState(false);

  function getStatus(soundId: string): 'locked' | 'unlocked' | 'complete' {
    const row = progress.find((p) => p.sound_id === soundId);
    return row?.status ?? 'locked';
  }

  function handleDinoPress(soundId: string) {
    const status = getStatus(soundId);
    if (status !== 'locked') {
      router.push(`/lesson/${soundId}`);
    }
  }

  async function handleReset() {
    await AsyncStorage.multiRemove(['childId', 'childData', 'progressData']);
    clearChild();
    setProgress([]);
    setShowSettings(false);
    router.replace('/onboarding');
  }

  return (
    <ImageBackground
      source={require('../assets/images/background-jungle.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dinophonics</Text>
            {child && (
              <Text style={styles.greeting}>Hello, {child.name}! 👋</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={styles.settingsBtn}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Dino Grid — 2 rows of 3 */}
        <View style={styles.grid}>
          <View style={styles.row}>
            {SOUNDS.slice(0, 3).map((sound) => (
              <DinoCard
                key={sound.id}
                sound={sound}
                status={getStatus(sound.id)}
                onPress={() => handleDinoPress(sound.id)}
              />
            ))}
          </View>
          <View style={styles.row}>
            {SOUNDS.slice(3, 6).map((sound) => (
              <DinoCard
                key={sound.id}
                sound={sound}
                status={getStatus(sound.id)}
                onPress={() => handleDinoPress(sound.id)}
              />
            ))}
          </View>
        </View>

        {/* Settings Modal */}
        <Modal visible={showSettings} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                <Text style={styles.resetText}>🔄 Reset Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  greeting: {
    fontSize: 16,
    color: '#C8E6C9',
    marginTop: 2,
  },
  settingsBtn: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 28,
  },
  grid: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#1B5E20',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: 280,
    gap: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  resetBtn: {
    backgroundColor: '#F44336',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  resetText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#A5D6A7',
    fontSize: 16,
  },
});
