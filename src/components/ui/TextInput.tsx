import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/borderRadius';
import { spacing } from '../../theme/spacing';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, style, ...props }: TextInputProps) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.fgTertiary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[3],
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fgSecondary,
    marginBottom: spacing[1],
  },
  input: {
    backgroundColor: colors.surface2,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    fontSize: 16,
    color: colors.fg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing[1],
  },
});
