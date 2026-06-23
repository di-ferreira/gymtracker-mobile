import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/borderRadius';
import { spacing } from '../../theme/spacing';

interface WeightRepInputProps {
  weight: string;
  reps: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
}

export function WeightRepInput({ weight, reps, onWeightChange, onRepsChange }: WeightRepInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Peso</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={onWeightChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.fgMuted}
        />
      </View>
      <Text style={styles.separator}>×</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Reps</Text>
        <TextInput
          style={styles.input}
          value={reps}
          onChangeText={onRepsChange}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.fgMuted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.fgTertiary,
    marginBottom: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  input: {
    backgroundColor: colors.surface2,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: 20,
    fontWeight: '600',
    color: colors.fg,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  separator: {
    fontSize: 20,
    color: colors.fgMuted,
    paddingBottom: spacing[3],
  },
});
