import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setOnboardingDone } from '../../storage';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

interface Slide {
  emoji: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    emoji: '🏋️',
    title: 'Monte seus Treinos',
    description:
      'Crie treinos personalizados com exercícios do seu catálogo. Organize por grupos musculares e equipamentos.',
  },
  {
    emoji: '📊',
    title: 'Acompanhe seu Progresso',
    description:
      'Registre peso, repetições e séries. Veja sua evolução ao longo do tempo com gráficos e estatísticas.',
  },
  {
    emoji: '☁️',
    title: 'Disponível Offline',
    description:
      'Seus treinos e histórico ficam salvos no dispositivo. Sincronize com a nuvem quando estiver online.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleFinish = async () => {
    await setOnboardingDone();
    router.replace('/(auth)/login');
  };

  const isLast = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: spacing[6] + insets.bottom }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        {isLast ? (
          <Button title="Começar" onPress={handleFinish} />
        ) : (
          <Button title="Próximo" onPress={handleNext} />
        )}

        <View style={styles.skipContainer}>
          {!isLast && (
            <Button
              title="Pular"
              variant="ghost"
              onPress={handleFinish}
              textStyle={styles.skipText}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing[8],
  },
  title: {
    ...typography.h1,
    color: colors.fg,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  description: {
    ...typography.body,
    color: colors.fgSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
    gap: spacing[4],
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface4,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  skipContainer: {
    marginTop: spacing[2],
  },
  skipText: {
    color: colors.fgTertiary,
  },
});
