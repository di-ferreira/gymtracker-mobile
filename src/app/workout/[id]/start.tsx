import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveWorkoutStore } from '../../../features/workouts/active-store';
import { SetRow } from '../../../components/ui/SetRow';
import { WeightRepInput } from '../../../components/ui/WeightRepInput';
import { RestTimer } from '../../../components/ui/RestTimer';
import { Button } from '../../../components/ui/Button';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { borderRadius } from '../../../theme/borderRadius';

interface SetFormState {
  weight: string;
  reps: string;
  rpe: string;
}

const INITIAL_FORM: SetFormState = { weight: '', reps: '', rpe: '' };

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useActiveWorkoutStore();
  const [form, setForm] = useState<SetFormState>(INITIAL_FORM);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!store.isActive && id) {
      store.startWorkout(id);
    }
  }, [id]);

  useEffect(() => {
    if (store.isActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [store.isActive]);

  const currentExercise = store.getCurrentExercise();
  const progress = store.exercises.length > 0
    ? `${store.currentExerciseIndex + 1} / ${store.exercises.length}`
    : '';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    const w = parseFloat(form.weight);
    const r = parseInt(form.reps, 10);
    if (isNaN(w) || isNaN(r)) {
      Alert.alert('Preencha peso e repetições');
      return;
    }
    const rpeValue = form.rpe ? parseFloat(form.rpe) : undefined;
    const setOrder = currentExercise?.sets.filter((s) => !s.completed)[0]?.set_order ?? 1;
    store.completeSet(setOrder, w, r, rpeValue);
    setForm(INITIAL_FORM);
  };

  const handleFinish = () => {
    Alert.alert('Finalizar treino', 'Deseja finalizar este treino?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        onPress: async () => {
          const result = await store.finishWorkout();
          store.reset();
          router.replace(`/workout/summary?historyId=${result.historyId}&duration=${result.duration}&volume=${result.volume}`);
        },
      },
    ]);
  };

  const handleSkipRest = useCallback(() => {
    store.setResting(false);
    setForm(INITIAL_FORM);
  }, [store]);

  if (!store.isActive || !currentExercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Preparando treino...</Text>
      </View>
    );
  }

  const pendingSets = currentExercise.sets.filter((s) => !s.completed);
  const nextSet = pendingSets[0];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.timer}>{formatTime(timerSeconds)}</Text>
        <Text style={styles.workoutName}>{store.workoutName}</Text>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.finishText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((store.currentExerciseIndex + 1) / store.exercises.length) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing[10] + insets.bottom }]}
      >
        <Text style={styles.exerciseTitle}>{currentExercise.exercise_name}</Text>
        <Text style={styles.progressText}>Exercício {progress}</Text>

        <View style={styles.setsList}>
          {currentExercise.sets.map((set) => (
            <SetRow
              key={set.set_order}
              setNumber={set.set_order}
              weight={String(set.weight)}
              reps={String(set.reps)}
              completed={set.completed}
              onToggle={() => store.toggleSet(set.set_order)}
            />
          ))}
        </View>

        {store.isResting ? (
          <RestTimer duration={store.restTime} onComplete={handleSkipRest} />
        ) : nextSet ? (
          <View style={styles.loggingSection}>
            <Text style={styles.loggingTitle}>
              Série {nextSet.set_order} — {currentExercise.exercise_name}
            </Text>

            <WeightRepInput
              weight={form.weight}
              reps={form.reps}
              onWeightChange={(v) => setForm((f) => ({ ...f, weight: v }))}
              onRepsChange={(v) => setForm((f) => ({ ...f, reps: v }))}
            />

            <View style={styles.rpeRow}>
              <Text style={styles.rpeLabel}>RPE (opcional)</Text>
              <TouchableOpacity
                style={styles.rpeButtons}
                onPress={() => {
                  const vals = ['6', '7', '8', '9', '10'];
                  const idx = form.rpe ? vals.indexOf(form.rpe) : -1;
                  setForm((f) => ({ ...f, rpe: vals[(idx + 1) % vals.length] }));
                }}
              >
                <Text style={styles.rpeValue}>{form.rpe || '-'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <Button
                title="Concluir Série"
                onPress={handleCompleteSet}
                style={styles.actionButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.exerciseComplete}>
            <Text style={styles.completeText}>Todas as séries concluídas!</Text>
            {store.currentExerciseIndex < store.exercises.length - 1 ? (
              <Button
                title="Próximo Exercício"
                onPress={() => {
                  store.nextExercise();
                  setForm(INITIAL_FORM);
                }}
              />
            ) : (
              <Button title="Finalizar Treino" onPress={handleFinish} variant="secondary" />
            )}
          </View>
        )}

        {!store.isResting && !nextSet && (
          <TouchableOpacity
            style={styles.addSetButton}
            onPress={() => store.addSet()}
          >
            <Text style={styles.addSetText}>+ Adicionar série</Text>
          </TouchableOpacity>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[2],
  },
  timer: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg,
    fontVariant: ['tabular-nums'],
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fgSecondary,
  },
  finishText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.surface3,
    marginHorizontal: spacing[4],
    borderRadius: 2,
    marginBottom: spacing[4],
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  loadingText: {
    fontSize: 16,
    color: colors.fgSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.02,
    marginBottom: spacing[1],
  },
  progressText: {
    fontSize: 13,
    color: colors.fgTertiary,
    marginBottom: spacing[6],
  },
  setsList: {
    marginBottom: spacing[6],
  },
  loggingSection: {
    backgroundColor: colors.surface2,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
  },
  loggingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  rpeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[3],
    marginBottom: spacing[4],
  },
  rpeLabel: {
    fontSize: 14,
    color: colors.fgSecondary,
  },
  rpeButtons: {
    backgroundColor: colors.surface3,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  rpeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
  },
  actionRow: {
    marginTop: spacing[2],
  },
  actionButton: {
    width: '100%',
  },
  exerciseComplete: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[4],
  },
  completeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.success,
    marginBottom: spacing[2],
  },
  addSetButton: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    marginTop: spacing[2],
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
