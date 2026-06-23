import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../features/auth/store';
import { colors } from '../theme/colors';

export default function IndexScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GymTracker</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.03,
    marginBottom: 24,
  },
  loader: {
    marginTop: 8,
  },
});
