import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ExerciseCardProps {
  name: string;
  muscleGroup?: string;
  thumbnailUrl?: string | null;
  onPress?: () => void;
}

export function ExerciseCard({ name, muscleGroup, thumbnailUrl, onPress }: ExerciseCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>💪</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {muscleGroup && (
          <Text style={styles.muscleGroup}>{muscleGroup}</Text>
        )}
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
