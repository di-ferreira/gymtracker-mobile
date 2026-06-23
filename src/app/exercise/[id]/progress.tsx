import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getDatabase } from '../../../database';
import { createHistoryRepository } from '../../../database/repositories/history-repository';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Card } from '../../../components/ui/Card';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { borderRadius } from '../../../theme/borderRadius';

export default function ExerciseProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['exercise-progress', id],
    queryFn: async () => {
      const db = await getDatabase();
      const repo = createHistoryRepository(db);

      const exercise = await db.getFirstAsync<{ name: string }>(
        'SELECT name FROM exercises WHERE id = ?',
        id
      );
      if (!exercise) throw new Error('Exercise not found');

      const progress = await repo.getProgressForExercise(id!);

      const workouts = await Promise.all(
        [...new Set(progress.map((p: { workout_history_id: string }) => p.workout_history_id))].map(
          async (whId) => {
            const wh = await db.getFirstAsync<{
              started_at: string;
              workout_id: string;
            }>('SELECT started_at, workout_id FROM workout_history WHERE id = ?', whId);
            const w = wh
              ? await db.getFirstAsync<{ name: string }>(
                  'SELECT name FROM workouts WHERE id = ?',
                  wh.workout_id
                )
              : null;
            return {
              id: whId,
              started_at: wh?.started_at ?? '',
              workout_name: w?.name ?? '',
            };
          }
        )
      );

      return { name: exercise.name, progress, workouts };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Carregando progresso..." />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.container}>
        <ErrorState message="Erro ao carregar progresso" onRetry={() => refetch()} />
      </View>
    );
  }

  const bestSet = data.progress.reduce<{ weight: number; reps: number; rpe: number | null }>(
    (best, s) => (s.weight > best.weight ? s : best),
    data.progress[0] ?? { weight: 0, reps: 0, rpe: null }
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progresso</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.exerciseName}>{data.name}</Text>

        {data.progress.length > 0 && (
          <View style={styles.prCard}>
            <Text style={styles.prLabel}>Personal Record</Text>
            <Text style={styles.prValue}>
              {bestSet.weight} kg × {bestSet.reps} reps
            </Text>
            {bestSet.rpe && <Text style={styles.prRpe}>RPE {bestSet.rpe}</Text>}
          </View>
        )}

        {data.progress.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nenhum dado de progresso ainda. Complete séries deste exercício para ver seu histórico.
            </Text>
          </Card>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Histórico de Séries</Text>
            {data.workouts.map((w: { id: string; started_at: string; workout_name: string }) => {
              const sets = data.progress.filter(
                (p: { workout_history_id: string }) => p.workout_history_id === w.id
              );
              return (
                <View key={w.id} style={styles.workoutBlock}>
                  <View style={styles.workoutHeader}>
                    <Text style={styles.workoutName}>{w.workout_name}</Text>
                    <Text style={styles.workoutDate}>
                      {formatDate(w.started_at)}
                    </Text>
                  </View>
                  {sets.map((s: { set_order: number; weight: number; reps: number; rpe: number | null }) => (
                    <View key={s.set_order} style={styles.setRow}>
                      <Text style={styles.setOrder}>Série {s.set_order}</Text>
                      <Text style={styles.setData}>
                        {s.weight} kg × {s.reps}
                      </Text>
                      {s.rpe && (
                        <Text style={styles.setRpe}>RPE {s.rpe}</Text>
                      )}
                    </View>
                  ))}
                </View>
              );
            })}
          </>
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
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.02,
    marginBottom: spacing[6],
  },
  prCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[8],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  prLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    marginBottom: spacing[2],
  },
  prValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.fg,
  },
  prRpe: {
    fontSize: 14,
    color: colors.fgTertiary,
    marginTop: spacing[1],
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.fgSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg,
    marginBottom: spacing[4],
  },
  workoutBlock: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  workoutName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.fg,
  },
  workoutDate: {
    fontSize: 13,
    color: colors.fgTertiary,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  setOrder: {
    fontSize: 13,
    color: colors.fgTertiary,
    minWidth: 50,
  },
  setData: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.fg,
  },
  setRpe: {
    fontSize: 12,
    color: colors.fgTertiary,
    marginLeft: 'auto',
  },
});
