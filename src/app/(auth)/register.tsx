import { useState } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../features/auth/store';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

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
