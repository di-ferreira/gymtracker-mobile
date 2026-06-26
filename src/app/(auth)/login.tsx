import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../features/auth/store';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/borderRadius';
import { getApiUrl, setApiUrl } from '../../storage';
import { refreshBaseUrl } from '../../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiUrlDraft, setApiUrlDraft] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    getApiUrl().then(setApiUrlDraft);
  }, []);

  const handleLogin = async () => {
    clearError();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Informe seu email');
      return;
    }
    if (!password.trim()) {
      setLocalError('Informe sua senha');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch {
      // store.error já foi definido com a mensagem detalhada
    }
  };

  const handleSaveApiUrl = async () => {
    const trimmed = apiUrlDraft.trim().replace(/\/+$/, '');
    await setApiUrl(trimmed);
    await refreshBaseUrl();
    setShowApiConfig(false);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    const trimmed = apiUrlDraft.trim().replace(/\/+$/, '');
    await setApiUrl(trimmed);
    await refreshBaseUrl();
    try {
      const { api } = await import('../../services/api');
      const response = await api.get('/admin/health');
      if (response.status === 200) {
        setConnectionStatus({ ok: true, msg: 'Conectado! API respondendo normalmente.' });
      }
    } catch {
      setConnectionStatus({
        ok: false,
        msg: `Falha na conexão.\n\nDicas:\n- Em dispositivo físico, use o IP do computador\n- Verifique se o servidor está rodando\n- Verifique se ambos estão na mesma rede`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topBar}>
          <View />
          <TouchableOpacity
            style={styles.gearButton}
            onPress={() => setShowApiConfig(true)}
          >
            <Text style={styles.gearIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.content, { paddingBottom: insets.bottom + spacing[4] }]}>
          <Text style={styles.emoji}>💪</Text>
          <Text style={styles.title}>King Gym</Text>
          <Text style={styles.subtitle}>Entre na sua conta</Text>

          {(error || localError) && (
            <Text style={styles.errorText}>{error ?? localError}</Text>
          )}

          <TextInput
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="Senha"
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.button}
          />

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Não tem conta?{' '}
              <Text
                style={styles.linkHighlight}
                onPress={() => router.push('/(auth)/register')}
              >
                Cadastre-se
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      <BottomSheet
        visible={showApiConfig}
        onClose={() => setShowApiConfig(false)}
        style={styles.sheet}
      >
        <Text style={styles.sheetTitle}>Configurar API</Text>
        <Text style={styles.sheetDescription}>
          Informe a URL do servidor King Gym. Em dispositivo físico, use o IP do computador (ex: http://192.168.0.10:8000).
        </Text>
        <RNTextInput
          style={styles.urlInput}
          value={apiUrlDraft}
          onChangeText={setApiUrlDraft}
          placeholder="http://192.168.0.10:8000"
          placeholderTextColor={colors.fgTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        {connectionStatus && (
          <Text style={[styles.connectionStatus, connectionStatus.ok ? styles.connectionOk : styles.connectionFail]}>
            {connectionStatus.ok ? '✓ ' : '✗ '}{connectionStatus.msg}
          </Text>
        )}
        <View style={styles.sheetActions}>
          <Button
            title={testingConnection ? 'Testando…' : 'Testar'}
            variant="outline"
            onPress={handleTestConnection}
            disabled={testingConnection}
          />
          <Button title="Salvar" onPress={handleSaveApiUrl} />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
  },
  gearButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...typography.display,
    color: colors.fg,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.body,
    color: colors.fgSecondary,
    textAlign: 'center',
    marginBottom: spacing[10],
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
  button: {
    marginTop: spacing[4],
  },
  linkContainer: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.fgSecondary,
  },
  linkHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  sheet: {
    height: 320,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg,
    marginBottom: spacing[2],
  },
  sheetDescription: {
    fontSize: 13,
    color: colors.fgSecondary,
    lineHeight: 18,
    marginBottom: spacing[4],
  },
  urlInput: {
    backgroundColor: colors.surface2,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    color: colors.fg,
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    marginBottom: spacing[4],
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  connectionStatus: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing[3],
  },
  connectionOk: {
    color: '#4CAF50',
  },
  connectionFail: {
    color: '#F44336',
  },
});
