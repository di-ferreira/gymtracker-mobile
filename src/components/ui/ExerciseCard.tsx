import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCachedMediaUrl } from '../../services/media-cache';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ExerciseCardProps {
  name: string;
  muscleGroup?: string;
  thumbnailUrl?: string | null;
  isOffline?: boolean;
  onToggleOffline?: () => void;
  onPress?: () => void;
}

export function ExerciseCard({
  name,
  muscleGroup,
  thumbnailUrl,
  isOffline,
  onToggleOffline,
  onPress,
}: ExerciseCardProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (thumbnailUrl) {
      getCachedMediaUrl(thumbnailUrl).then(setResolvedUrl);
    }
  }, [thumbnailUrl]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {resolvedUrl ? (
          <Image source={{ uri: resolvedUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>💪</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.offlineBadge}
          onPress={onToggleOffline}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.offlineBadgeIcon}>{isOffline ? '☁️' : '💾'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {muscleGroup && <Text style={styles.muscleGroup}>{muscleGroup}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.surface3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
  },
  offlineBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBadgeIcon: {
    fontSize: 14,
  },
  info: {
    padding: spacing[4],
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
  },
  muscleGroup: {
    fontSize: 13,
    color: colors.fgTertiary,
    marginTop: 2,
  },
});
