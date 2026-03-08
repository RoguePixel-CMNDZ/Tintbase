import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

function getLightness(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
}

export default function SwatchCard({ paint, isFav, onFavToggle, onPress, animDelay = 0 }) {
  const isLight = getLightness(paint.hex) > 0.55;
  const overlayColor = isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.chip, { backgroundColor: paint.hex }]}>
        <TouchableOpacity style={styles.favBtn} onPress={onFavToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.favIcon, { color: isFav ? Colors.gold : 'rgba(255,255,255,0.3)' }]}>
            {isFav ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
        <View style={styles.lrvBadge}>
          <Text style={[styles.lrvText, { color: overlayColor }]}>LRV {paint.lrv}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <Text style={styles.brandText}>{paint.brand === 'Sherwin-Williams' ? 'SW' : 'Behr'}</Text>
        <Text style={styles.nameText} numberOfLines={1}>{paint.name}</Text>
        <Text style={styles.codeText}>{paint.code} · {paint.sheen}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chip: {
    height: 72,
    position: 'relative',
  },
  favBtn: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(10,11,13,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: {
    fontSize: 11,
    lineHeight: 14,
  },
  lrvBadge: {
    position: 'absolute',
    bottom: 6,
    left: 7,
    backgroundColor: 'rgba(10,11,13,0.55)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  lrvText: {
    fontSize: 8,
    fontWeight: '600',
  },
  meta: {
    padding: 8,
    paddingBottom: 10,
  },
  brandText: {
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.dim,
    marginBottom: 1,
  },
  nameText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  codeText: {
    fontSize: 9.5,
    color: Colors.sub,
  },
});
