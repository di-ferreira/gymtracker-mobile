import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDatabase } from '../../../database';
import { createWorkoutRepository } from '../../../database/repositories/workout-repository';
import { useWorkoutsStore } from '../../../features/workouts/store';
import { useMuscleGroups } from '../../../hooks/useMuscleGroups';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/ui/ErrorState';
import { ExerciseCard } from '../../../components/ui/ExerciseCard';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { workouts, remove, removeExercise, reorderExercises } = useWorkoutsStore();
  const { data: muscleGroups } = useMuscleGroups();
  const muscleNameMap = useMemo(() => {
    if (!muscleGroups) return new Map<string, string>();
    return new Map(muscleGroups.map((mg) => [mg.id, mg.name]));
  }, [muscleGroups]);
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
        muscle_group_id: string;
        target_muscle_primary: string | null;
        thumbnail_url: string | null;
      }>(
        `SELECT id, name, muscle_group_id, target_muscle_primary, thumbnail_url FROM exercises WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
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

  const handleDragEnd = useCallback(
    ({ data }: { data: typeof exercises }) => {
      if (!data) return;
      const orderedIds = data.map((we) => we.id);
      reorderExercises(id, orderedIds);
      queryClient.invalidateQueries({ queryKey: ['workout-exercises', id] });
    },
    [id, reorderExercises, queryClient]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: { item: NonNullable<typeof exercises>[0]; drag: () => void; isActive: boolean }) => {
      if (!item.exercise) return null;
      return (
        <ScaleDecorator>
          <View style={[styles.exerciseRow, isActive && styles.exerciseRowActive]}>
            <TouchableOpacity
              onPress={() => router.push(`/exercise/${item.exercise_id}`)}
              style={styles.exerciseCardTouchable}
              onLongPress={drag}
              delayLongPress={200}
            >
              <ExerciseCard
                name={item.exercise.name}
                muscleGroup={item.exercise.target_muscle_primary ?? muscleNameMap.get(item.exercise.muscle_group_id) ?? undefined}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveExercise(item.exercise_id, item.exercise!.name)}
            >
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        </ScaleDecorator>
      );
    },
    [router, handleRemoveExercise, muscleNameMap]
  );

  const keyExtractor = useCallback((item: NonNullable<typeof exercises>[0]) => item.id, []);

  if (!workout) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    );
  }

  const listItems = exercises ?? [];

  const headerComponent = (
    <>
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

      <View style={styles.exerciseHeader}>
        <Text style={styles.sectionLabel}>Exercícios</Text>
        <TouchableOpacity onPress={() => router.push(`/workout/${id}/add-exercises`)}>
          <Text style={styles.addText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const footerComponent = (
    <>
      {listItems.length > 0 && (
        <View style={[styles.startSection, { paddingBottom: insets.bottom }]}>
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
    </>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
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

      {listItems.length === 0 && !isLoading ? (
        <>
          {headerComponent}
          <View style={styles.emptySection}>
            <Text style={styles.emptyTitle}>Nenhum exercício</Text>
            <Text style={styles.emptyDescription}>
              Adicione exercícios a este treino para começar.
            </Text>
            <Button
              title="Adicionar exercícios"
              onPress={() => router.push(`/workout/${id}/add-exercises`)}
              style={styles.addButton}
            />
          </View>
          {footerComponent}
        </>
      ) : (
        <DraggableFlatList
          data={listItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onDragEnd={handleDragEnd}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={headerComponent}
          ListFooterComponent={footerComponent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </GestureHandlerRootView>
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
  exerciseRowActive: {
    opacity: 0.85,
    transform: [{ scale: 1.02 }],
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
  addButton: {
    marginTop: spacing[4],
    width: '100%',
  },
  deleteButton: {
    marginTop: spacing[6],
    alignSelf: 'center',
  },
});
