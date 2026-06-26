import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../features/auth/store';
import { isOnboardingDone } from '../storage';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function IndexScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(async () => {
        const onboardingDone = await isOnboardingDone();
        if (!onboardingDone) {
          router.replace('/(onboarding)');
        } else if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.emoji}>💪</Text>
        <Text style={styles.title}>King Gym</Text>
        <Text style={styles.subtitle}>Seu treino, seus resultados</Text>
      </Animated.View>
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
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.03,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: colors.fgSecondary,
  },
});
