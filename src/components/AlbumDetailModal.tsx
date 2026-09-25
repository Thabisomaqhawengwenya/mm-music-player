import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Album, Track, AppTheme } from '../types';
import { TactileButton } from './TactileButton';
import { TrackListItem } from './TrackListItem';
import { formatTime } from '../utils/formatters';

interface AlbumDetailModalProps {
  visible: boolean;
  album: Album | null;
  theme: AppTheme;
  currentTrackId?: string;
  isPlaying: boolean;
  onClose: () => void;
  onPlayTrack: (track: Track, contextList: Track[]) => void;
  onPlayAll: (tracks: Track[], shuffle: boolean) => void;
  onToggleFavorite: (trackId: string) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onEditTags: (track: Track) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(SCREEN_WIDTH - 96, 220);

export const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({
  visible,
  album,
  theme,
  currentTrackId,
  isPlaying,
  onClose,
  onPlayTrack,
  onPlayAll,
  onToggleFavorite,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onEditTags,
}) => {
  if (!album) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header Bar */}
        <View style={styles.topBar}>
          <TactileButton onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TactileButton>
          <Text style={[styles.barTitle, { color: theme.textSecondary }]} numberOfLines={1}>
            ALBUM
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={album.tracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.heroSection}>
              {/* Artwork */}
              <View style={[styles.artBox, { backgroundColor: theme.surfaceLight }]}>
                {album.artwork ? (
                  <Image source={{ uri: album.artwork }} style={styles.artwork} />
                ) : (
                  <Ionicons name="disc" size={80} color={theme.accent} />
                )}
              </View>

              {/* Title & Meta */}
              <Text style={[styles.albumTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                {album.name}
              </Text>
              <Text style={[styles.artistName, { color: theme.accent }]}>
                {album.artist}
              </Text>
              <Text style={[styles.albumStats, { color: theme.textTertiary }]}>
                {album.year ? `${album.year} • ` : ''}
                {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'} • {formatTime(album.totalDuration)}
              </Text>

              {/* Actions Row */}
              <View style={styles.actionButtonsRow}>
                <TactileButton
                  onPress={() => onPlayAll(album.tracks, false)}
                  style={[styles.primaryPlayBtn, { backgroundColor: theme.accent }]}
                >
                  <Ionicons name="play" size={18} color={theme.background} />
                  <Text style={[styles.primaryPlayBtnText, { color: theme.background }]}>
                    Play All
                  </Text>
                </TactileButton>

                <TactileButton
                  onPress={() => onPlayAll(album.tracks, true)}
                  style={[styles.shuffleBtn, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder }]}
                >
                  <Ionicons name="shuffle" size={18} color={theme.textPrimary} />
                  <Text style={[styles.shuffleBtnText, { color: theme.textPrimary }]}>
                    Shuffle
                  </Text>
                </TactileButton>
              </View>
            </View>
          }
          renderItem={({ item, index }) => (
            <TrackListItem
              track={item}
              index={index}
              isCurrent={currentTrackId === item.id}
              isPlaying={isPlaying}
              theme={theme}
              onPress={() => onPlayTrack(item, album.tracks)}
              onToggleFavorite={onToggleFavorite}
              onPlayNext={onPlayNext}
              onAddToQueue={onAddToQueue}
              onAddToPlaylist={onAddToPlaylist}
              onEditTags={onEditTags}
            />
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  barTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  artBox: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  albumTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  albumStats: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    fontVariant: ['tabular-nums'],
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  primaryPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryPlayBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  shuffleBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
