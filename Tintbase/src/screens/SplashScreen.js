import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const logoScale   = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY       = useRef(new Animated.Value(16)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const barWidth    = useRef(new Animated.Value(0)).current;
  const versionOp   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo pop
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Wordmark
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(textY, { toValue: 0, friction: 7, useNativeDriver: true }),
      ]),
      // Tagline
      Animated.delay(50),
      Animated.timing(tagOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      // Progress bar
      Animated.delay(100),
      Animated.timing(barWidth, { toValue: 120, duration: 1600, useNativeDriver: false }),
    ]).start();

    Animated.timing(versionOp, { toValue: 1, duration: 400, delay: 1600, useNativeDriver: true }).start();

    // Navigate after animation
    const timer = setTimeout(() => {
      navigation.replace('SignIn');
    }, 3400);
    return () => clearTimeout(timer);
  }, []);

  const pattern = [1, 0, 1, 0, 1, 0, 1, 0, 1];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Grid background */}
      <View style={styles.gridBg} pointerEvents="none" />

      {/* Ambient glow */}
      <View style={styles.glow} pointerEvents="none" />

      {/* Logo mark */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <LinearGradient
          colors={['#E8C547', '#D4914A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoMark}
        >
          <View style={styles.logoGrid}>
            {pattern.map((v, i) => (
              <View
                key={i}
                style={[
                  styles.logoCell,
                  { backgroundColor: v ? 'rgba(10,11,13,0.85)' : 'rgba(255,255,255,0.9)' },
                ]}
              />
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Wordmark */}
      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}>
        <Text style={styles.wordmark}>
          {'PAINT'}
          <Text style={styles.wordmarkAccent}>{'SCAN'}</Text>
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        COLOR INTELLIGENCE · FIELD READY
      </Animated.Text>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: barWidth }]} />
      </View>

      {/* Version */}
      <Animated.Text style={[styles.version, { opacity: versionOp }]}>
        v1.0.0 · iOS & Android
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    opacity: 0.4,
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(232,197,71,0.07)',
    top: '50%',
    left: '50%',
    marginTop: -160,
    marginLeft: -160,
  },
  logoWrap: {
    marginBottom: 28,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 12,
  },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGrid: {
    width: 50,
    height: 50,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  logoCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  wordmark: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 56,
    letterSpacing: 3,
    color: '#F5F4F0',
    lineHeight: 60,
  },
  wordmarkAccent: {
    color: Colors.gold,
  },
  tagline: {
    fontFamily: 'DMSans_300Light',
    fontSize: 11,
    letterSpacing: 2.5,
    color: Colors.sub,
    marginTop: 10,
  },
  progressTrack: {
    width: 120,
    height: 2,
    backgroundColor: Colors.border,
    borderRadius: 1,
    marginTop: 56,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: Colors.gold,
    borderRadius: 1,
  },
  version: {
    position: 'absolute',
    bottom: 52,
    fontFamily: 'DMSans_300Light',
    fontSize: 11,
    color: Colors.dim,
    letterSpacing: 1,
  },
});
