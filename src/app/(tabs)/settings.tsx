import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  getApiUrl,
  setApiUrl,
  clearAll,
} from '../../storage';
import { clearTokens } from '../../storage/auth-storage';
import { refreshBaseUrl } from '../../services/api';
import { syncCatalog } from '../../services/sync-service';
import { clearMediaCache, getMediaCacheSize } from '../../services/media-cache';
import { getDatabase } from '../../database';

const REST_TIMER_OPTIONS = [
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '120s', value: 120 },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [weightUnit, setWeightUnitState] = useState<'kg' | 'lbs'>('kg');
  const [restTimer, setRestTimerState] = useState(60);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [apiUrl, setApiUrlState] = useState('');
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [cacheSize, setCacheSize] = useState('');

  useEffect(() => {
    getWeightUnit().then(setWeightUnitState);
    getDefaultRestTimer().then(setRestTimerState);
    getTheme().then(setThemeState);
    getApiUrl().then((url) => {
      setApiUrlState(url);
      setUrlDraft(url);
    });
    getMediaCacheSize().then(setCacheSize);
  }, []);

  const handleSaveApiUrl = async () => {
    const trimmed = urlDraft.trim().replace(/\/+$/, '');
    await setApiUrl(trimmed);
    await refreshBaseUrl();
    setApiUrlState(trimmed);
    setEditingUrl(false);
  };

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await syncCatalog();
      Alert.alert('Sincronização', 'Catálogo sincronizado com sucesso.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao sincronizar';
      Alert.alert('Erro', message);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const { api } = await import('../../services/api');
      const response = await api.get('/admin/health');
      if (response.status === 200) {
        Alert.alert('Conectado', 'API respondendo normalmente.');
      } else {
        Alert.alert('Atenção', `API retornou status ${response.status}.`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      Alert.alert(
        'Falha na conexão',
        `Não foi possível conectar à API.\n\nURL: ${apiUrl}\n\nErro: ${message}\n\nDica: No Android emulator, use http://10.0.2.2:8000.\nNo iOS simulator, http://localhost:8000.\nEm dispositivo físico, use o IP do seu computador.`
      );
    } finally {
      setTestingConnection(false);
    }
  };

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

  const handleClearAllData = () => {
    Alert.alert(
      'Limpar todos os dados',
      'Isso irá:\n\n• Remover todos os exercícios baixados\n• Limpar cache de mídia\n• Remover preferências\n• Deslogar da sua conta\n\nEsta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar e sair',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDatabase();
              await db.execAsync('PRAGMA foreign_keys=OFF');
              await db.execAsync('DELETE FROM exercise_progress');
              await db.execAsync('DELETE FROM workout_exercises');
              await db.execAsync('DELETE FROM workout_history');
              await db.execAsync('DELETE FROM workouts');
              await db.execAsync('DELETE FROM exercise_alternatives');
              await db.execAsync('DELETE FROM exercise_instructions');
              await db.execAsync('DELETE FROM exercise_equipments');
              await db.execAsync('DELETE FROM exercises');
              await db.execAsync('DELETE FROM equipments');
              await db.execAsync('DELETE FROM movement_groups');
              await db.execAsync('DELETE FROM muscle_groups');
              await db.execAsync('DELETE FROM offline_exercises');
              await db.execAsync('DELETE FROM users');
              await db.execAsync('DELETE FROM catalog_versions');
              await db.execAsync('PRAGMA foreign_keys=ON');
              await clearMediaCache();
              await clearAll();
              await clearTokens();
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Erro desconhecido';
              Alert.alert('Erro', `Falha ao limpar dados: ${message}`);
            }
            router.replace('/(auth)/login');
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing[10] + insets.bottom }]}
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

        <Text style={styles.sectionLabel}>API</Text>
        <View style={styles.section}>
          {editingUrl ? (
            <View>
              <TextInput
                style={styles.urlInput}
                value={urlDraft}
                onChangeText={setUrlDraft}
                placeholder="http://localhost:8000"
                placeholderTextColor={colors.fgTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <View style={styles.urlActions}>
                <Button title="Salvar" onPress={handleSaveApiUrl} style={styles.urlSaveButton} />
                <Button title="Cancelar" variant="ghost" onPress={() => { setEditingUrl(false); setUrlDraft(apiUrl); }} />
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.row} onPress={() => setEditingUrl(true)}>
              <Text style={styles.rowLabel}>URL da API</Text>
              <Text style={styles.rowValue}>{apiUrl}</Text>
            </TouchableOpacity>
          )}
          <View style={styles.spacer} />
          <Button
            title={testingConnection ? 'Testando...' : 'Testar conexão'}
            variant="outline"
            onPress={handleTestConnection}
            disabled={testingConnection}
          />
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
            title={syncing ? 'Sincronizando...' : 'Forçar sincronização'}
            variant="outline"
            onPress={handleForceSync}
            disabled={syncing}
          />
          <View style={styles.spacer} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Cache de mídia</Text>
            <Text style={styles.rowValue}>{cacheSize}</Text>
          </View>
          <Button
            title="Limpar cache de mídia"
            variant="ghost"
            onPress={async () => {
              await clearMediaCache();
              setCacheSize('0 B');
              Alert.alert('Feito', 'Cache de mídia limpo.');
            }}
            textStyle={{ color: colors.error }}
          />
          <View style={styles.spacer} />
          <Button
            title="Limpar cache local"
            variant="ghost"
            onPress={handleClearCache}
            textStyle={{ color: colors.error }}
          />
          <View style={styles.spacer} />
          <View style={styles.separator} />
          <View style={styles.spacer} />
          <Button
            title="⚠️ Limpar todos os dados"
            variant="ghost"
            onPress={handleClearAllData}
            textStyle={{ color: colors.error, fontWeight: '700' }}
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
  urlInput: {
    backgroundColor: colors.surface2,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    color: colors.fg,
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    marginBottom: spacing[2],
  },
  urlActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  urlSaveButton: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
});
