export type Sound = {
  id: string;
  symbol: string;
  dinoName: string;
  mnemonic: string;
  sampleWords: string[];
  audioFile: ReturnType<typeof require>;
  introFile: ReturnType<typeof require>;
  imageFile: ReturnType<typeof require>;
  lottieFile: ReturnType<typeof require>;
  color: string;
};

export const SOUNDS: Sound[] = [
  {
    id: 's',
    symbol: 'S',
    dinoName: 'Sssaurus',
    mnemonic: 'hisses like a snake',
    sampleWords: ['sun', 'sit', 'snake'],
    audioFile: require('../assets/audio/s-sound.mp3'),
    introFile: require('../assets/audio/s-intro.mp3'),
    imageFile: require('../assets/images/s.png'),
    lottieFile: require('../assets/lotties/dino-entrance.json'),
    color: '#4CAF50',
  },
  {
    id: 'a',
    symbol: 'A',
    dinoName: 'Ankasaurus',
    mnemonic: 'opens mouth wide like an apple bite',
    sampleWords: ['ant', 'apple', 'ask'],
    audioFile: require('../assets/audio/a-sound.mp3'),
    introFile: require('../assets/audio/a-intro.mp3'),
    imageFile: require('../assets/images/a.png'),
    lottieFile: require('../assets/lotties/dino-entrance.json'),
    color: '#F44336',
  },
  {
    id: 't',
    symbol: 'T',
    dinoName: 'Trexo',
    mnemonic: 'taps its tiny arms like a clock ticking',
    sampleWords: ['tap', 'tin', 'top'],
    audioFile: require('../assets/audio/t-sound.mp3'),
    introFile: require('../assets/audio/t-intro.mp3'),
    imageFile: require('../assets/images/t.png'),
    lottieFile: require('../assets/lotties/dino-entrance.json'),
    color: '#FF9800',
  },
  {
    id: 'i',
    symbol: 'I',
    dinoName: 'Iggydon',
    mnemonic: 'itches its tummy like a wriggly worm',
    sampleWords: ['itch', 'igloo', 'ink'],
    audioFile: require('../assets/audio/i-sound.mp3'),
    introFile: require('../assets/audio/i-intro.mp3'),
    imageFile: require('../assets/images/i.png'),
    lottieFile: require('../assets/lotties/dino-entrance.json'),
    color: '#9C27B0',
  },
  {
    id: 'p',
    symbol: 'P',
    dinoName: 'Pteropuff',
    mnemonic: 'puffs its cheeks and pops like popcorn',
    sampleWords: ['pop', 'pin', 'pet'],
    audioFile: require('../assets/audio/p-sound.mp3'),
    introFile: require('../assets/audio/p-intro.mp3'),
    imageFile: require('../assets/images/p.png'),
    lottieFile: require('../assets/lotties/dino-entrance.json'),
    color: '#2196F3',
  },
  {
    id: 'n',
    symbol: 'N',
    dinoName: 'Nessuno',
    mnemonic: 'hums through its nose like a sleepy nap',
    sampleWords: ['nap', 'net', 'nut'],
    audioFile: require('../assets/audio/n-sound.mp3'),
    introFile: require('../assets/audio/n-intro.mp3'),
    imageFile: require('../assets/images/n.png'),
    lottieFile: require('../assets/lotties/dino-entrance.json'),
    color: '#00BCD4',
  },
];

export const SOUND_ORDER = ['s', 'a', 't', 'i', 'p', 'n'] as const;

export function getSoundById(id: string): Sound | undefined {
  return SOUNDS.find(s => s.id === id);
}

export function getNextSoundId(currentId: string): string | null {
  const idx = SOUND_ORDER.indexOf(currentId as typeof SOUND_ORDER[number]);
  if (idx === -1 || idx === SOUND_ORDER.length - 1) return null;
  return SOUND_ORDER[idx + 1];
}
