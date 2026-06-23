import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

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
        <Text style={styles.title}>GymTracker</Text>
        <Text style={styles.subtitle}>Entre na sua conta</Text>

        {(error || localError) && (
          <Text style={styles.errorText}>{error ?? localError}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.fgTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={colors.fgTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.linkText}>
            Não tem conta? <Text style={styles.linkHighlight}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.03,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 16,
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
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: colors.surface2,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontSize: 16,
    color: colors.fg,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[4],
    height: 56,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.bg,
  },
  linkButton: {
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
