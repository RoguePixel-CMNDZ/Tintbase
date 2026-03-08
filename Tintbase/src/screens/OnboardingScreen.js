import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Switch, TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LogoMark from '../components/LogoMark';
import { Colors } from '../theme/colors';

const ROLES = [
  { id: 'painter', icon: '🖌️', name: 'Painter',         desc: 'Scan QR codes, view full paint specs in the field' },
  { id: 'pm',      icon: '📋', name: 'Project Manager', desc: 'Assign paint records to zones, manage crews' },
  { id: 'admin',   icon: '⚙️', name: 'Admin',           desc: 'Create QR codes, manage paint library & users' },
];
const SIZES  = ['1–5', '6–15', '16–50', '51–100', '100+'];
const STATES = ['AL','AK','AZ','CA','CO','CT','FL','GA','IL','MA','MD','MI','MN','NV','NJ','NY','NC','OH','OR','PA','TX','UT','VA','WA'];
const PERMS  = [
  { id: 'camera',   icon: '📷', bg: 'rgba(232,197,71,0.12)',  name: 'Camera',           why: 'Required to scan QR codes on job sites' },
  { id: 'location', icon: '📍', bg: 'rgba(108,142,191,0.12)', name: 'Location',         why: 'Tags scans to the correct building zone' },
  { id: 'notifs',   icon: '🔔', bg: 'rgba(155,127,202,0.12)', name: 'Notifications',    why: 'Alerts when paint records are updated' },
  { id: 'offline',  icon: '💾', bg: 'rgba(124,184,124,0.12)', name: 'Offline Storage',  why: 'Cache recent scans for dead-zone use' },
];
const STEP_LABELS = ['Your Role', 'Company', 'Permissions'];

export default function OnboardingScreen({ navigation }) {
  const [step, setStep]         = useState(0);
  const [role, setRole]         = useState('painter');
  const [company, setCompany]   = useState('');
  const [crewSize, setCrewSize] = useState('6–15');
  const [selStates, setSelStates] = useState(['CA', 'TX']);
  const [perms, setPerms]       = useState({ camera: true, location: true, notifs: false, offline: true });
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateStep = (dir) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: dir * -30, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir * 30,  duration: 0,   useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
    ]).start();
  };

  const goNext = () => {
    if (step < 2) { animateStep(1); setStep(s => s + 1); }
    else { navigation.replace('Main'); }
  };
  const goBack = () => {
    if (step > 0) { animateStep(-1); setStep(s => s - 1); }
  };

  const canNext = [!!role, company.trim().length > 1, true][step];

  const toggleState = (s) =>
    setSelStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <LogoMark size={28} borderRadius={8} />
          <Text style={styles.logoText}>Paint<Text style={styles.logoAccent}>Scan</Text></Text>
        </View>
        <TouchableOpacity onPress={() => navigation.replace('Main')}>
          <Text style={styles.skipText}>Skip →</Text>
        </TouchableOpacity>
      </View>

      {/* Step progress */}
      <View style={styles.progressWrap}>
        <View style={styles.stepsRow}>
          {STEP_LABELS.map((lbl, i) => (
            <React.Fragment key={i}>
              <View style={[styles.stepCircle, i < step && styles.stepDone, i === step && styles.stepActive]}>
                {i < step
                  ? <Ionicons name="checkmark" size={12} color={Colors.gold} />
                  : <Text style={[styles.stepNum, i === step && styles.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              {i < STEP_LABELS.length - 1 && (
                <View style={[styles.stepLine, i < step && styles.stepLineDone]} />
              )}
            </React.Fragment>
          ))}
        </View>
        <View style={styles.stepLabelsRow}>
          {STEP_LABELS.map((lbl, i) => (
            <Text key={i} style={[styles.stepLabel, i === step && styles.stepLabelActive, i < step && styles.stepLabelDone]}>
              {lbl}
            </Text>
          ))}
        </View>
      </View>

      {/* Slide content */}
      <Animated.View style={[styles.slideWrap, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.slideContent}>

          {/* ── STEP 0: Role ── */}
          {step === 0 && (
            <>
              <Text style={styles.stepTag}>STEP 1 OF 3</Text>
              <Text style={styles.headline}>What's your{'\n'}role on site?</Text>
              <Text style={styles.subText}>We'll tailor your experience to how you work in the field.</Text>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleCard, role === r.id && styles.roleCardActive]}
                  onPress={() => setRole(r.id)}
                >
                  <View style={[styles.roleIcon, { backgroundColor: role === r.id ? 'rgba(232,197,71,0.15)' : Colors.muted }]}>
                    <Text style={styles.roleIconText}>{r.icon}</Text>
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleName}>{r.name}</Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </View>
                  <View style={[styles.roleCheck, role === r.id && styles.roleCheckActive]}>
                    {role === r.id && <Text style={styles.roleCheckMark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* ── STEP 1: Company ── */}
          {step === 1 && (
            <>
              <Text style={styles.stepTag}>STEP 2 OF 3</Text>
              <Text style={styles.headline}>Tell us about{'\n'}your crew.</Text>
              <Text style={styles.subText}>Helps us configure state-specific compliance rules.</Text>

              <Text style={styles.fieldLabel}>COMPANY NAME</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>🏢</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Apex Commercial Painting"
                  placeholderTextColor={Colors.dim}
                  value={company}
                  onChangeText={setCompany}
                />
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>CREW SIZE</Text>
              <View style={styles.pillRow}>
                {SIZES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.pill, crewSize === s && styles.pillActive]}
                    onPress={() => setCrewSize(s)}
                  >
                    <Text style={[styles.pillText, crewSize === s && styles.pillTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>STATES YOU OPERATE IN</Text>
              <View style={styles.statesWrap}>
                {STATES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.stateChip, selStates.includes(s) && styles.stateChipActive]}
                    onPress={() => toggleState(s)}
                  >
                    <Text style={[styles.stateText, selStates.includes(s) && styles.stateTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ── STEP 2: Permissions ── */}
          {step === 2 && (
            <>
              <Text style={styles.stepTag}>STEP 3 OF 3</Text>
              <Text style={styles.headline}>Enable key{'\n'}permissions.</Text>
              <Text style={styles.subText}>Camera access is required to scan QR codes in the field.</Text>
              {PERMS.map(p => (
                <View key={p.id} style={styles.permCard}>
                  <View style={[styles.permIcon, { backgroundColor: p.bg }]}>
                    <Text style={styles.permIconText}>{p.icon}</Text>
                  </View>
                  <View style={styles.permInfo}>
                    <Text style={styles.permName}>{p.name}</Text>
                    <Text style={styles.permWhy}>{p.why}</Text>
                  </View>
                  <Switch
                    value={perms[p.id]}
                    onValueChange={v => setPerms(prev => ({ ...prev, [p.id]: v }))}
                    trackColor={{ false: Colors.muted, true: Colors.gold }}
                    thumbColor="#fff"
                  />
                </View>
              ))}
              <View style={styles.permNote}>
                <Text style={styles.permNoteText}>
                  🔒 Permissions are only used within Tintbase. Change them anytime in Settings.
                </Text>
              </View>
            </>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.ctaRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.btnBack} onPress={goBack}>
              <Ionicons name="arrow-back" size={20} color={Colors.sub} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={goNext}
            disabled={!canNext}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canNext ? ['#E8C547', '#D4914A'] : ['#2A2D35', '#2A2D35']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.btnNext}
            >
              <Text style={[styles.btnNextText, !canNext && { color: Colors.sub }]}>
                {step === 2 ? 'GET STARTED →' : 'CONTINUE →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 0,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontFamily: 'BebasNeue_400Regular', fontSize: 18, letterSpacing: 1, color: Colors.text },
  logoAccent: { color: Colors.gold },
  skipText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.dim },

  progressWrap: { paddingHorizontal: 24, paddingTop: 20 },
  stepsRow: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDone: { backgroundColor: Colors.goldDim, borderColor: 'rgba(232,197,71,0.5)' },
  stepActive: {
    backgroundColor: Colors.gold, borderColor: 'transparent',
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  stepNum: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: Colors.sub },
  stepNumActive: { color: '#0A0B0D' },
  stepLine: { flex: 1, height: 1.5, backgroundColor: Colors.border, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: 'rgba(232,197,71,0.5)' },
  stepLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  stepLabel: { fontFamily: 'DMSans_400Regular', fontSize: 9.5, color: Colors.dim, letterSpacing: 0.7, flex: 1, textAlign: 'center' },
  stepLabelActive: { color: Colors.gold },
  stepLabelDone: { color: Colors.sub },

  slideWrap: { flex: 1 },
  slideContent: { paddingHorizontal: 24, paddingTop: 24 },

  stepTag: { fontFamily: 'DMSans_500Medium', fontSize: 10, letterSpacing: 2, color: Colors.gold, marginBottom: 10 },
  headline: { fontFamily: 'BebasNeue_400Regular', fontSize: 36, letterSpacing: 1, color: Colors.text, lineHeight: 38, marginBottom: 8 },
  subText: { fontFamily: 'DMSans_300Light', fontSize: 13, color: Colors.sub, marginBottom: 28, lineHeight: 20 },

  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, marginBottom: 10,
  },
  roleCardActive: { borderColor: 'rgba(232,197,71,0.6)', backgroundColor: 'rgba(232,197,71,0.06)' },
  roleIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  roleIconText: { fontSize: 20 },
  roleInfo: { flex: 1 },
  roleName: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: Colors.text, marginBottom: 2 },
  roleDesc: { fontFamily: 'DMSans_300Light', fontSize: 11, color: Colors.sub, lineHeight: 16 },
  roleCheck: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  roleCheckActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  roleCheckMark: { color: '#0A0B0D', fontSize: 10, fontWeight: '700' },

  fieldLabel: { fontFamily: 'DMSans_500Medium', fontSize: 10, letterSpacing: 1.5, color: Colors.sub, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1.5,
    borderColor: Colors.border, borderRadius: 12, height: 50,
  },
  inputIcon: { marginLeft: 14, fontSize: 16 },
  input: { flex: 1, height: 50, paddingHorizontal: 10, color: Colors.text, fontFamily: 'DMSans_400Regular', fontSize: 14 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  pillActive: { borderColor: 'rgba(232,197,71,0.6)', backgroundColor: 'rgba(232,197,71,0.1)' },
  pillText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.sub },
  pillTextActive: { color: Colors.gold },

  statesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  stateChip: {
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  stateChipActive: { borderColor: 'rgba(108,142,191,0.5)', backgroundColor: 'rgba(108,142,191,0.1)' },
  stateText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.sub },
  stateTextActive: { color: Colors.blue },

  permCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, marginBottom: 10,
  },
  permIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  permIconText: { fontSize: 18 },
  permInfo: { flex: 1 },
  permName: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.text, marginBottom: 2 },
  permWhy: { fontFamily: 'DMSans_300Light', fontSize: 11, color: Colors.sub, lineHeight: 15 },
  permNote: {
    padding: 12, borderRadius: 10, marginTop: 4,
    backgroundColor: 'rgba(124,184,124,0.08)',
    borderWidth: 1, borderColor: 'rgba(124,184,124,0.2)',
  },
  permNoteText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.green, lineHeight: 18 },

  bottomBar: { paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12 },
  ctaRow: { flexDirection: 'row', gap: 10 },
  btnBack: {
    width: 52, height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  btnNext: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnNextText: { fontFamily: 'BebasNeue_400Regular', fontSize: 18, letterSpacing: 2, color: '#0A0B0D' },
});
