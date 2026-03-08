import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, Dimensions, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { Colors } from '../theme/colors';
import { PAINTS, QR_MAP } from '../data/paints';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = 220;

const SCAN_STATES = { IDLE: 'idle', SCANNING: 'scanning', FOUND: 'found', SHEET: 'sheet' };

// Demo paint record shown after scan
const DEMO_PAINT_ID = 1;

export default function ScannerScreen({ navigation }) {
  const [scanState, setScanState] = useState(SCAN_STATES.IDLE);
  const [torchOn, setTorchOn]     = useState(false);
  const [hasPerm, setHasPerm]     = useState(null);
  const [paintId, setPaintId]     = useState(DEMO_PAINT_ID);
  const [saved, setSaved]         = useState(false);

  const laserAnim   = useRef(new Animated.Value(0)).current;
  const flashAnim   = useRef(new Animated.Value(0)).current;
  const sheetAnim   = useRef(new Animated.Value(height)).current;
  const scanTimer   = useRef(null);
  const laserLoop   = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPerm(status === 'granted');
    })();
    return () => {
      clearTimeout(scanTimer.current);
      laserAnim.stopAnimation();
    };
  }, []);

  const startLaser = () => {
    laserAnim.setValue(0);
    laserLoop.current = Animated.loop(
      Animated.timing(laserAnim, { toValue: FRAME_SIZE - 12, duration: 1800, useNativeDriver: true })
    );
    laserLoop.current.start();
  };

  const stopLaser = () => {
    if (laserLoop.current) laserLoop.current.stop();
  };

  const triggerScan = () => {
    if (scanState !== SCAN_STATES.IDLE) return;
    setScanState(SCAN_STATES.SCANNING);
    startLaser();

    scanTimer.current = setTimeout(() => {
      stopLaser();
      // Flash
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 80,  useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
      setScanState(SCAN_STATES.FOUND);

      setTimeout(() => {
        setScanState(SCAN_STATES.SHEET);
        Animated.spring(sheetAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }).start();
      }, 600);
    }, 2400);
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, { toValue: height, duration: 320, useNativeDriver: true }).start(() => {
      setScanState(SCAN_STATES.IDLE);
      setSaved(false);
      sheetAnim.setValue(height);
    });
  };

  const reset = () => {
    clearTimeout(scanTimer.current);
    stopLaser();
    sheetAnim.setValue(height);
    setScanState(SCAN_STATES.IDLE);
    setSaved(false);
    flashAnim.setValue(0);
  };

  const handleBarCodeScanned = ({ data }) => {
    if (scanState !== SCAN_STATES.IDLE) return;
    const id = QR_MAP[data];
    if (id) {
      setPaintId(id);
      stopLaser();
      setScanState(SCAN_STATES.FOUND);
      setTimeout(() => {
        setScanState(SCAN_STATES.SHEET);
        Animated.spring(sheetAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }).start();
      }, 400);
    }
  };

  const paint = PAINTS.find(p => p.id === paintId) || PAINTS[0];
  const isScanning = scanState === SCAN_STATES.SCANNING;
  const isFound    = scanState === SCAN_STATES.FOUND || scanState === SCAN_STATES.SHEET;
  const bracketColor = isFound ? Colors.green : Colors.gold;

  const getLightness = (hex) => {
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return (r*.299+g*.587+b*.114)/255;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Camera or dark bg */}
      {hasPerm ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanState === SCAN_STATES.IDLE ? handleBarCodeScanned : undefined}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.darkBg]} />
      )}

      {/* Vignette */}
      <View style={styles.vignette} pointerEvents="none" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Scan QR Code</Text>
        <TouchableOpacity style={[styles.topBtn, torchOn && styles.topBtnActive]} onPress={() => setTorchOn(t => !t)}>
          <Ionicons name={torchOn ? 'flashlight' : 'flashlight-outline'} size={18} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </View>

      {/* Viewfinder */}
      <View style={styles.viewfinderWrap}>
        {/* Corner brackets */}
        {[['tl','top','left'],['tr','top','right'],['bl','bottom','left'],['br','bottom','right']].map(([k,v,h]) => (
          <View key={k} style={[styles.bracket, {
            [v]: 0, [h]: 0,
            borderTopWidth: ['tl','tr'].includes(k) ? 3 : 0,
            borderBottomWidth: ['bl','br'].includes(k) ? 3 : 0,
            borderLeftWidth: ['tl','bl'].includes(k) ? 3 : 0,
            borderRightWidth: ['tr','br'].includes(k) ? 3 : 0,
            borderColor: bracketColor,
            borderTopLeftRadius: k === 'tl' ? 4 : 0,
            borderTopRightRadius: k === 'tr' ? 4 : 0,
            borderBottomLeftRadius: k === 'bl' ? 4 : 0,
            borderBottomRightRadius: k === 'br' ? 4 : 0,
          }]} />
        ))}

        {/* Laser */}
        {isScanning && (
          <Animated.View style={[styles.laser, { transform: [{ translateY: laserAnim }] }]} />
        )}

        {/* Found indicator */}
        {isFound && (
          <View style={styles.foundLine} />
        )}
      </View>

      {/* Status text */}
      <View style={styles.statusWrap}>
        {scanState === SCAN_STATES.IDLE && (
          <>
            <Text style={styles.statusText}>Point camera at QR code</Text>
            <Text style={styles.statusSub}>Hold steady within the frame</Text>
          </>
        )}
        {isScanning && (
          <Text style={styles.statusText}>Scanning…</Text>
        )}
        {isFound && (
          <View style={styles.foundRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
            <Text style={[styles.statusText, { color: Colors.green }]}>QR Code Detected</Text>
          </View>
        )}
      </View>

      {/* Location pill */}
      {scanState !== SCAN_STATES.SHEET && (
        <View style={styles.locationPill}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText}>Westfield Tower B · Lobby L1</Text>
        </View>
      )}

      {/* Flash overlay */}
      <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} pointerEvents="none" />

      {/* Idle tap button */}
      {scanState === SCAN_STATES.IDLE && (
        <View style={styles.fabWrap}>
          <TouchableOpacity onPress={triggerScan} activeOpacity={0.85}>
            <LinearGradient
              colors={['#E8C547', '#D4914A']}
              style={styles.fab}
            >
              <Ionicons name="qr-code-outline" size={28} color="#0A0B0D" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.fabLabel}>TAP TO SCAN</Text>
        </View>
      )}

      {/* Bottom sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
        <View style={styles.sheetHandle}><View style={styles.handleBar} /></View>

        {/* Sheet header */}
        <View style={styles.sheetHeader}>
          <View style={styles.foundBadgeRow}>
            <View style={styles.foundBadge}>
              <View style={styles.foundBadgeDot} />
              <Text style={styles.foundBadgeText}>MATCHED</Text>
            </View>
            <Text style={styles.sheetLoc}>📍 {paint.locations[0]?.zone}</Text>
          </View>
          <View style={styles.paintRow}>
            <View style={[styles.sheetSwatch, { backgroundColor: paint.hex }]}>
              <Text style={[styles.swatchLrv, { color: getLightness(paint.hex) > 0.55 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' }]}>
                LRV {paint.lrv}
              </Text>
            </View>
            <View style={styles.paintMeta}>
              <Text style={styles.paintBrandLine}>{paint.brand} · {paint.line}</Text>
              <Text style={styles.paintName}>{paint.name}</Text>
              <View style={styles.codeRow}>
                <View style={styles.codePill}><Text style={styles.codePillText}>{paint.code}</Text></View>
                <Text style={styles.sheenText}>{paint.sheen}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sheet scroll body */}
        <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
          {/* Spec grid */}
          <View style={styles.specGrid}>
            {[
              { label: 'VOC Content',   val: paint.voc        },
              { label: 'Tint Base',     val: paint.tintBase   },
              { label: 'Coverage',      val: paint.coverage   },
              { label: 'Coats',         val: paint.coats + ' coats' },
              { label: 'Touch Dry',     val: paint.dryTime    },
              { label: 'Recoat Window', val: paint.recoat     },
            ].map(s => (
              <View key={s.label} style={styles.specCard}>
                <Text style={styles.specLabel}>{s.label}</Text>
                <Text style={styles.specVal}>{s.val}</Text>
              </View>
            ))}
          </View>

          {/* Formula */}
          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>COLORANT FORMULA</Text>
            {paint.formula.map((f, i) => (
              <View key={i} style={[styles.formulaRow, i === paint.formula.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.formulaSwatch, { backgroundColor: f.hex }]} />
                <Text style={styles.formulaName}>{f.colorant}</Text>
                <Text style={styles.formulaUnits}>{f.oz}</Text>
              </View>
            ))}
          </View>

          {/* App notes */}
          {[
            { icon: '🖌️', label: 'Method', val: paint.method },
            { icon: '🧱', label: 'Surfaces', val: paint.surfaces },
            { icon: '📐', label: 'Building', val: paint.locations[0]?.building },
          ].map(a => (
            <View key={a.label} style={styles.appRow}>
              <Text style={styles.appIcon}>{a.icon}</Text>
              <View>
                <Text style={styles.appLabel}>{a.label}</Text>
                <Text style={styles.appVal}>{a.val}</Text>
              </View>
            </View>
          ))}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Sheet CTA */}
        <View style={styles.sheetCTA}>
          <TouchableOpacity style={styles.ctaShare}>
            <Ionicons name="share-outline" size={16} color={Colors.sub} />
            <Text style={styles.ctaShareText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 2 }}
            activeOpacity={0.85}
            onPress={() => {
              setSaved(true);
              setTimeout(() => navigation.navigate('PaintDetail', { paintId: paint.id }), 800);
            }}
          >
            <LinearGradient
              colors={saved ? [Colors.green, Colors.teal] : ['#E8C547', '#D4914A']}
              style={styles.ctaSave}
            >
              <Text style={styles.ctaSaveText}>{saved ? '✓ SAVED' : 'VIEW FULL SPEC →'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Close button */}
        <TouchableOpacity style={styles.sheetClose} onPress={closeSheet}>
          <Ionicons name="close" size={18} color={Colors.sub} />
        </TouchableOpacity>
      </Animated.View>

      {/* Reset button (dev) */}
      {scanState !== SCAN_STATES.IDLE && scanState !== SCAN_STATES.SHEET && (
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Text style={styles.resetText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  darkBg: { backgroundColor: '#0D0F14' },
  vignette: {
    position: 'absolute', inset: 0,
    backgroundColor: 'transparent',
    // semi-transparent edges handled via gradient in prod
  },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  topBtnActive: { backgroundColor: 'rgba(232,197,71,0.25)', borderColor: 'rgba(232,197,71,0.45)' },
  topTitle: { fontFamily: 'BebasNeue_400Regular', fontSize: 20, letterSpacing: 1.5, color: 'rgba(255,255,255,0.9)' },

  viewfinderWrap: {
    position: 'absolute',
    width: FRAME_SIZE, height: FRAME_SIZE,
    top: '50%', left: '50%',
    marginTop: -(FRAME_SIZE / 2) - 50,
    marginLeft: -(FRAME_SIZE / 2),
  },
  bracket: { position: 'absolute', width: 28, height: 28 },
  laser: {
    position: 'absolute', left: 4, right: 4, height: 2,
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6, elevation: 4,
  },
  foundLine: {
    position: 'absolute', left: 4, right: 4, height: 2,
    top: '50%', marginTop: -1,
    backgroundColor: Colors.green,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 8, elevation: 4,
  },

  statusWrap: {
    position: 'absolute', top: '50%', left: 0, right: 0,
    marginTop: FRAME_SIZE / 2 - 28,
    alignItems: 'center',
  },
  statusText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, marginTop: 14 },
  statusSub: { fontFamily: 'DMSans_300Light', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 },
  foundRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },

  locationPill: {
    position: 'absolute', bottom: 180, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(10,11,13,0.7)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  locationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  locationText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)' },

  flashOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: 'rgba(124,184,124,0.2)',
  },

  fabWrap: { position: 'absolute', bottom: 110, alignSelf: 'center', alignItems: 'center', gap: 10 },
  fab: {
    width: 72, height: 72, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.gold, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 20, elevation: 10,
  },
  fabLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5 },

  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: Colors.border,
    maxHeight: height * 0.75,
  },
  sheetHandle: { paddingTop: 14, alignItems: 'center' },
  handleBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  sheetClose: { position: 'absolute', top: 14, right: 16, padding: 6 },

  sheetHeader: { padding: 16, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  foundBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  foundBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    backgroundColor: 'rgba(124,184,124,0.12)', borderWidth: 1, borderColor: 'rgba(124,184,124,0.25)',
  },
  foundBadgeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.green },
  foundBadgeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 10, color: Colors.green, letterSpacing: 0.8 },
  sheetLoc: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.sub, marginLeft: 'auto' },

  paintRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  sheetSwatch: { width: 64, height: 64, borderRadius: 16, justifyContent: 'flex-end', padding: 5, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
  swatchLrv: { fontFamily: 'DMSans_600SemiBold', fontSize: 9, letterSpacing: 0.4 },
  paintMeta: { flex: 1 },
  paintBrandLine: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.sub, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  paintName: { fontFamily: 'BebasNeue_400Regular', fontSize: 28, letterSpacing: 1, color: Colors.text, lineHeight: 30, marginBottom: 5 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codePill: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
    backgroundColor: Colors.goldDim, borderWidth: 1, borderColor: 'rgba(232,197,71,0.25)',
  },
  codePillText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: Colors.gold, letterSpacing: 0.5 },
  sheenText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.sub },

  sheetBody: { paddingHorizontal: 16 },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 14 },
  specCard: {
    width: '47%', backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12,
  },
  specLabel: { fontFamily: 'DMSans_400Regular', fontSize: 9.5, color: Colors.sub, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  specVal: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: Colors.text, lineHeight: 18 },

  formulaCard: {
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, overflow: 'hidden', marginBottom: 12,
  },
  formulaTitle: { fontFamily: 'DMSans_500Medium', fontSize: 10, color: Colors.sub, letterSpacing: 1.2, padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  formulaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  formulaSwatch: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  formulaName: { fontFamily: 'DMSans_400Regular', flex: 1, fontSize: 12, color: Colors.text },
  formulaUnits: { fontFamily: 'DMSans_700Bold', fontSize: 13, color: Colors.gold, minWidth: 42, textAlign: 'right' },

  appRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  appIcon: { fontSize: 16, marginTop: 2 },
  appLabel: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.sub, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 2 },
  appVal: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: Colors.text, lineHeight: 18 },

  sheetCTA: {
    flexDirection: 'row', gap: 10,
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  ctaShare: {
    flex: 1, height: 50, borderRadius: 14,
    backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  ctaShareText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: Colors.sub },
  ctaSave: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctaSaveText: { fontFamily: 'BebasNeue_400Regular', fontSize: 17, letterSpacing: 1.5, color: '#0A0B0D' },

  resetBtn: {
    position: 'absolute', top: 100, right: 20,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  resetText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
});
