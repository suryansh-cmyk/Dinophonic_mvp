import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Supabase URL loaded:', !!supabaseUrl, supabaseUrl?.slice(0, 30));

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
  const soundOrder = ['s', 'a', 't', 'i', 'p', 'n'];
  const rows = soundOrder.map((sound_id, i) => ({
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
  status: 'unlocked' | 'complete'
): Promise<void> {
  const { error } = await supabase
    .from('progress')
    .update({ status, last_played_at: new Date().toISOString() })
    .eq('child_id', childId)
    .eq('sound_id', soundId);
  if (error) throw error;
}
