import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkoutsStore } from '../../../features/workouts/store';
import { Button } from '../../../components/ui/Button';
import { TextInput } from '../../../components/ui/TextInput';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';

export default function EditWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { workouts, update, isLoading } = useWorkoutsStore();
  const workout = workouts.find((w) => w.id === id);

  const [name, setName] = useState(workout?.name ?? '');
  const [description, setDescription] = useState(workout?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Informe um nome para o treino');
      return;
    }
    setError(null);
    await update(id, {
      name: name.trim(),
      description: description.trim() || undefined,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Editar Treino</Text>
        <Button title="Salvar" variant="ghost" onPress={handleSave} loading={isLoading} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          label="Nome do treino"
          placeholder="Ex: Full Body A"
          value={name}
          onChangeText={setName}
          autoCapitalize="sentences"
        />

        <TextInput
          label="Descrição (opcional)"
          placeholder="Descreva o foco do treino"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: spacing[2],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  headerTitle: {
    ...typography.h3,
    color: colors.fg,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing[4],
    backgroundColor: colors.errorSurface,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    overflow: 'hidden',
  },
});
