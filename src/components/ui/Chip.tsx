import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/borderRadius';
import { spacing } from '../../theme/spacing';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface3,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  selected: {
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.fgSecondary,
  },
  selectedLabel: {
    color: colors.bg,
    fontWeight: '600',
  },
});
