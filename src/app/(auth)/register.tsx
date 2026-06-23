import { useState, useEffect } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiUrlDraft, setApiUrlDraft] = useState('');

  useEffect(() => {
    getApiUrl().then(setApiUrlDraft);
  }, []);

  const handleRegister = async () => {
    clearError();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError('Informe seu nome');
      return;
    }
    if (!email.trim()) {
      setLocalError('Informe seu email');
      return;
    }
    if (password.length < 6) {
      setLocalError('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Senhas não conferem');
      return;
    }

    try {
      await register({ name: name.trim(), email: email.trim(), password });
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
    const trimmed = apiUrlDraft.trim().replace(/\/+$/, '');
    await setApiUrl(trimmed);
    await refreshBaseUrl();
    try {
      const { api } = await import('../../services/api');
      const response = await api.get('/admin/health');
      if (response.status === 200) {
        alert('Conectado! API respondendo normalmente.');
      }
    } catch {
      alert(
        `Falha na conexão.\n\nURL: ${trimmed}\n\nDicas:\n- Em dispositivo físico, use o IP do computador (ex: http://192.168.0.10:8000)\n- Verifique se o servidor está rodando\n- Verifique se ambos estão na mesma rede Wi-Fi`
      );
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.emoji}>💪</Text>
          <Text style={styles.title}>GymTracker</Text>
          <Text style={styles.subtitle}>Crie sua conta</Text>

          {(error || localError) && (
            <Text style={styles.errorText}>{error ?? localError}</Text>
          )}

          <TextInput
            label="Nome"
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            label="Confirmar senha"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            title="Criar conta"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.button}
          />

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Já tem conta?{' '}
              <Text
                style={styles.linkHighlight}
                onPress={() => router.push('/(auth)/login')}
              >
                Entrar
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet
        visible={showApiConfig}
        onClose={() => setShowApiConfig(false)}
        style={styles.sheet}
      >
        <Text style={styles.sheetTitle}>Configurar API</Text>
        <Text style={styles.sheetDescription}>
          Informe a URL do servidor GymTracker. Em dispositivo físico, use o IP do computador (ex: http://192.168.0.10:8000).
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
        <View style={styles.sheetActions}>
          <Button title="Testar" variant="outline" onPress={handleTestConnection} />
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[10],
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
});
