import { useState, useEffect } from 'react';
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

  // Navigate away in an effect, never synchronously during render
  useEffect(() => {
    if (!sound) router.replace('/');
  }, [sound, router]);

  if (!sound) return null;

  function advance() {
    if (step === 3) {
      router.push(`/game/egg-hatch?soundId=${soundId}`);
    } else {
      setStep((s) => (s + 1) as 1 | 2 | 3);
    }
  }

  function goBack() {
    if (step === 1) {
      router.replace('/');
    } else {
      setStep((s) => (s - 1) as 1 | 2 | 3);
    }
  }

  if (step === 1) return <MeetStep sound={sound} onNext={advance} onBack={goBack} step={step} />;
  if (step === 2) return <HearStep sound={sound} onNext={advance} onBack={goBack} step={step} />;
  return <TraceStep sound={sound} onNext={advance} onBack={goBack} step={step} />;
}
