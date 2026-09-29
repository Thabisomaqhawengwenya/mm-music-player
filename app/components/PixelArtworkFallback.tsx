import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PixelArtworkFallbackProps {
  seed: string;
  size?: number;
  cornerRadius?: number;
  iconName?: keyof typeof Ionicons.glyphMap;
}

const GRADIENTS = [
  ['#1E2640', '#4A6FA5'],
  ['#2B1B36', '#8F5C9D'],
  ['#142823', '#4E8775'],
  ['#3A241A', '#A3684B'],
  ['#162330', '#3D729E'],
  ['#2D1F17', '#9E6746'],
];

export const PixelArtworkFallback: React.FC<PixelArtworkFallbackProps> = ({
  seed,
  size = 52,
  cornerRadius = 14,
  iconName = 'musical-notes',
}) => {
  const { bgGradient, initial } = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % GRADIENTS.length;
    const initialChar = seed.trim().charAt(0).toUpperCase() || '♪';

    return {
      bgGradient: GRADIENTS[idx],
      initial: initialChar,
    };
  }, [seed]);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: cornerRadius,
          backgroundColor: bgGradient[0],
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
      ]}
    >
      <View
        style={[
          styles.innerRing,
          {
            borderRadius: cornerRadius - 4,
            borderColor: bgGradient[1],
          },
        ]}
      >
        {size >= 64 ? (
          <Text style={[styles.initialText, { fontSize: Math.round(size * 0.38) }]}>
            {initial}
          </Text>
        ) : (
          <Ionicons name={iconName} size={Math.round(size * 0.44)} color={bgGradient[1]} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  innerRing: {
    width: '82%',
    height: '82%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    opacity: 0.9,
  },
  initialText: {
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
