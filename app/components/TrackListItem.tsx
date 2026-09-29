import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActionSheetIOS,
  Platform,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Track, AppTheme } from '@/src/types';
import { TactileButton } from './TactileButton';
import { PixelArtworkFallback } from './PixelArtworkFallback';
import { formatTime } from '@/src/utils/formatters';

interface TrackListItemProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  theme: AppTheme;
  onPress: () => void;
  onToggleFavorite: (trackId: string) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onEditTags: (track: Track) => void;
}

export const TrackListItem: React.FC<TrackListItemProps> = ({
  track,
  index,
  isCurrent,
  isPlaying,
  theme,
  onPress,
  onToggleFavorite,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onEditTags,
}) => {
  const heartScaleAnim = React.useRef(new Animated.Value(1)).current;
  const triggerHeartAnimation = () => {
    Animated.sequence([
      Animated.timing(heartScaleAnim, {
        toValue: 1.35,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(heartScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMoreOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Play Next', 'Add to Queue', 'Add to Playlist', 'Edit Metadata Tags'],
          cancelButtonIndex: 0,
          title: track.title,
          message: track.artist,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) onPlayNext(track);
          else if (buttonIndex === 2) onAddToQueue(track);
          else if (buttonIndex === 3) onAddToPlaylist(track);
          else if (buttonIndex === 4) onEditTags(track);
        }
      );
    } else {
      Alert.alert(
        track.title,
        track.artist,
        [
          { text: 'Play Next', onPress: () => onPlayNext(track) },
          { text: 'Add to Queue', onPress: () => onAddToQueue(track) },
          { text: 'Add to Playlist', onPress: () => onAddToPlaylist(track) },
          { text: 'Edit Metadata', onPress: () => onEditTags(track) },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCurrent ? theme.surfaceLight : theme.surface,
          borderColor: isCurrent ? theme.accent : theme.surfaceBorder,
        },
      ]}
    >
      <TactileButton onPress={onPress} style={styles.trackMainTouch}>
        {/* Artwork or Index indicator */}
        <View style={styles.artWrapper}>
          {track.artwork ? (
            <Image source={{ uri: track.artwork }} style={styles.artwork} />
          ) : (
            <PixelArtworkFallback
              seed={`${track.title}-${track.artist}`}
              size={46}
              cornerRadius={12}
              iconName={isCurrent ? (isPlaying ? 'volume-high' : 'pause') : 'musical-note'}
            />
          )}

          {isCurrent && track.artwork && (
            <View style={[styles.activeIndicatorOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <Ionicons
                name={isPlaying ? 'volume-high' : 'pause'}
                size={16}
                color={theme.accent}
              />
            </View>
          )}
        </View>

        {/* Track Title & Artist */}
        <View style={styles.metaCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={[
                styles.title,
                { color: isCurrent ? theme.accent : theme.textPrimary, flexShrink: 1 },
              ]}
              numberOfLines={1}
            >
              {track.title}
            </Text>
            {((track.filename || track.uri || '').toLowerCase().endsWith('.flac') ||
              (track.filename || track.uri || '').toLowerCase().endsWith('.wav')) && (
              <View style={[styles.losslessBadge, { backgroundColor: theme.accentGlow }]}>
                <Text style={[styles.losslessBadgeText, { color: theme.accent }]}>HI-RES</Text>
              </View>
            )}
          </View>
          <Text style={[styles.artist, { color: theme.textSecondary }]} numberOfLines={1}>
            {track.artist} {track.album ? `• ${track.album}` : ''}
          </Text>
        </View>

        {/* Duration */}
        <Text style={[styles.duration, { color: theme.textTertiary }]}>
          {formatTime(track.duration)}
        </Text>
      </TactileButton>

      {/* Favorite Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        onPress={() => {
          triggerHeartAnimation();
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
          onToggleFavorite(track.id);
        }}
        style={styles.actionBtn}
      >
        <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
          <Ionicons
            name={track.isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={track.isFavorite ? '#FF2D55' : theme.textTertiary}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Options Menu Button */}
      <TactileButton
        onPress={handleMoreOptions}
        style={styles.actionBtn}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={theme.textTertiary} />
      </TactileButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
  },
  trackMainTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
  },
  artWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  artworkPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicatorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaCol: {
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
  duration: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginHorizontal: 8,
  },
  actionBtn: {
    padding: 12,
  },
  losslessBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  losslessBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
