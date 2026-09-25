import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track, AppTheme } from '../types';
import { TactileButton } from './TactileButton';
import { formatTime } from '../utils/formatters';

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
            <View style={[styles.artworkPlaceholder, { backgroundColor: theme.surfaceLight }]}>
              {isCurrent ? (
                <Ionicons
                  name={isPlaying ? 'volume-high' : 'pause'}
                  size={18}
                  color={theme.accent}
                />
              ) : (
                <Ionicons name="musical-note" size={16} color={theme.textTertiary} />
              )}
            </View>
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
          <Text
            style={[
              styles.title,
              { color: isCurrent ? theme.accent : theme.textPrimary },
            ]}
            numberOfLines={1}
          >
            {track.title}
          </Text>
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
      <TactileButton
        onPress={() => onToggleFavorite(track.id)}
        style={styles.actionBtn}
      >
        <Ionicons
          name={track.isFavorite ? 'heart' : 'heart-outline'}
          size={18}
          color={track.isFavorite ? theme.danger : theme.textTertiary}
        />
      </TactileButton>

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
});
