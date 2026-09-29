import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { AppTheme, PetSettings, PlaybackState } from '../../src/types';
import { MusicPet } from './MusicPet';

interface FloatingPetOverlayProps {
  playbackState: PlaybackState;
  theme: AppTheme;
  petSettings: PetSettings;
  onOpenNowPlaying: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FloatingPetOverlay: React.FC<FloatingPetOverlayProps> = ({
  playbackState,
  theme,
  petSettings,
  onOpenNowPlaying,
}) => {
  // Draggable positioning
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 84, y: SCREEN_HEIGHT - 210 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        setIsDragging(false);
        pan.flattenOffset();
      },
    })
  ).current;

  if (!petSettings.enabled || !petSettings.showFloatingMini) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <MusicPet
        playbackState={playbackState}
        theme={theme}
        avatar={petSettings.avatar}
        accessory={petSettings.accessory}
        affection={petSettings.affection}
        size="compact"
        emotionOverride={petSettings.emotionOverride}
        onPress={() => {
          if (!isDragging && playbackState.currentTrack) {
            onOpenNowPlaying();
          }
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 999,
    elevation: 8,
  },
});
