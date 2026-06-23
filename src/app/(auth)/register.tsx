import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

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
      setLocalError('Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>GymTracker</Text>
        <Text style={styles.subtitle}>Crie sua conta</Text>

        {(error || localError) && (
          <Text style={styles.errorText}>{error ?? localError}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor={colors.fgTertiary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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

        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor={colors.fgTertiary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.buttonText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.linkText}>
            Já tem conta? <Text style={styles.linkHighlight}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[10],
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
