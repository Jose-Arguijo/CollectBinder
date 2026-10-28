import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { Typography, Spacing, Radius } from '@/lib/theme';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    const { error } = mode === 'signin'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🃏</Text>
            <Text style={[styles.appName, { color: theme.textPrimary }]}>Binder</Text>
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>
              Your personal card collection, private to you.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.bgElevated, color: theme.textPrimary, borderColor: theme.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.bgElevated, color: theme.textPrimary, borderColor: theme.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={theme.textTertiary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={busy}
              style={[styles.primaryBtn, { backgroundColor: theme.accent, opacity: busy ? 0.6 : 1 }]}
              activeOpacity={0.85}
            >
              {busy ? (
                <ActivityIndicator size="small" color={theme.accentText} />
              ) : (
                <Text style={[styles.primaryBtnText, { color: theme.accentText }]}>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
                setError(null);
              }}
              style={styles.switchBtn}
            >
              <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoEmoji: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  appName: {
    fontFamily: Typography.fontFamilyBold,
    fontSize: 32,
  },
  tagline: {
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.xs,
    maxWidth: 280,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  label: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 14,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  errorText: {
    fontFamily: Typography.fontFamilyMedium,
    fontSize: 14,
    color: '#ef4444',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
    minHeight: 50,
  },
  primaryBtnText: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 16,
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  switchText: {
    fontFamily: Typography.fontFamilyMedium,
    fontSize: 14,
  },
});
