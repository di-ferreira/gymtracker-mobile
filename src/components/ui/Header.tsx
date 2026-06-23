import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export function Header({ title, onBack, rightAction }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress}>
            <Text style={styles.rightLabel}>{rightAction.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.bg,
  },
  left: {
    width: 48,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg,
    textAlign: 'center',
  },
  right: {
    width: 48,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: spacing[1],
  },
  backIcon: {
    fontSize: 22,
    color: colors.fg,
  },
  rightLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
