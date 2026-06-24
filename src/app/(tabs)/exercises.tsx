import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { ExerciseCard } from '../../components/ui/ExerciseCard';
import { Loading } from '../../components/ui/Loading';
import { ExerciseRow } from '../../database/repositories/exercise-repository';
import { useExercises } from '../../hooks/useExercises';
import { useOfflineExercises, useToggleOffline } from '../../hooks/useOfflineExercises';
import { borderRadius } from '../../theme/borderRadius';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const ALL_FILTER = 'todos';
const OFFLINE_FILTER = 'offline';

export default function ExercisesScreen() {
  const router = useRouter();
  const { data: exercises, isLoading, isError, refetch, isRefetching } = useExercises();
  const { data: offlineIds } = useOfflineExercises();
  const toggleOffline = useToggleOffline();
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
          (ex.description && ex.description.toLowerCase().includes(q)),
      );
    }

    if (selectedMuscle === OFFLINE_FILTER) {
      result = result.filter((ex) => offlineIds?.has(ex.id));
    } else if (selectedMuscle !== ALL_FILTER) {
      result = result.filter((ex) => ex.muscle_group_id === selectedMuscle);
    }

    return result;
  }, [exercises, search, selectedMuscle, offlineIds]);

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
  }, []);

  const handleToggleOffline = useCallback(
    (exerciseId: string, isCurrentlyOffline: boolean) => {
      const action = isCurrentlyOffline ? 'Remover do offline' : 'Disponibilizar offline';
      Alert.alert(action, isCurrentlyOffline ? 'Remover este exercício dos salvos offline?' : 'Baixar este exercício para uso offline?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action,
          onPress: () => toggleOffline.mutate({ exerciseId, isCurrentlyOffline }),
        },
      ]);
    },
    [toggleOffline],
  );

  const renderExerciseItem: ListRenderItem<ExerciseRow> = useCallback(
    ({ item }) => (
      <View style={styles.cardWrapper}>
        <ExerciseCard
          name={item.name}
          muscleGroup={item.target_muscle_primary ?? undefined}
          thumbnailUrl={item.thumbnail_url}
          isOffline={offlineIds?.has(item.id)}
          onToggleOffline={() => handleToggleOffline(item.id, offlineIds?.has(item.id) ?? false)}
          onPress={() => router.push(`/exercise/${item.id}`)}
        />
      </View>
    ),
    [router, offlineIds, handleToggleOffline],
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
        <Chip
          label={offlineIds && offlineIds.size > 0 ? `Offline (${offlineIds.size})` : 'Offline'}
          selected={selectedMuscle === OFFLINE_FILTER}
          onPress={() => setSelectedMuscle(OFFLINE_FILTER)}
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
          <EmptyState title="Nenhum resultado" description="Tente alterar sua busca ou filtros." />
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
    marginBottom: spacing[2],
    paddingVertical: spacing[0],
  },
  listContent: {
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[6],
  },
  cardWrapper: {
    flex: 1,
    padding: spacing[1],
  },
});
