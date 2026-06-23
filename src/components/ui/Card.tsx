import { View, StyleSheet, type ViewStyle } from 'react-native';
import { type ReactNode } from 'react';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function Card({ children, style, padded = true }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing[5],
  },
});
