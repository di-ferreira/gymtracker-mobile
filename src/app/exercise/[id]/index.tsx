import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { ErrorState } from '../../../components/ui/ErrorState';
import { FavoriteButton } from '../../../components/ui/FavoriteButton';
import { ImageViewer } from '../../../components/ui/ImageViewer';
import { Loading } from '../../../components/ui/Loading';
import { useFavoritesStore } from '../../../features/favorites/store';
import { useExercise } from '../../../hooks/useExercises';
import { useOfflineExercises, useToggleOffline } from '../../../hooks/useOfflineExercises';
import { getCachedMediaUrl } from '../../../services/media-cache';
import { borderRadius } from '../../../theme/borderRadius';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: exercise, isLoading, isError, refetch } = useExercise(id);
  const { isFavorite, toggle } = useFavoritesStore();
  const { data: offlineIds } = useOfflineExercises();
  const toggleOffline = useToggleOffline();
  const [faved, setFaved] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const isOffline = offlineIds?.has(id) ?? false;

  useEffect(() => {
    setFaved(isFavorite(id));
  }, [id, isFavorite]);

  useEffect(() => {
    const url = exercise?.image_url ?? exercise?.gif_url ?? exercise?.thumbnail_url;
    if (url) {
      getCachedMediaUrl(url).then(setHeroImage);
    } else {
      setHeroImage(null);
    }
  }, [exercise?.image_url, exercise?.gif_url, exercise?.thumbnail_url]);

  const handleToggleFavorite = async () => {
    const newState = await toggle(id);
    setFaved(newState);
  };

  const handleToggleOffline = () => {
    const action = isOffline ? 'Remover do offline' : 'Disponibilizar offline';
    Alert.alert(
      action,
      isOffline
        ? 'Remover este exercício dos salvos offline? As mídias baixadas serão removidas.'
        : 'Baixar este exercício para uso offline, incluindo mídias?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action,
          onPress: () => toggleOffline.mutate({ exerciseId: id, isCurrentlyOffline: isOffline }),
        },
      ],
    );
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
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.offlineButton} onPress={handleToggleOffline}>
            <Text style={styles.offlineButtonIcon}>{isOffline ? '☁️' : '💾'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.progressButton}
            onPress={() => router.push(`/exercise/${id}/progress`)}
          >
            <Text style={styles.progressText}>📊</Text>
          </TouchableOpacity>
          <FavoriteButton isFavorite={faved} onToggle={handleToggleFavorite} size={22} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          {heroImage ? (
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={0.8} onPress={() => setImageViewerVisible(true)}>
              <Image source={{ uri: heroImage }} style={styles.heroImage} />
            </TouchableOpacity>
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroEmoji}>💪</Text>
            </View>
          )}
        </View>

        <ImageViewer visible={imageViewerVisible} uri={heroImage} onClose={() => setImageViewerVisible(false)} />

        <View style={styles.section}>
          <Text style={styles.name}>{exercise.name}</Text>
          <View style={styles.tags}>
            {exercise.muscle_group && <Chip label={exercise.muscle_group.name} selected />}
            {exercise.movement_group && <Chip label={exercise.movement_group.name} />}
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
                {alt.reason && <Text style={styles.alternativeReason}>{alt.reason}</Text>}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.progressSection}>
          <Button
            title="Ver Progresso"
            variant="outline"
            onPress={() => router.push(`/exercise/${id}/progress`)}
          />
        </View>

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
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
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
  offlineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineButtonIcon: {
    fontSize: 18,
  },
  progressButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 18,
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
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  progressSection: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
  },
  spacer: {
    height: spacing[10],
  },
});
