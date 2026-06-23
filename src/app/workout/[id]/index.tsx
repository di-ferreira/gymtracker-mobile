import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
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
  const { workouts, remove, removeExercise } = useWorkoutsStore();
  const workout = workouts.find((w) => w.id === id);

  const { data: exercises, isLoading, isError, refetch, isRefetching } = useQuery({
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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

  const handleRemoveExercise = (exerciseId: string, exerciseName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Remover exercício', `Remover "${exerciseName}" deste treino?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => removeExercise(id, exerciseId),
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
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
          </View>
        )}

        {exercises && exercises.length > 0 && (
          <View style={styles.exerciseSection}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.sectionLabel}>Exercícios</Text>
              <TouchableOpacity
                onPress={() => router.push(`/workout/${id}/add-exercises`)}
              >
                <Text style={styles.addText}>+ Adicionar</Text>
              </TouchableOpacity>
            </View>
            {exercises.map((we) =>
              we.exercise ? (
                <View key={we.id} style={styles.exerciseRow}>
                  <TouchableOpacity
                    onPress={() => router.push(`/exercise/${we.exercise_id}`)}
                    style={styles.exerciseCardTouchable}
                  >
                    <ExerciseCard name={we.exercise.name} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() =>
                      handleRemoveExercise(we.exercise_id, we.exercise!.name)
                    }
                  >
                    <Text style={styles.removeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            )}
          </View>
        )}

        {exercises && exercises.length > 0 && (
          <View style={styles.startSection}>
            <Button
              title="Iniciar Treino"
              onPress={() => router.push(`/workout/${id}/start`)}
              style={styles.startButton}
            />
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
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.fg,
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  exerciseRow: {
    marginBottom: spacing[2],
    position: 'relative',
  },
  exerciseCardTouchable: {
    width: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  removeIcon: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '700',
  },
  startSection: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[6],
  },
  startButton: {
    width: '100%',
  },
  deleteButton: {
    marginTop: spacing[6],
    alignSelf: 'center',
  },
});
