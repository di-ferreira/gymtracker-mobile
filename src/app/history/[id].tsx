import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getDatabase } from '../../database';
import { createHistoryRepository } from '../../database/repositories/history-repository';
import { Loading } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${String(m).padStart(2, '0')}min`);
  parts.push(`${String(s).padStart(2, '0')}s`);
  return parts.join(' ');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['history-detail', id],
    queryFn: async () => {
      const db = await getDatabase();
      const repo = createHistoryRepository(db);
      const history = await repo.findById(id!);
      if (!history) throw new Error('Not found');

      const workout = await db.getFirstAsync<{ name: string }>(
        'SELECT name FROM workouts WHERE id = ?',
        history.workout_id
      );

      const progress = await db.getAllAsync<{
        exercise_id: string;
        exercise_name: string;
        set_order: number;
        weight: number;
        reps: number;
        rpe: number | null;
      }>(
        `SELECT ep.*, e.name as exercise_name FROM exercise_progress ep
         JOIN exercises e ON e.id = ep.exercise_id
         WHERE ep.workout_history_id = ?
         ORDER BY ep.exercise_id, ep.set_order`,
        id
      );

      return { ...history, workout_name: workout?.name ?? 'Treino', progress };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Carregando..." />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.container}>
        <ErrorState message="Erro ao carregar detalhes" onRetry={() => refetch()} />
      </View>
    );
  }

  const groupedProgress: Record<string, Array<{ exercise_id: string; exercise_name: string; set_order: number; weight: number; reps: number; rpe: number | null }>> = {};
  for (const p of data.progress) {
    if (!groupedProgress[p.exercise_id]) groupedProgress[p.exercise_id] = [];
    groupedProgress[p.exercise_id].push(p);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.workoutName}>{data.workout_name}</Text>
        <Text style={styles.date}>{formatDate(data.started_at)}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatDuration(data.duration_seconds)}</Text>
            <Text style={styles.statLabel}>Duração</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.total_volume?.toFixed(0)} kg</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Exercícios</Text>

        {Object.entries(groupedProgress).map(([exerciseId, sets]) => (
          <View key={exerciseId} style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{sets[0].exercise_name}</Text>
            {sets.map((s: { set_order: number; weight: number; reps: number; rpe: number | null }) => (
              <View key={s.set_order} style={styles.setRow}>
                <View style={styles.setCircle}>
                  <Text style={styles.setNumber}>{s.set_order}</Text>
                </View>
                <Text style={styles.setDetail}>
                  {s.weight} kg × {s.reps} reps
                </Text>
                {s.rpe && <Text style={styles.setRpe}>RPE {s.rpe}</Text>}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  backIcon: {
    fontSize: 22,
    color: colors.fg,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  workoutName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.02,
    marginBottom: spacing[1],
  },
  date: {
    fontSize: 14,
    color: colors.fgTertiary,
    marginBottom: spacing[6],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[8],
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: 13,
    color: colors.fgTertiary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg,
    marginBottom: spacing[4],
  },
  exerciseBlock: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
    marginBottom: spacing[3],
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  setCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.fgSecondary,
  },
  setDetail: {
    fontSize: 14,
    color: colors.fg,
  },
  setRpe: {
    fontSize: 12,
    color: colors.fgTertiary,
    marginLeft: 'auto',
  },
});
