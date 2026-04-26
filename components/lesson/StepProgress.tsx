import { View, StyleSheet } from 'react-native';

type Props = {
  currentStep: 1 | 2 | 3;
  color: string;
};

export default function StepProgress({ currentStep, color }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.dot,
            step <= currentStep
              ? { backgroundColor: color }
              : styles.dotInactive,
            step === currentStep && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
