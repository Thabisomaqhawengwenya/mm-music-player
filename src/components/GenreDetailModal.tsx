import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Genre, Track, AppTheme } from '../types';
import { TactileButton } from './TactileButton';
import { TrackListItem } from './TrackListItem';

interface GenreDetailModalProps {
  visible: boolean;
  genre: Genre | null;
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

export const GenreDetailModal: React.FC<GenreDetailModalProps> = ({
  visible,
  genre,
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
  if (!genre) return null;

  const genreColor = genre.color || theme.accent;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.topBar}>
          <TactileButton onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TactileButton>
          <Text style={[styles.barTitle, { color: theme.textSecondary }]}>
            GENRE
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={genre.tracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.heroSection}>
              <View style={[styles.iconBox, { backgroundColor: `${genreColor}25`, borderColor: genreColor }]}>
                <Ionicons name="radio" size={48} color={genreColor} />
              </View>
              <Text style={[styles.genreTitle, { color: theme.textPrimary }]}>
                {genre.name}
              </Text>
              <Text style={[styles.genreCount, { color: theme.textTertiary }]}>
                {genre.trackCount} {genre.trackCount === 1 ? 'track' : 'tracks'}
              </Text>

              <View style={styles.buttonRow}>
                <TactileButton
                  onPress={() => onPlayAll(genre.tracks, false)}
                  style={[styles.primaryPlayBtn, { backgroundColor: genreColor }]}
                >
                  <Ionicons name="play" size={18} color="#000" />
                  <Text style={[styles.primaryPlayBtnText, { color: '#000' }]}>
                    Play All
                  </Text>
                </TactileButton>

                <TactileButton
                  onPress={() => onPlayAll(genre.tracks, true)}
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
              onPress={() => onPlayTrack(item, genre.tracks)}
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
  backBtn: {
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
  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 24,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  genreTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  genreCount: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
