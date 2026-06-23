import { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useWorkoutsStore } from '../../features/workouts/store';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

function WorkoutCard({
  name,
  exerciseCount,
  onPress,
}: {
  name: string;
  exerciseCount: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.cardIcon}>📋</Text>
      <Text style={styles.cardName}>{name}</Text>
      <Text style={styles.cardCount}>
        {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
      </Text>
    </TouchableOpacity>
  );
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const { workouts, isLoading, load } = useWorkoutsStore();

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Carregando treinos..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Treinos', headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.title}>Treinos</Text>
        <Text style={styles.count}>
          {workouts.length} {workouts.length === 1 ? 'treino' : 'treinos'}
        </Text>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <EmptyState
            title="Nenhum treino"
            description="Crie seu primeiro treino para começar."
            actionLabel="Criar treino"
            onAction={() => router.push('/workout/create')}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <WorkoutCard
              name={item.name}
              exerciseCount={item.exercise_count}
              onPress={() => router.push(`/workout/${item.id}`)}
            />
          </View>
        )}
      />

      <View style={styles.fabContainer}>
        <Button
          title="Novo Treino"
          onPress={() => router.push('/workout/create')}
          style={styles.fab}
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
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: spacing[3],
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
    marginBottom: spacing[1],
  },
  cardCount: {
    fontSize: 13,
    color: colors.fgTertiary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing[6],
    left: spacing[4],
    right: spacing[4],
  },
  fab: {
    width: '100%',
  },
});
