import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LogoMark from '../components/LogoMark';
import { Colors } from '../theme/colors';

const ROLES = [
  { id: 'painter', label: 'Painter' },
  { id: 'pm',      label: 'Project Mgr' },
  { id: 'admin',   label: 'Admin' },
];

export default function SignInScreen({ navigation }) {
  const [role, setRole]         = useState('painter');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7,   useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      {/* Ambient bg glow */}
      <View style={styles.ambientGlow} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Logo row */}
          <View style={styles.logoRow}>
            <LogoMark size={32} borderRadius={9} />
            <Text style={styles.logoText}>
              Paint<Text style={styles.logoAccent}>Scan</Text>
            </Text>
          </View>

          <Text style={styles.headline}>Welcome{'\n'}Back.</Text>
          <Text style={styles.subText}>Sign in to access your paint specs</Text>

          {/* Role chips */}
          <View style={styles.roleRow}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.id}
                style={[styles.roleChip, role === r.id && styles.roleChipActive]}
                onPress={() => setRole(r.id)}
              >
                <Text style={[styles.roleChipText, role === r.id && styles.roleChipTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Email input */}
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={Colors.dim} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.dim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password input */}
          <View style={[styles.inputWrap, { marginTop: 12 }]}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.dim} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingRight: 44 }]}
              placeholder="Password"
              placeholderTextColor={Colors.dim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
              <Ionicons
                name={showPass ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={Colors.sub}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot */}
          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.replace('Main')}
          >
            <LinearGradient
              colors={['#E8C547', '#D4914A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryText}>SIGN IN</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity style={styles.btnGoogle}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.btnGoogleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>No account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Onboarding')}>
              <Text style={styles.registerLink}>Create one free</Text>
            </TouchableOpacity>
          </View>

          {/* Trust badges */}
          <View style={styles.trustRow}>
            {['SOC 2 Compliant', '256-bit Encrypted', 'Field Ready'].map(t => (
              <View key={t} style={styles.trustItem}>
                <View style={styles.trustDot} />
                <Text style={styles.trustText}>{t}</Text>
              </View>
            ))}
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  ambientGlow: {
    position: 'absolute', top: -60, left: '10%',
    width: '80%', height: 300,
    backgroundColor: 'rgba(232,197,71,0.07)',
    borderRadius: 200,
  },
  scroll: {
    paddingTop: 64,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  logoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 36,
  },
  logoText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22, letterSpacing: 1.2, color: Colors.text,
  },
  logoAccent: { color: Colors.gold },

  headline: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 44, letterSpacing: 1, color: Colors.text, lineHeight: 46, marginBottom: 8,
  },
  subText: {
    fontFamily: 'DMSans_300Light',
    fontSize: 13, color: Colors.sub, marginBottom: 32,
  },

  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  roleChip: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, alignItems: 'center',
  },
  roleChipActive: {
    backgroundColor: 'rgba(232,197,71,0.1)',
    borderColor: 'rgba(232,197,71,0.55)',
  },
  roleChipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12, color: Colors.sub, letterSpacing: 0.3,
  },
  roleChipTextActive: { color: Colors.gold },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1.5,
    borderColor: Colors.border, borderRadius: 12, height: 50,
  },
  inputIcon: { marginLeft: 14, marginRight: 4 },
  input: {
    flex: 1, height: 50, paddingHorizontal: 8,
    color: Colors.text, fontFamily: 'DMSans_400Regular', fontSize: 14,
  },
  eyeBtn: { padding: 14 },

  forgotRow: { alignItems: 'flex-end', marginBottom: 22, marginTop: 8 },
  forgotText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.sub },

  btnPrimary: {
    height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  btnPrimaryText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18, letterSpacing: 2, color: '#0A0B0D',
  },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11, color: Colors.dim, letterSpacing: 1,
  },

  btnGoogle: {
    height: 50, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  googleIcon: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18, color: Colors.gold, letterSpacing: 1,
  },
  btnGoogleText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14, color: Colors.subLight,
  },

  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.sub },
  registerLink: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.gold },

  trustRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 16,
    marginTop: 24, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: Colors.muted,
  },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trustDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.green },
  trustText: { fontFamily: 'DMSans_300Light', fontSize: 10, color: Colors.dim, letterSpacing: 0.5 },
});
