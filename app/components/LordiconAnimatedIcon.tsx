import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Pressable } from 'react-native';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LordiconAssets, LordiconIconName } from '../../assets/lordicon';

export type LordiconTrigger = 'playOnFocus' | 'loop' | 'click' | 'static' | 'hover';

export interface LordiconAnimatedIconProps {
  name: LordiconIconName;
  size?: number;
  color?: string;
  focused?: boolean;
  trigger?: LordiconTrigger;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
  onPress?: () => void;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  fallbackOutlineIcon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

const FALLBACK_ICONS: Record<LordiconIconName, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  search: { focused: 'search', unfocused: 'search-outline' },
  settings: { focused: 'settings', unfocused: 'settings-outline' },
  music: { focused: 'musical-notes', unfocused: 'musical-notes-outline' },
  playlist: { focused: 'albums', unfocused: 'albums-outline' },
  sparkles: { focused: 'sparkles', unfocused: 'sparkles-outline' },
  heart: { focused: 'heart', unfocused: 'heart-outline' },
  play: { focused: 'play', unfocused: 'play-outline' },
};

/**
 * LordiconAnimatedIcon - High-performance animated vector icon powered by Lordicon Lottie specifications
 * Features responsive triggers, dynamic color theming, haptic feedback, and graceful vector fallback.
 */
export function LordiconAnimatedIcon({
  name,
  size = 24,
  color = '#2563eb',
  focused = false,
  trigger = 'playOnFocus',
  loop = false,
  autoPlay = false,
  speed = 1.2,
  onPress,
  fallbackIcon,
  fallbackOutlineIcon,
  style,
}: LordiconAnimatedIconProps) {
  const lottieRef = useRef<LottieView>(null);
  const wasFocusedRef = useRef(focused);

  // Handle focus changes (e.g., switching tabs)
  useEffect(() => {
    if (trigger === 'playOnFocus') {
      if (focused && !wasFocusedRef.current) {
        lottieRef.current?.reset();
        lottieRef.current?.play();
      } else if (!focused && wasFocusedRef.current) {
        lottieRef.current?.reset();
      }
    }
    wasFocusedRef.current = focused;
  }, [focused, trigger]);

  // Handle loop or autoplay changes
  useEffect(() => {
    if (loop || trigger === 'loop') {
      lottieRef.current?.play();
    }
  }, [loop, trigger]);

  const handlePress = () => {
    if (onPress) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Safe haptic fallback
      }
      lottieRef.current?.reset();
      lottieRef.current?.play();
      onPress();
    } else if (trigger === 'click') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Safe haptic fallback
      }
      lottieRef.current?.reset();
      lottieRef.current?.play();
    }
  };

  const assetSource = LordiconAssets[name];

  const content = (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {assetSource ? (
        <LottieView
          ref={lottieRef}
          source={assetSource}
          autoPlay={autoPlay || loop || trigger === 'loop' || (trigger === 'playOnFocus' && focused)}
          loop={loop || trigger === 'loop'}
          speed={speed}
          style={{ width: size, height: size }}
          colorFilters={[
            {
              keypath: '**',
              color: color,
            },
          ]}
        />
      ) : (
        <Ionicons
          name={
            focused
              ? fallbackIcon || FALLBACK_ICONS[name]?.focused || 'star'
              : fallbackOutlineIcon || FALLBACK_ICONS[name]?.unfocused || 'star-outline'
          }
          size={size * 0.85}
          color={color}
        />
      )}
    </View>
  );

  if (onPress || trigger === 'click') {
    return (
      <Pressable
        onPress={handlePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.85,
  },
});
