import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MailIcon, AppleIcon } from '@/components/icons/TabBarIcons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

const isGoogleConfigured = Boolean(
  GOOGLE_WEB_CLIENT_ID && 
  (Platform.OS === 'web' || 
   (Platform.OS === 'ios' && GOOGLE_IOS_CLIENT_ID) || 
   (Platform.OS === 'android' && GOOGLE_ANDROID_CLIENT_ID))
);

let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;
if (Platform.OS === 'ios') {
  AppleAuthentication = require('expo-apple-authentication');
}

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { login, register, loginWithGoogle, loginWithApple } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios' && AppleAuthentication) {
      AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    if (!isGoogleConfigured) {
      Alert.alert(
        'Google prijava nije dostupna',
        'Google OAuth kredencijali nisu konfigurisani za ovu platformu.'
      );
      return;
    }
    
    Alert.alert(
      'Google prijava',
      'Google OAuth kredencijali još nisu podešeni. Molimo koristite email prijavu.'
    );
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios' || !AppleAuthentication) {
      return;
    }
    
    setIsAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      if (credential.identityToken) {
        await loginWithApple(credential.identityToken, credential.fullName ? {
          givenName: credential.fullName.givenName ?? undefined,
          familyName: credential.fullName.familyName ?? undefined,
        } : null);
      } else {
        Alert.alert('Greška', 'Nije moguće dobiti Apple token');
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      Alert.alert('Greška', error.message || 'Greška pri Apple prijavi');
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Greška', 'Sva polja su obavezna');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (error: any) {
      console.log('Auth error:', error);
      Alert.alert('Greška', error.message || 'Došlo je do greške');
      setIsLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundDefault,
      borderColor: theme.border,
      color: theme.text,
    },
  ];

  const showAppleButton = Platform.OS === 'ios' && isAppleAvailable;

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing['3xl'], paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="h1" style={styles.title}>VikendMajstor</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Iznajmi alat od komšije
        </ThemedText>
      </View>

      <View style={styles.form}>
        <ThemedText type="h3" style={styles.formTitle}>
          {isLogin ? 'Prijava' : 'Registracija'}
        </ThemedText>

        <Pressable
          style={[styles.googleButton, { borderColor: theme.border, backgroundColor: theme.backgroundDefault }]}
          onPress={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color={Colors.light.primary} size="small" />
          ) : (
            <>
              <View style={styles.googleIcon}>
                <MailIcon size={20} color="#EA4335" />
              </View>
              <ThemedText type="body" style={styles.googleButtonText}>
                {isLogin ? 'Prijavi se sa Google-om' : 'Registruj se sa Google-om'}
              </ThemedText>
            </>
          )}
        </Pressable>

        {showAppleButton ? (
          <Pressable
            style={[styles.appleButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
            onPress={handleAppleSignIn}
            disabled={isAppleLoading}
          >
            {isAppleLoading ? (
              <ActivityIndicator color={isDark ? '#000000' : '#FFFFFF'} size="small" />
            ) : (
              <>
                <AppleIcon size={20} color={isDark ? '#000000' : '#FFFFFF'} />
                <ThemedText type="body" style={[styles.appleButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                  {isLogin ? 'Prijavi se sa Apple-om' : 'Registruj se sa Apple-om'}
                </ThemedText>
              </>
            )}
          </Pressable>
        ) : null}

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <ThemedText type="small" style={[styles.dividerText, { color: theme.textTertiary }]}>
            ili
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        {!isLogin && (
          <TextInput
            style={inputStyle}
            placeholder="Ime i prezime"
            placeholderTextColor={theme.textTertiary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={inputStyle}
          placeholder="Email"
          placeholderTextColor={theme.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          style={inputStyle}
          placeholder="Lozinka"
          placeholderTextColor={theme.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <Button onPress={handleSubmit} disabled={isLoading} style={styles.button}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            isLogin ? 'Prijavi se' : 'Registruj se'
          )}
        </Button>

        <Pressable onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {isLogin ? 'Nemaš nalog? ' : 'Već imaš nalog? '}
            <ThemedText type="link">
              {isLogin ? 'Registruj se' : 'Prijavi se'}
            </ThemedText>
          </ThemedText>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  form: {
    flex: 1,
  },
  formTitle: {
    marginBottom: Spacing.xl,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  googleIcon: {
    marginRight: Spacing.sm,
  },
  googleButtonText: {
    fontWeight: '500',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  appleIcon: {
    marginRight: Spacing.sm,
  },
  appleButtonText: {
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  button: {
    marginTop: Spacing.md,
  },
  switchButton: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
});
