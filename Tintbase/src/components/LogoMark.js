import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LogoMark({ size = 36, borderRadius = 10 }) {
  const cellSize = size * 0.38;
  const gap = size * 0.05;
  const pattern = [1, 0, 1, 0, 1, 0, 1, 0, 1];

  return (
    <LinearGradient
      colors={['#E8C547', '#D4914A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { width: size, height: size, borderRadius }]}
    >
      <View style={[styles.grid, { width: cellSize * 3 + gap * 2, height: cellSize * 3 + gap * 2 }]}>
        {pattern.map((v, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              {
                width: cellSize,
                height: cellSize,
                borderRadius: cellSize * 0.2,
                backgroundColor: v ? 'rgba(10,11,13,0.85)' : 'rgba(255,255,255,0.9)',
                margin: gap / 2,
              },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {},
});
