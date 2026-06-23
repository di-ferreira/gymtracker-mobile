import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getDatabase } from '../../../database';
import { createWorkoutRepository } from '../../../database/repositories/workout-repository';
import { useWorkoutsStore } from '../../../features/workouts/store';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/ui/ErrorState';
import { ExerciseCard } from '../../../components/ui/ExerciseCard';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { workouts, remove } = useWorkoutsStore();
  const workout = workouts.find((w) => w.id === id);

  const { data: exercises, isLoading, isError, refetch } = useQuery({
    queryKey: ['workout-exercises', id],
    queryFn: async () => {
      const db = await getDatabase();
      const repo = createWorkoutRepository(db);
      const workoutExercises = await repo.getExercises(id!);

      if (workoutExercises.length === 0) return [];

      const ids = workoutExercises.map((we) => we.exercise_id);
      const placeholders = ids.map(() => '?').join(',');
      const rows = await db.getAllAsync<{
        id: string;
        name: string;
        target_muscle_primary: string | null;
        thumbnail_url: string | null;
      }>(
        `SELECT id, name, target_muscle_primary, thumbnail_url FROM exercises WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
        ...ids
      );

      return workoutExercises.map((we) => ({
        ...we,
        exercise: rows.find((r) => r.id === we.exercise_id),
      }));
    },
    enabled: !!id,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleDelete = () => {
    Alert.alert('Excluir treino', 'Tem certeza? Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await remove(id);
          router.back();
        },
      },
    ]);
  };

  if (!workout) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <TouchableOpacity onPress={() => router.push(`/workout/${id}/edit`)}>
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleSection}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          {workout.description && (
            <Text style={styles.workoutDescription}>{workout.description}</Text>
          )}
          <Text style={styles.workoutCount}>
            {workout.exercise_count} {workout.exercise_count === 1 ? 'exercício' : 'exercícios'}
          </Text>
        </View>

        {isLoading && <Loading message="Carregando exercícios..." />}
        {isError && <ErrorState message="Erro ao carregar exercícios" onRetry={() => refetch()} />}

        {exercises && exercises.length === 0 && (
          <View style={styles.emptySection}>
            <Text style={styles.emptyTitle}>Nenhum exercício</Text>
            <Text style={styles.emptyDescription}>
              Adicione exercícios a este treino para começar.
            </Text>
            <Button
              title="Adicionar exercícios"
              variant="outline"
              onPress={() => {}}
            />
          </View>
        )}

        {exercises && exercises.length > 0 && (
          <View style={styles.exerciseSection}>
            {exercises.map((we) =>
              we.exercise ? (
                <TouchableOpacity
                  key={we.id}
                  onPress={() => router.push(`/exercise/${we.exercise_id}`)}
                  style={styles.exerciseCard}
                >
                  <ExerciseCard name={we.exercise.name} />
                </TouchableOpacity>
              ) : null
            )}
          </View>
        )}

        <Button
          title="Excluir treino"
          variant="ghost"
          onPress={handleDelete}
          textStyle={{ color: colors.error }}
          style={styles.deleteButton}
        />
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
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },
  titleSection: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[6],
  },
  workoutName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.02,
    marginBottom: spacing[2],
  },
  workoutDescription: {
    fontSize: 15,
    color: colors.fgSecondary,
    lineHeight: 21,
    marginBottom: spacing[2],
  },
  workoutCount: {
    fontSize: 13,
    color: colors.fgTertiary,
  },
  emptySection: {
    alignItems: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[10],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.fg,
    marginBottom: spacing[2],
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.fgSecondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  exerciseSection: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  exerciseCard: {
    marginBottom: spacing[2],
  },
  deleteButton: {
    marginTop: spacing[8],
    alignSelf: 'center',
  },
});
