import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button title="Tentar novamente" onPress={onRetry} variant="outline" />
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
  icon: {
    fontSize: 48,
    marginBottom: spacing[4],
  },
  message: {
    fontSize: 16,
    color: colors.fgSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[6],
  },
});
