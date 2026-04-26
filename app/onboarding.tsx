import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createChild, seedProgress, getProgress } from '../lib/supabase';
import { useChildStore } from '../store/childStore';
import { useProgressStore } from '../store/progressStore';
import { SOUNDS, SOUND_ORDER } from '../constants/sounds';
import type { Child, Progress } from '../lib/supabase';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function Onboarding() {
  const [name, setName] = useState('');
  const [avatarSoundId, setAvatarSoundId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setChild } = useChildStore();
  const { setProgress } = useProgressStore();

  const canProceed = name.trim().length > 0 && avatarSoundId !== '';

  async function handleSubmit() {
    if (!canProceed || isSubmitting) return;
    setIsSubmitting(true);

    const childId = generateId();
    const trimmedName = name.trim();

    const localChild: Child = {
      id: childId,
      name: trimmedName,
      avatar_sound_id: avatarSoundId,
      created_at: new Date().toISOString(),
    };

    const localProgress: Progress[] = SOUND_ORDER.map((sound_id, i) => ({
      id: generateId(),
      child_id: childId,
      sound_id,
      status: i === 0 ? 'unlocked' : 'locked',
      last_played_at: null,
      mastery_score: 0,
    }));

    await AsyncStorage.setItem('childId', childId);
    await AsyncStorage.setItem('childData', JSON.stringify(localChild));
    await AsyncStorage.setItem('progressData', JSON.stringify(localProgress));

    setChild(localChild);
    setProgress(localProgress);
    router.replace('/');

    // Sync to Supabase in the background — non-blocking
    createChild(trimmedName, avatarSoundId)
      .then((remoteChild) => seedProgress(remoteChild.id))
      .catch(() => {});
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Dinophonics</Text>
        <Text style={styles.subtitle}>What's your name?</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Type your name..."
          placeholderTextColor="#A5D6A7"
          maxLength={30}
          autoFocus
        />

        <Text style={styles.subtitle}>Pick your dino!</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avatarRow}
        >
          {SOUNDS.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              onPress={() => setAvatarSoundId(sound.id)}
              style={[
                styles.avatarCard,
                avatarSoundId === sound.id && { borderColor: sound.color, borderWidth: 4 },
              ]}
            >
              <Image source={sound.imageFile} style={styles.avatarImage} />
              <Text style={styles.avatarName}>{sound.dinoName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.button, !canProceed && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canProceed || isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Loading...' : "Let's go! 🦕"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 22,
    color: '#C8E6C9',
    marginBottom: 12,
    marginTop: 28,
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#2E7D32',
    color: '#fff',
    fontSize: 22,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
    textAlign: 'center',
  },
  avatarRow: {
    paddingVertical: 8,
    gap: 12,
  },
  avatarCard: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    borderWidth: 4,
    borderColor: 'transparent',
    width: 104,
  },
  avatarImage: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },
  avatarName: {
    color: '#fff',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFD600',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 32,
    marginTop: 36,
  },
  buttonDisabled: {
    backgroundColor: '#4A7A4A',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
});
