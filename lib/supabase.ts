import { createClient } from '@supabase/supabase-js';
import { SOUND_ORDER } from '../constants/sounds';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Create dinophonics/.env.local with ' +
    'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Child = {
  id: string;
  name: string;
  avatar_sound_id: string;
  created_at: string;
};

export type Progress = {
  id: string;
  child_id: string;
  sound_id: string;
  status: 'locked' | 'unlocked' | 'complete';
  last_played_at: string | null;
  mastery_score: number;
};

export async function createChild(name: string, avatarSoundId: string): Promise<Child> {
  const { data, error } = await supabase
    .from('children')
    .insert({ name, avatar_sound_id: avatarSoundId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProgress(childId: string): Promise<Progress[]> {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('child_id', childId);
  if (error) throw error;
  return data;
}

export async function seedProgress(childId: string): Promise<void> {
  const rows = SOUND_ORDER.map((sound_id, i) => ({
    child_id: childId,
    sound_id,
    status: i === 0 ? 'unlocked' : 'locked',
  }));
  const { error } = await supabase.from('progress').insert(rows);
  if (error) throw error;
}

export async function getChildById(id: string): Promise<Child | null> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function updateProgressStatus(
  childId: string,
  soundId: string,
  status: 'unlocked' | 'complete',
  masteryScore?: number
): Promise<void> {
  const { error } = await supabase
    .from('progress')
    .update({
      status,
      last_played_at: new Date().toISOString(),
      ...(masteryScore !== undefined && { mastery_score: masteryScore }),
    })
    .eq('child_id', childId)
    .eq('sound_id', soundId);
  if (error) throw error;
}
