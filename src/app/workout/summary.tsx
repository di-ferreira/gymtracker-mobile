import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

export default function WorkoutSummaryScreen() {
  const params = useLocalSearchParams<{
    historyId: string;
    duration: string;
    volume: string;
  }>();
  const duration = params.duration;
  const volume = params.volume;
  const router = useRouter();

  const durationNum = parseInt(duration ?? '0', 10);
  const volumeNum = parseFloat(volume ?? '0');

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${String(m).padStart(2, '0')}min`);
    parts.push(`${String(s).padStart(2, '0')}s`);
    return parts.join(' ');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>✅</Text>
        </View>

        <Text style={styles.title}>Treino Concluído!</Text>
        <Text style={styles.subtitle}>Ótimo trabalho!</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDuration(durationNum)}</Text>
            <Text style={styles.statLabel}>Duração</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{volumeNum.toFixed(0)} kg</Text>
            <Text style={styles.statLabel}>Volume Total</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Novo Treino"
            onPress={() => router.replace('/(tabs)/workouts')}
            style={styles.actionButton}
          />
          <Button
            title="Voltar ao Início"
            variant="ghost"
            onPress={() => router.replace('/(tabs)')}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  badgeIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.02,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: colors.fgSecondary,
    marginBottom: spacing[10],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[10],
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.fg,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: 13,
    color: colors.fgTertiary,
  },
  actions: {
    width: '100%',
    gap: spacing[3],
  },
  actionButton: {
    width: '100%',
  },
});
