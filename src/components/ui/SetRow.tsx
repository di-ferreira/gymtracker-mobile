import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface SetRowProps {
  setNumber: number;
  weight: string;
  reps: string;
  completed?: boolean;
  onToggle?: () => void;
}

export function SetRow({ setNumber, weight, reps, completed = false, onToggle }: SetRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, completed && styles.completed]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.circle}>
        {completed && <Text style={styles.check}>✓</Text>}
      </View>
      <Text style={styles.setNumber}>{setNumber}</Text>
      <View style={styles.inputs}>
        <Text style={styles.value}>{weight}</Text>
        <Text style={styles.separator}>×</Text>
        <Text style={styles.value}>{reps}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[2],
  },
  completed: {
    opacity: 0.5,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  check: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  setNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.fgSecondary,
    marginRight: spacing[4],
    minWidth: 28,
  },
  inputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.fg,
  },
  separator: {
    fontSize: 16,
    color: colors.fgMuted,
  },
});
