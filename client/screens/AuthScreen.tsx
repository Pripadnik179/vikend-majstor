import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, Image, Platform, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { MailIcon, AppleIcon, EyeIcon, EyeOffIcon, ShieldIcon, LockIcon, CheckIcon } from '@/components/icons/TabBarIcons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { FeaturePreview } from '@/components/FeaturePreview';
import { SocialProof } from '@/components/SocialProof';
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useWebLayout } from '@/hooks/useWebLayout';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { apiRequest, ApiError } from '@/lib/query-client';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = '45722118252-g4la4n5j2ne1hlb8idmk11mb0brph55f.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

const isGoogleConfigured = true;

let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;
if (Platform.OS === 'ios') {
  AppleAuthentication = require('expo-apple-authentication');
}

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { login, register, loginWithGoogle, loginWithApple, resendVerificationEmail } = useAuth();
  const { isDesktop, isTablet } = useWebLayout();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{name?: string; email?: string; password?: string; confirmPassword?: string}>({});

  const handleGoogleTokenReceived = useCallback(async (accessToken: string) => {
    console.log('[Google Auth] Processing token...');
    try {
      const result = await loginWithGoogle(accessToken);
      console.log('[Google Auth] Login successful!', result);
      if (result.isNewUser && result.emailVerificationSent) {
        setSuccessMessage('Dobrodosli! Poslali smo vam email za potvrdu. Molimo proverite inbox.');
      }
    } catch (error: any) {
      console.error('[Google Auth] Login failed:', error);
      setErrorMessage(error.message || 'Greska pri Google prijavi');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [loginWithGoogle]);

  useEffect(() => {
    if (Platform.OS === 'ios' && AppleAuthentication) {
      AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    console.log('[Google Auth] Setting up message listener and storage check...');

    const handleMessage = (event: MessageEvent) => {
      console.log('[Google Auth] Received message:', event.data?.type);
      if (event.data?.type === 'google-auth-success' && event.data?.accessToken) {
        console.log('[Google Auth] Got access token via postMessage');
        handleGoogleTokenReceived(event.data.accessToken);
      } else if (event.data?.type === 'google-auth-error') {
        console.log('[Google Auth] Got error:', event.data?.error);
        setIsGoogleLoading(false);
        setErrorMessage(event.data?.error || 'Greska pri Google prijavi');
      }
    };

    // Also check localStorage as fallback (for cross-origin cases)
    const checkLocalStorage = () => {
      try {
        const token = localStorage.getItem('google_auth_token');
        if (token) {
          console.log('[Google Auth] Found token in localStorage');
          localStorage.removeItem('google_auth_token');
          handleGoogleTokenReceived(token);
        }
        const error = localStorage.getItem('google_auth_error');
        if (error) {
          console.log('[Google Auth] Found error in localStorage:', error);
          localStorage.removeItem('google_auth_error');
          setIsGoogleLoading(false);
          setErrorMessage(error);
        }
      } catch (e) {
        // localStorage might not be available
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Check localStorage periodically for fallback
    const storageInterval = setInterval(checkLocalStorage, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(storageInterval);
    };
  }, [handleGoogleTokenReceived]);

  const validateFields = (): boolean => {
    const errors: typeof fieldErrors = {};
    
    if (!isLogin && !name.trim()) {
      errors.name = 'Ime je obavezno';
    } else if (!isLogin && name.trim().length < 2) {
      errors.name = 'Ime mora imati najmanje 2 karaktera';
    }
    
    if (!email.trim()) {
      errors.email = 'Email je obavezan';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Unesite ispravan email format';
    }
    
    if (!password) {
      errors.password = 'Lozinka je obavezna';
    } else if (!isLogin && password.length < 6) {
      errors.password = 'Lozinka mora imati najmanje 6 karaktera';
    }
    
    if (!isLogin) {
      if (!confirmPassword) {
        errors.confirmPassword = 'Potvrdite lozinku';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Lozinke se ne poklapaju';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    console.log('[Google Auth] Starting sign in, isGoogleConfigured:', isGoogleConfigured, 'clientId:', GOOGLE_WEB_CLIENT_ID);
    
    if (!isGoogleConfigured || !GOOGLE_WEB_CLIENT_ID) {
      setErrorMessage('Google prijava nije konfigurisana. Kontaktirajte podršku.');
      return;
    }
    
    setIsGoogleLoading(true);
    setErrorMessage(null);
    
    if (Platform.OS === 'web') {
      const redirectUri = window.location.origin + '/auth/google/callback';
      const scope = encodeURIComponent('openid profile email');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_WEB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}&prompt=select_account`;
      
      console.log('[Google Auth] Opening popup with redirect:', redirectUri);
      
      const width = 500;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        authUrl,
        'googleAuth',
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
      );
      
      if (!popup) {
        setIsGoogleLoading(false);
        setErrorMessage('Popup blokiran. Molimo dozvolite popup prozore za ovu stranicu i pokušajte ponovo.');
        console.log('[Google Auth] Popup was blocked');
        return;
      }
      
      console.log('[Google Auth] Popup opened successfully');
      
      // Check if popup was closed without completing auth
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsGoogleLoading(false);
          console.log('[Google Auth] Popup was closed');
        }
      }, 1000);
      
      // Cleanup interval after 5 minutes max
      setTimeout(() => {
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
        }
        setIsGoogleLoading(false);
      }, 300000);
    } else {
      setIsGoogleLoading(false);
      Alert.alert('Info', 'Google prijava je dostupna samo na web platformi');
    }
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
        const result = await loginWithApple(credential.identityToken, credential.fullName ? {
          givenName: credential.fullName.givenName ?? undefined,
          familyName: credential.fullName.familyName ?? undefined,
        } : null);
        if (result.isNewUser && result.emailVerificationSent) {
          setSuccessMessage('Dobrodosli! Poslali smo vam email za potvrdu. Molimo proverite inbox.');
        }
      } else {
        Alert.alert('Greska', 'Nije moguce dobiti Apple token');
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      Alert.alert('Greska', error.message || 'Greska pri Apple prijavi');
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Greska', 'Unesite email adresu');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      await apiRequest('POST', '/api/auth/forgot-password', { email });
      Alert.alert(
        'Email poslat',
        'Ako nalog sa ovom email adresom postoji, poslali smo vam link za resetovanje lozinke.',
        [{ text: 'OK', onPress: () => setIsForgotPassword(false) }]
      );
    } catch (error: any) {
      Alert.alert(
        'Email poslat',
        'Ako nalog sa ovom email adresom postoji, poslali smo vam link za resetovanje lozinke.'
      );
      setIsForgotPassword(false);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setUnverifiedEmail(null);
    setFieldErrors({});
    
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('[Auth] Starting', isLogin ? 'login' : 'register', 'for:', email);
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      console.log('[Auth] Success');
    } catch (error: any) {
      console.log('[Auth] Error:', error?.message || error, 'Code:', error?.code);
      
      if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(email);
        setErrorMessage('Morate potvrditi email adresu pre prijave.');
      } else {
        const msg = error?.message || 'Doslo je do greske pri prijavi';
        setErrorMessage(msg);
        if (Platform.OS !== 'web') {
          Alert.alert('Greska', msg);
        }
      }
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    setResendingVerification(true);
    try {
      const success = await resendVerificationEmail(unverifiedEmail);
      if (success) {
        setSuccessMessage('Verifikacioni email je poslat. Proverite inbox.');
        setUnverifiedEmail(null);
      } else {
        setErrorMessage('Greska pri slanju emaila. Pokusajte ponovo.');
      }
    } catch (error) {
      setErrorMessage('Greska pri slanju emaila. Pokusajte ponovo.');
    } finally {
      setResendingVerification(false);
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
        { 
          paddingTop: insets.top + Spacing['3xl'], 
          paddingBottom: insets.bottom + Spacing.xl,
          justifyContent: (isDesktop || isTablet) ? 'center' : 'flex-start',
          minHeight: (isDesktop || isTablet) ? '100%' : undefined,
        },
      ]}
    >
      <ResponsiveContainer maxWidth="form" style={styles.responsiveWrapper}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={[styles.logo, (isDesktop || isTablet) && styles.logoLarge]}
            resizeMode="contain"
          />
          <ThemedText type="h1" style={styles.title}>VikendMajstor</ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Iznajmi alat od komsije
          </ThemedText>
        </View>

        <SocialProof />

        <FeaturePreview />

        <TestimonialsCarousel compact />

        <View style={[styles.form, (isDesktop || isTablet) && styles.formDesktop]}>
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
          <View style={styles.fieldGroup}>
            <TextInput
              style={[inputStyle, fieldErrors.name ? styles.inputError : null]}
              placeholder="Ime i prezime"
              placeholderTextColor={theme.textTertiary}
              value={name}
              onChangeText={(text) => { setName(text); setFieldErrors(prev => ({ ...prev, name: undefined })); }}
              autoCapitalize="words"
            />
            {fieldErrors.name ? (
              <ThemedText type="small" style={styles.fieldError}>{fieldErrors.name}</ThemedText>
            ) : null}
          </View>
        )}

        <View style={styles.fieldGroup}>
          <TextInput
            style={[inputStyle, fieldErrors.email ? styles.inputError : null]}
            placeholder="Email"
            placeholderTextColor={theme.textTertiary}
            value={email}
            onChangeText={(text) => { setEmail(text); setFieldErrors(prev => ({ ...prev, email: undefined })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {fieldErrors.email ? (
            <ThemedText type="small" style={styles.fieldError}>{fieldErrors.email}</ThemedText>
          ) : null}
        </View>

        {isForgotPassword ? (
          <>
            <Button onPress={handleForgotPassword} disabled={forgotPasswordLoading} style={styles.button}>
              {forgotPasswordLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                'Posalji link za resetovanje'
              )}
            </Button>
            <Pressable onPress={() => setIsForgotPassword(false)} style={styles.switchButton}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Nazad na{' '}
                <ThemedText type="link">prijavu</ThemedText>
              </ThemedText>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.fieldGroup}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[inputStyle, styles.passwordInput, fieldErrors.password ? styles.inputError : null]}
                  placeholder="Lozinka"
                  placeholderTextColor={theme.textTertiary}
                  value={password}
                  onChangeText={(text) => { setPassword(text); setFieldErrors(prev => ({ ...prev, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon size={22} color={theme.textSecondary} />
                  ) : (
                    <EyeIcon size={22} color={theme.textSecondary} />
                  )}
                </Pressable>
              </View>
              {fieldErrors.password ? (
                <ThemedText type="small" style={styles.fieldError}>{fieldErrors.password}</ThemedText>
              ) : !isLogin ? (
                <ThemedText type="small" style={[styles.fieldHint, { color: theme.textTertiary }]}>
                  Lozinka mora imati najmanje 6 karaktera
                </ThemedText>
              ) : null}
            </View>

            {!isLogin && (
              <View style={styles.fieldGroup}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[inputStyle, styles.passwordInput, fieldErrors.confirmPassword ? styles.inputError : null]}
                    placeholder="Potvrda lozinke"
                    placeholderTextColor={theme.textTertiary}
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); setFieldErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="password"
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon size={22} color={theme.textSecondary} />
                    ) : (
                      <EyeIcon size={22} color={theme.textSecondary} />
                    )}
                  </Pressable>
                </View>
                {fieldErrors.confirmPassword ? (
                  <ThemedText type="small" style={styles.fieldError}>{fieldErrors.confirmPassword}</ThemedText>
                ) : confirmPassword && password === confirmPassword ? (
                  <View style={styles.matchIndicator}>
                    <CheckIcon size={14} color={Colors.light.success} />
                    <ThemedText type="small" style={[styles.fieldSuccess, { color: Colors.light.success }]}>
                      Lozinke se poklapaju
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            )}

            {isLogin ? (
              <View style={styles.loginOptions}>
                <View style={styles.rememberMeContainer}>
                  <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{ false: theme.border, true: Colors.light.cta }}
                    thumbColor={rememberMe ? '#FFFFFF' : '#f4f3f4'}
                    style={styles.rememberMeSwitch}
                  />
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Zapamti me
                  </ThemedText>
                </View>
                <Pressable onPress={() => setIsForgotPassword(true)}>
                  <ThemedText type="small" style={{ color: Colors.light.cta }}>
                    Zaboravili ste lozinku?
                  </ThemedText>
                </Pressable>
              </View>
            ) : null}

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <ThemedText type="small" style={styles.errorText}>
                  {errorMessage}
                </ThemedText>
                {unverifiedEmail ? (
                  <Pressable 
                    onPress={handleResendVerification} 
                    disabled={resendingVerification}
                    style={styles.resendButton}
                  >
                    {resendingVerification ? (
                      <ActivityIndicator size="small" color={Colors.light.cta} />
                    ) : (
                      <ThemedText type="small" style={{ color: Colors.light.cta, fontWeight: '600' }}>
                        Posalji ponovo verifikacioni email
                      </ThemedText>
                    )}
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successContainer}>
                <ThemedText type="small" style={styles.successText}>
                  {successMessage}
                </ThemedText>
              </View>
            ) : null}

            <Button onPress={handleSubmit} disabled={isLoading} style={styles.button}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                isLogin ? 'Prijavi se' : 'Registruj se'
              )}
            </Button>

            <View style={styles.trustBadges}>
              <View style={[styles.trustBadge, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)' }]}>
                <ShieldIcon size={14} color={Colors.light.success} />
                <ThemedText type="small" style={{ color: Colors.light.success, marginLeft: 4 }}>
                  Bezbedno - scrypt enkripcija
                </ThemedText>
              </View>
              <View style={[styles.trustBadge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
                <LockIcon size={14} color={Colors.light.trust} />
                <ThemedText type="small" style={{ color: Colors.light.trust, marginLeft: 4 }}>
                  Email verifikacija
                </ThemedText>
              </View>
            </View>

            <Pressable onPress={() => { setIsLogin(!isLogin); setErrorMessage(null); setFieldErrors({}); }} style={styles.switchButton}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {isLogin ? 'Nemas nalog? ' : 'Vec imas nalog? '}
                <ThemedText type="link">
                  {isLogin ? 'Registruj se' : 'Prijavi se'}
                </ThemedText>
              </ThemedText>
            </Pressable>
          </>
        )}
        </View>
      </ResponsiveContainer>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  responsiveWrapper: {
    flexGrow: 0,
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
  logoLarge: {
    width: 120,
    height: 120,
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
  formDesktop: {
    flex: 0,
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
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  fieldError: {
    color: Colors.light.error,
    marginTop: 4,
    marginLeft: 4,
  },
  fieldHint: {
    marginTop: 4,
    marginLeft: 4,
  },
  fieldSuccess: {
    marginLeft: 4,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    marginTop: Spacing.md,
  },
  switchButton: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeSwitch: {
    marginRight: Spacing.sm,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: {
    color: '#22C55E',
    textAlign: 'center',
  },
  resendButton: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
});
