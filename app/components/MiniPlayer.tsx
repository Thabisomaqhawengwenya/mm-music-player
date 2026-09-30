import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track, AppTheme } from '@/src/types';
import { TactileButton } from './TactileButton';
import { AudioPlayerService } from '@/src/services/audioPlayer';
import { PixelArtworkFallback } from './PixelArtworkFallback';

interface MiniPlayerProps {
  track: Track;
  isPlaying: boolean;
  position: number;
  duration: number;
  theme: AppTheme;
  onPress: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying,
  position,
  duration,
  theme,
  onPress,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isPlaying) {
      loop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    } else {
      rotateAnim.stopAnimation();
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isPlaying]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const player = AudioPlayerService.getInstance();

  return (
    <TactileButton onPress={onPress} activeScale={0.98} style={styles.containerWrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.playerBarBg,
            borderColor: theme.surfaceBorder,
          },
        ]}
      >
        {/* Progress track line */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressRatio * 100}%`,
                backgroundColor: theme.accent,
              },
            ]}
          />
        </View>

        <View style={styles.contentRow}>
          {/* Rotating Vinyl Artwork Thumbnail */}
          <Animated.View
            style={[
              styles.artContainer,
              {
                borderColor: theme.accent,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            {track.artwork ? (
              <Image source={{ uri: track.artwork }} style={styles.artImage} />
            ) : (
              <PixelArtworkFallback seed={track.title} size={42} cornerRadius={21} />
            )}
          </Animated.View>

          {/* Title & Artist */}
          <View style={styles.infoCol}>
            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
              {track.title}
            </Text>
            <Text style={[styles.artist, { color: theme.textSecondary }]} numberOfLines={1}>
              {track.artist} • {track.album}
            </Text>
          </View>

          {/* Control buttons */}
          <View style={styles.actionsRow}>
            <TactileButton
              onPress={() => player.togglePlayPause()}
              style={[styles.playButton, { backgroundColor: theme.accent }]}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={18}
                color={theme.background}
              />
            </TactileButton>

            <TactileButton
              onPress={() => player.next()}
              style={styles.iconButton}
            >
              <Ionicons name="play-skip-forward" size={20} color={theme.textPrimary} />
            </TactileButton>
          </View>
        </View>
      </View>
    </TactileButton>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  progressBarBackground: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressBarFill: {
    height: 3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  artContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  artPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  artist: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
  },
});
