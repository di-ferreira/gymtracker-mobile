import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

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
      setLocalError('Email ou senha inválidos');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>💪</Text>
        <Text style={styles.title}>GymTracker</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
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
});
