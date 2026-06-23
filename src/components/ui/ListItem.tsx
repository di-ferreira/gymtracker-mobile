import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

export function ListItem({ title, subtitle, onPress, showChevron = true }: ListItemProps) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {showChevron && onPress && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.fg,
  },
  subtitle: {
    fontSize: 13,
    color: colors.fgTertiary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: colors.fgMuted,
    marginLeft: spacing[2],
  },
});
