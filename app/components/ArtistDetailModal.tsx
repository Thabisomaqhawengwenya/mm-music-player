import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Artist, Album, Track, AppTheme } from '@/src/types';
import { TactileButton } from './TactileButton';
import { TrackListItem } from './TrackListItem';

interface ArtistDetailModalProps {
  visible: boolean;
  artist: Artist | null;
  artistAlbums: Album[];
  theme: AppTheme;
  currentTrackId?: string;
  isPlaying: boolean;
  onClose: () => void;
  onSelectAlbum: (album: Album) => void;
  onPlayTrack: (track: Track, contextList: Track[]) => void;
  onPlayAll: (tracks: Track[], shuffle: boolean) => void;
  onToggleFavorite: (trackId: string) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onEditTags: (track: Track) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({
  visible,
  artist,
  artistAlbums,
  theme,
  currentTrackId,
  isPlaying,
  onClose,
  onSelectAlbum,
  onPlayTrack,
  onPlayAll,
  onToggleFavorite,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onEditTags,
}) => {
  if (!artist) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Navigation */}
        <View style={styles.topBar}>
          <TactileButton onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TactileButton>
          <Text style={[styles.barTitle, { color: theme.textSecondary }]}>
            ARTIST PROFILE
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={artist.tracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              {/* Artist Icon Banner */}
              <View style={[styles.avatarBox, { backgroundColor: theme.surfaceLight }]}>
                {artist.artwork ? (
                  <Image source={{ uri: artist.artwork }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={60} color={theme.accent} />
                )}
              </View>

              <Text style={[styles.artistName, { color: theme.textPrimary }]} numberOfLines={1}>
                {artist.name}
              </Text>
              <Text style={[styles.artistMeta, { color: theme.textTertiary }]}>
                {artist.trackCount} {artist.trackCount === 1 ? 'song' : 'songs'} • {artistAlbums.length} {artistAlbums.length === 1 ? 'album' : 'albums'}
              </Text>

              {/* Play / Shuffle Buttons */}
              <View style={styles.buttonRow}>
                <TactileButton
                  onPress={() => onPlayAll(artist.tracks, false)}
                  style={[styles.primaryPlayBtn, { backgroundColor: theme.accent }]}
                >
                  <Ionicons name="play" size={18} color={theme.background} />
                  <Text style={[styles.primaryPlayBtnText, { color: theme.background }]}>
                    Play All
                  </Text>
                </TactileButton>

                <TactileButton
                  onPress={() => onPlayAll(artist.tracks, true)}
                  style={[styles.shuffleBtn, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder }]}
                >
                  <Ionicons name="shuffle" size={18} color={theme.textPrimary} />
                  <Text style={[styles.shuffleBtnText, { color: theme.textPrimary }]}>
                    Shuffle
                  </Text>
                </TactileButton>
              </View>

              {/* Discography Albums Horizontal Carousel */}
              {artistAlbums.length > 0 && (
                <View style={styles.albumsSection}>
                  <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    DISCOGRAPHY ({artistAlbums.length})
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.albumsCarousel}
                  >
                    {artistAlbums.map((album) => (
                      <TactileButton
                        key={album.id}
                        onPress={() => onSelectAlbum(album)}
                        style={[styles.albumCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                      >
                        <View style={[styles.albumArtBox, { backgroundColor: theme.surfaceLight }]}>
                          {album.artwork ? (
                            <Image source={{ uri: album.artwork }} style={styles.albumArt} />
                          ) : (
                            <Ionicons name="disc" size={32} color={theme.accent} />
                          )}
                        </View>
                        <Text style={[styles.albumCardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                          {album.name}
                        </Text>
                        <Text style={[styles.albumCardSub, { color: theme.textTertiary }]} numberOfLines={1}>
                          {album.trackCount} tracks {album.year ? `• ${album.year}` : ''}
                        </Text>
                      </TactileButton>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 16 }]}>
                ALL SONGS ({artist.tracks.length})
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <TrackListItem
              track={item}
              index={index}
              isCurrent={currentTrackId === item.id}
              isPlaying={isPlaying}
              theme={theme}
              onPress={() => onPlayTrack(item, artist.tracks)}
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
  headerSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  artistName: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  artistMeta: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
  albumsSection: {
    width: '100%',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  albumsCarousel: {
    gap: 12,
    paddingBottom: 6,
  },
  albumCard: {
    width: 130,
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
  },
  albumArtBox: {
    width: '100%',
    height: 114,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  albumCardTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  albumCardSub: {
    fontSize: 10,
    marginTop: 2,
  },
});
