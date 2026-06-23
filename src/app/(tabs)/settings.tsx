import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import {
  getWeightUnit,
  setWeightUnit,
  getDefaultRestTimer,
  setDefaultRestTimer,
  getTheme,
  clearAll,
} from '../../storage';

const REST_TIMER_OPTIONS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '120s', value: 120 },
];

export default function SettingsScreen() {
  const [weightUnit, setWeightUnitState] = useState<'kg' | 'lbs'>('kg');
  const [restTimer, setRestTimerState] = useState(60);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    getWeightUnit().then(setWeightUnitState);
    getDefaultRestTimer().then(setRestTimerState);
    getTheme().then(setThemeState);
  }, []);

  const handleToggleWeightUnit = async () => {
    const next = weightUnit === 'kg' ? 'lbs' : 'kg';
    await setWeightUnit(next);
    setWeightUnitState(next);
  };

  const handleCycleRestTimer = async () => {
    const currentIndex = REST_TIMER_OPTIONS.findIndex((o) => o.value === restTimer);
    const nextIndex = (currentIndex + 1) % REST_TIMER_OPTIONS.length;
    const next = REST_TIMER_OPTIONS[nextIndex].value;
    await setDefaultRestTimer(next);
    setRestTimerState(next);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar cache',
      'Isso removerá todos os dados locais, incluindo preferências. Os dados do banco de dados serão mantidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            Alert.alert('Feito', 'Cache limpo com sucesso.');
          },
        },
      ]
    );
  };

  const APP_VERSION = '1.0.0';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Configurações', headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionLabel}>Treino</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={handleToggleWeightUnit}>
            <Text style={styles.rowLabel}>Unidade de peso</Text>
            <Text style={styles.rowValue}>{weightUnit}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={handleCycleRestTimer}>
            <Text style={styles.rowLabel}>Descanso padrão</Text>
            <Text style={styles.rowValue}>{restTimer}s</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Preferências</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowLabel}>Tema</Text>
            <Text style={styles.rowValue}>{theme === 'dark' ? 'Escuro' : 'Claro'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Dados</Text>
        <View style={styles.section}>
          <Button
            title="Forçar sincronização"
            variant="outline"
            onPress={() => Alert.alert('Sincronização', 'Funcionalidade disponível quando a API estiver conectada.')}
          />
          <View style={styles.spacer} />
          <Button
            title="Limpar cache local"
            variant="ghost"
            onPress={handleClearCache}
            textStyle={{ color: colors.error }}
          />
        </View>

        <Text style={styles.sectionLabel}>Sobre</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Versão</Text>
            <Text style={styles.rowValue}>{APP_VERSION}</Text>
          </View>
        </View>
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
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.02,
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.fgTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
    marginTop: spacing[6],
  },
  section: {
    marginHorizontal: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    padding: spacing[4],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  rowLabel: {
    fontSize: 15,
    color: colors.fg,
  },
  rowValue: {
    fontSize: 15,
    color: colors.fgSecondary,
  },
  spacer: {
    height: spacing[2],
  },
});
