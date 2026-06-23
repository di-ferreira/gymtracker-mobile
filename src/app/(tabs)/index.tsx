import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getDatabase } from '../../database';
import { createHistoryRepository } from '../../database/repositories/history-repository';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function HomeScreen() {
  const router = useRouter();

  const { data: stats } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const db = await getDatabase();
      const repo = createHistoryRepository(db);
      const [total, volume, recent] = await Promise.all([
        repo.getTotalWorkouts(),
        repo.getTotalVolume(),
        repo.getRecent(5),
      ]);

      const recentWithNames = await Promise.all(
        recent.map(async (r) => {
          const workout = await db.getFirstAsync<{ name: string }>(
            'SELECT name FROM workouts WHERE id = ?',
            r.workout_id
          );
          const exercises = await db.getAllAsync(
            `SELECT DISTINCT e.name FROM exercise_progress ep
             JOIN exercises e ON e.id = ep.exercise_id
             WHERE ep.workout_history_id = ?`,
            r.id
          );
          return { ...r, workout_name: workout?.name ?? 'Treino', exercise_count: exercises.length };
        })
      );

      return { total, volume, recent: recentWithNames };
    },
  });

  if (!stats) {
    return (
      <View style={styles.container}>
        <Loading message="Carregando..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.greeting}>Olá!</Text>
        <Text style={styles.title}>GymTracker</Text>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Treinos</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.volume.toFixed(0)} kg</Text>
            <Text style={styles.statLabel}>Volume Total</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.recent.length > 0 ? formatDuration(stats.recent[0].duration_seconds) : '—'}</Text>
            <Text style={styles.statLabel}>Último Treino</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos Treinos</Text>
          {stats.recent.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          )}
        </View>

        {stats.recent.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum treino ainda</Text>
            <Text style={styles.emptyDescription}>
              Complete seu primeiro treino para ver estatísticas aqui.
            </Text>
          </Card>
        ) : (
          stats.recent.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyItem}
              onPress={() => router.push(`/history/${item.id}`)}
            >
              <View style={styles.historyInfo}>
                <Text style={styles.historyName}>{item.workout_name}</Text>
                <Text style={styles.historyMeta}>
                  {item.exercise_count} exercícios · {formatDuration(item.duration_seconds)}
                </Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyDate}>{formatDate(item.started_at)}</Text>
                <Text style={styles.historyVolume}>{item.total_volume?.toFixed(0)} kg</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  greeting: {
    fontSize: 14,
    color: colors.fgTertiary,
    marginTop: spacing[6],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.02,
    marginBottom: spacing[6],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[8],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[4],
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.fg,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: 12,
    color: colors.fgTertiary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
    marginBottom: spacing[2],
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.fgSecondary,
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
    marginBottom: spacing[1],
  },
  historyMeta: {
    fontSize: 13,
    color: colors.fgTertiary,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyDate: {
    fontSize: 13,
    color: colors.fgSecondary,
    marginBottom: spacing[1],
  },
  historyVolume: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
