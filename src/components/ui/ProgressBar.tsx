import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface ProgressBarProps {
  progress: number;
  height?: number;
}

export function ProgressBar({ progress, height = 6 }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.bg, { height }]}>
      <View style={[styles.fill, { width: `${clampedProgress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: colors.surface3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
