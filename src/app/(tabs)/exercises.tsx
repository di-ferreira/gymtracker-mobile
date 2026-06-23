import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useExercises } from '../../hooks/useExercises';
import { ExerciseRow } from '../../database/repositories/exercise-repository';
import { ExerciseCard } from '../../components/ui/ExerciseCard';
import { Chip } from '../../components/ui/Chip';
import { Loading } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

const ALL_FILTER = 'todos';

export default function ExercisesScreen() {
  const router = useRouter();
  const { data: exercises, isLoading, isError, refetch, isRefetching } = useExercises();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState(ALL_FILTER);

  const muscleGroups = useMemo(() => {
    if (!exercises) return [];
    const map = new Map<string, string>();
    for (const ex of exercises) {
      if (ex.target_muscle_primary) {
        map.set(ex.muscle_group_id, ex.target_muscle_primary);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [exercises]);

  const filtered = useMemo(() => {
    if (!exercises) return [];
    let result = exercises;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          (ex.description && ex.description.toLowerCase().includes(q))
      );
    }

    if (selectedMuscle !== ALL_FILTER) {
      result = result.filter((ex) => ex.muscle_group_id === selectedMuscle);
    }

    return result;
  }, [exercises, search, selectedMuscle]);

    const handleSearch = useCallback((text: string) => {
    setSearch(text);
  }, []);

  const renderExerciseItem: ListRenderItem<ExerciseRow> = useCallback(
    ({ item }) => (
      <View style={styles.cardWrapper}>
        <ExerciseCard
          name={item.name}
          muscleGroup={item.target_muscle_primary ?? undefined}
          thumbnailUrl={item.thumbnail_url}
          onPress={() => router.push(`/exercise/${item.id}`)}
        />
      </View>
    ),
    [router]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Carregando exercícios..." />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <ErrorState message="Erro ao carregar exercícios" onRetry={() => refetch()} />
      </View>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Nenhum exercício encontrado"
          description="Os exercícios serão carregados após o primeiro sync."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Exercícios', headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.title}>Exercícios</Text>
        <Text style={styles.count}>{exercises.length} exercícios</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar exercícios..."
          placeholderTextColor={colors.fgTertiary}
          value={search}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        <Chip
          label="Todos"
          selected={selectedMuscle === ALL_FILTER}
          onPress={() => setSelectedMuscle(ALL_FILTER)}
        />
        {muscleGroups.map((mg) => (
          <Chip
            key={mg.id}
            label={mg.name}
            selected={selectedMuscle === mg.id}
            onPress={() => setSelectedMuscle(mg.id)}
          />
        ))}
      </ScrollView>

      <FlashList<ExerciseRow>
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Nenhum resultado"
            description="Tente alterar sua busca ou filtros."
          />
        }
        renderItem={renderExerciseItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.02,
  },
  count: {
    fontSize: 13,
    color: colors.fgTertiary,
    marginTop: spacing[1],
  },
  searchContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  searchInput: {
    backgroundColor: colors.surface2,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 15,
    color: colors.fg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipsContainer: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  cardWrapper: {
    flex: 1,
  },
});
