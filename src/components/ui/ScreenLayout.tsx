import { type ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ScreenLayoutProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export function ScreenLayout({ children, scroll = true, style }: ScreenLayoutProps) {
  if (scroll) {
    return (
      <SafeAreaView style={[styles.container, style]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
});
