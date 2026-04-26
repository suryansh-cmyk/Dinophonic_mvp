import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSoundById } from '../../constants/sounds';
import MeetStep from '../../components/lesson/MeetStep';
import HearStep from '../../components/lesson/HearStep';
import TraceStep from '../../components/lesson/TraceStep';

export default function Lesson() {
  const { soundId } = useLocalSearchParams<{ soundId: string }>();
  const router = useRouter();
  const sound = getSoundById(soundId);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  if (!sound) {
    router.replace('/');
    return null;
  }

  function advance() {
    if (step === 3) {
      router.push(`/game/egg-hatch?soundId=${soundId}`);
    } else {
      setStep((s) => (s + 1) as 1 | 2 | 3);
    }
  }

  if (step === 1) return <MeetStep sound={sound} onNext={advance} />;
  if (step === 2) return <HearStep sound={sound} onNext={advance} />;
  return <TraceStep sound={sound} onNext={advance} />;
}
