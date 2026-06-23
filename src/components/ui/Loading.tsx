import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface LoadingProps {
  message?: string;
}

export function Loading({ message }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

export function LoadingOverlay({ message }: LoadingProps) {
  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && <Text style={styles.overlayMessage}>{message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  message: {
    fontSize: 14,
    color: colors.fgSecondary,
    marginTop: 16,
  },
  overlay: {

    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    ...StyleSheet.absoluteFill,
  },
  box: {
    backgroundColor: colors.surface2,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  overlayMessage: {
    fontSize: 14,
    color: colors.fgSecondary,
    marginTop: 16,
  },
});
