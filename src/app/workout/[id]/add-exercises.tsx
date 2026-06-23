import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getDatabase } from '../../../database';
import { createWorkoutRepository } from '../../../database/repositories/workout-repository';
import { useWorkoutsStore } from '../../../features/workouts/store';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ErrorState } from '../../../components/ui/ErrorState';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { borderRadius } from '../../../theme/borderRadius';

export default function AddExercisesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addExercises } = useWorkoutsStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const { data: available, isLoading, isError, refetch } = useQuery({
    queryKey: ['add-exercises', id],
    queryFn: async () => {
      const db = await getDatabase();
      const repo = createWorkoutRepository(db);
      const existing = await repo.getExercises(id!);
      const existingIds = new Set(existing.map((e) => e.exercise_id));

      const all = await db.getAllAsync<{
        id: string;
        name: string;
        target_muscle_primary: string | null;
      }>(
        'SELECT id, name, target_muscle_primary FROM exercises WHERE deleted_at IS NULL ORDER BY name'
      );

      return all.filter((e) => !existingIds.has(e.id));
    },
    enabled: !!id,
  });

  const toggleSelect = (exerciseId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    await addExercises(id, Array.from(selected));
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Carregando exercícios..." />
      </View>
    );
  }

  if (isError || !available) {
    return (
      <View style={styles.container}>
        <ErrorState message="Erro ao carregar" onRetry={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Adicionar Exercícios</Text>
        <View style={{ width: 80 }} />
      </View>

      <Text style={styles.count}>
        {available.length} disponíveis · {selected.size} selecionados
      </Text>

      <FlatList
        data={available}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Todos os exercícios já foram adicionados a este treino.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => toggleSelect(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                {isSelected && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.target_muscle_primary && (
                  <Text style={styles.itemMuscle}>{item.target_muscle_primary}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <Button
          title={`Adicionar (${selected.size})`}
          onPress={handleAdd}
          disabled={selected.size === 0}
          loading={saving}
        />
      </View>
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
    paddingHorizontal: spacing[2],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg,
  },
  count: {
    fontSize: 13,
    color: colors.fgTertiary,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing[10],
  },
  emptyText: {
    fontSize: 14,
    color: colors.fgSecondary,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemSelected: {
    borderColor: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  checkMark: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.fg,
  },
  itemMuscle: {
    fontSize: 12,
    color: colors.fgTertiary,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: spacing[6],
    left: spacing[4],
    right: spacing[4],
  },
});
