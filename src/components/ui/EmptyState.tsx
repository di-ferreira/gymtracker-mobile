import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.fg,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  description: {
    fontSize: 15,
    color: colors.fgSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing[6],
  },
  button: {
    minWidth: 160,
  },
});
