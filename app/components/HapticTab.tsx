import React from 'react';
import { Platform, Pressable, type GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: any) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev: GestureResponderEvent) => {
        if (Platform.OS !== 'web') {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {
            // Safe fallback if device does not support haptics
          }
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

