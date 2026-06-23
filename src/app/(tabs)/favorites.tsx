import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { useFavoritesStore } from '../../features/favorites/store';
import { getDatabase } from '../../database';
import { ExerciseCard } from '../../components/ui/ExerciseCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function FavoritesScreen() {
  const router = useRouter();
  const { ids, load } = useFavoritesStore();

  useEffect(() => {
    load();
  }, [load]);

  const { data: exercises } = useQuery({
    queryKey: ['favorite-exercises', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const db = await getDatabase();
      const placeholders = ids.map(() => '?').join(',');
      return db.getAllAsync<{
        id: string;
        name: string;
        target_muscle_primary: string | null;
        thumbnail_url: string | null;
      }>(
        `SELECT id, name, target_muscle_primary, thumbnail_url FROM exercises WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
        ...ids
      );
    },
    enabled: ids.length > 0,
  });

  const renderItem: ListRenderItem<{
    id: string;
    name: string;
    target_muscle_primary: string | null;
    thumbnail_url: string | null;
  }> = useCallback(
    ({ item }) => (
      <View style={styles.cardWrapper}>
        <ExerciseCard
          name={item.name}
          muscleGroup={item.target_muscle_primary ?? undefined}
          onPress={() => router.push(`/exercise/${item.id}`)}
        />
      </View>
    ),
    [router]
  );

  const data = exercises ?? [];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Favoritos', headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        <Text style={styles.count}>
          {ids.length} {ids.length === 1 ? 'exercício' : 'exercícios'}
        </Text>
      </View>

      <FlashList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="Nenhum favorito"
            description="Favorite exercícios para encontrá-los rapidamente aqui."
            actionLabel="Explorar exercícios"
            onAction={() => router.push('/(tabs)/exercises')}
          />
        }
        renderItem={renderItem}
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
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
  cardWrapper: {
    flex: 1,
  },
});
