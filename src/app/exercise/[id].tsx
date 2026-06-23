import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useExercise } from '../../hooks/useExercises';
import { toggleFavorite, isFavorite } from '../../storage';
import { Chip } from '../../components/ui/Chip';
import { Loading } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: exercise, isLoading, isError, refetch } = useExercise(id);
  const [faved, setFaved] = useState(false);

  useEffect(() => {
    isFavorite(id).then(setFaved);
  }, [id]);

  const handleToggleFavorite = async () => {
    const newState = await toggleFavorite(id);
    setFaved(newState);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Loading message="Carregando exercício..." />
      </View>
    );
  }

  if (isError || !exercise) {
    return (
      <View style={styles.container}>
        <ErrorState message="Erro ao carregar exercício" onRetry={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favButton}>
          <Text style={[styles.favIcon, faved && styles.favIconActive]}>
            {faved ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroEmoji}>💪</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.name}>{exercise.name}</Text>
          <View style={styles.tags}>
            {exercise.muscle_group && (
              <Chip label={exercise.muscle_group.name} selected />
            )}
            {exercise.movement_group && (
              <Chip label={exercise.movement_group.name} />
            )}
          </View>
          <Text style={styles.description}>{exercise.description}</Text>
        </View>

        {exercise.equipment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipamentos</Text>
            <View style={styles.tags}>
              {exercise.equipment.map((eq) => (
                <Chip key={eq.id} label={eq.name} />
              ))}
            </View>
          </View>
        )}

        {exercise.instructions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instruções</Text>
            {exercise.instructions.map((inst, i) => (
              <View key={i} style={styles.instruction}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{inst.step_order}</Text>
                </View>
                <Text style={styles.instructionText}>{inst.description}</Text>
              </View>
            ))}
          </View>
        )}

        {exercise.execution_tips && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dicas</Text>
            <View style={styles.tipsBox}>
              <Text style={styles.tipsText}>{exercise.execution_tips}</Text>
            </View>
          </View>
        )}

        {exercise.alternatives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alternativas</Text>
            {exercise.alternatives.map((alt) => (
              <TouchableOpacity
                key={alt.id}
                style={styles.alternative}
                onPress={() => router.push(`/exercise/${alt.alternative_exercise_id}`)}
              >
                <Text style={styles.alternativeName}>{alt.alternative_name}</Text>
                {alt.reason && (
                  <Text style={styles.alternativeReason}>{alt.reason}</Text>
                )}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.spacer} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.fg,
  },
  favButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: {
    fontSize: 22,
    color: colors.fgTertiary,
  },
  favIconActive: {
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },
  hero: {
    marginHorizontal: spacing[4],
    height: 200,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: spacing[4],
  },
  heroPlaceholder: {
    flex: 1,
    backgroundColor: colors.surface3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 64,
  },
  section: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[6],
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.02,
    marginBottom: spacing[3],
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  description: {
    fontSize: 15,
    color: colors.fgSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg,
    marginBottom: spacing[3],
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.bg,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: colors.fgSecondary,
    lineHeight: 21,
  },
  tipsBox: {
    backgroundColor: colors.surface2,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  tipsText: {
    fontSize: 14,
    color: colors.fgSecondary,
    lineHeight: 20,
  },
  alternative: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surface2,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[2],
  },
  alternativeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.fg,
  },
  alternativeReason: {
    fontSize: 12,
    color: colors.fgTertiary,
    marginRight: spacing[2],
    maxWidth: 120,
  },
  chevron: {
    fontSize: 20,
    color: colors.fgMuted,
  },
  spacer: {
    height: spacing[10],
  },
});
