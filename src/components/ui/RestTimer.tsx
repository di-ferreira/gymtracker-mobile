import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface RestTimerProps {
  duration: number;
  onComplete?: () => void;
}

export function RestTimer({ duration, onComplete }: RestTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, onComplete]);

  const skip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(0);
    onComplete?.();
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = remaining / duration;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Descanso</Text>
      <Text style={styles.timer}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>
      <View style={styles.barBg}>
        <View style={[styles.bar, { width: `${progress * 100}%` }]} />
      </View>
      <TouchableOpacity onPress={skip} style={styles.skipButton}>
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fgSecondary,
    marginBottom: spacing[2],
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.02,
    marginBottom: spacing[4],
  },
  barBg: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surface3,
    borderRadius: 2,
    marginBottom: spacing[4],
  },
  bar: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  skipButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[6],
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
