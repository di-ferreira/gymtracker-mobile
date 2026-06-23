import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getDatabase } from '../../database';
import { createHistoryRepository } from '../../database/repositories/history-repository';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function HistoryScreen() {
  const router = useRouter();

  const { data: history, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const db = await getDatabase();
      const repo = createHistoryRepository(db);
      const all = await repo.findAll();

      const withNames = await Promise.all(
        all.map(async (h: typeof all[number]) => {
          const workout = await db.getFirstAsync<{ name: string }>(
            'SELECT name FROM workouts WHERE id = ?',
            h.workout_id
          );
          const progress = await db.getAllAsync(
            'SELECT COUNT(DISTINCT exercise_id) as count FROM exercise_progress WHERE workout_history_id = ?',
            h.id
          );
          return {
            ...h,
            workout_name: workout?.name ?? 'Treino',
            exercise_count: (progress[0] as { count: number })?.count ?? 0,
          };
        })
      );

      return withNames;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Carregando histórico..." />
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
        <Text style={styles.headerTitle}>Histórico</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={history ?? []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="Nenhum treino realizado"
            description="Seus treinos concluídos aparecerão aqui."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/history/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardName}>{item.workout_name}</Text>
              <Text style={styles.cardDate}>{formatDate(item.started_at)}</Text>
            </View>
            <View style={styles.cardStats}>
              <Text style={styles.cardStat}>
                {item.exercise_count} exercícios
              </Text>
              <Text style={styles.cardStat}>
                {formatDuration(item.duration_seconds)}
              </Text>
              <Text style={styles.cardStatHighlight}>
                {item.total_volume?.toFixed(0)} kg
              </Text>
            </View>
          </TouchableOpacity>
        )}
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
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
  },
  cardDate: {
    fontSize: 13,
    color: colors.fgTertiary,
  },
  cardStats: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  cardStat: {
    fontSize: 13,
    color: colors.fgSecondary,
  },
  cardStatHighlight: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
