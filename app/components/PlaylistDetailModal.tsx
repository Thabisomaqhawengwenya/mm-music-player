import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Playlist, Track, AppTheme } from '@/src/types';
import { StorageService } from '@/src/services/playlistStorage';
import { TactileButton } from './TactileButton';
import { TrackListItem } from './TrackListItem';
import { formatTime } from '@/src/utils/formatters';

interface PlaylistDetailModalProps {
  visible: boolean;
  playlist: Playlist | null;
  allTracks: Track[];
  theme: AppTheme;
  currentTrackId?: string;
  isPlaying: boolean;
  onClose: () => void;
  onPlaylistUpdated: () => void;
  onPlayTrack: (track: Track, contextList: Track[]) => void;
  onPlayAll: (tracks: Track[], shuffle: boolean) => void;
  onToggleFavorite: (trackId: string) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onEditTags: (track: Track) => void;
}

export const PlaylistDetailModal: React.FC<PlaylistDetailModalProps> = ({
  visible,
  playlist,
  allTracks,
  theme,
  currentTrackId,
  isPlaying,
  onClose,
  onPlaylistUpdated,
  onPlayTrack,
  onPlayAll,
  onToggleFavorite,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onEditTags,
}) => {
  if (!playlist) return null;

  const [isRenaming, setIsRenaming] = useState(false);
  const [renamedTitle, setRenamedTitle] = useState(playlist.name);

  // Map track IDs to Track objects
  const playlistTracks: Track[] = playlist.trackIds
    .map((id) => allTracks.find((t) => t.id === id))
    .filter((t): t is Track => t !== undefined);

  const totalDuration = playlistTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handleSaveRename = async () => {
    if (!renamedTitle.trim()) return;
    await StorageService.renamePlaylist(playlist.id, renamedTitle.trim());
    setIsRenaming(false);
    onPlaylistUpdated();
  };

  const handleRemoveTrack = (trackId: string, title: string) => {
    Alert.alert(
      'Remove from Playlist',
      `Remove "${title}" from "${playlist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await StorageService.removeTrackFromPlaylist(playlist.id, trackId);
            onPlaylistUpdated();
          },
        },
      ]
    );
  };

  const handleDeletePlaylist = () => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deletePlaylist(playlist.id);
            onPlaylistUpdated();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TactileButton onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TactileButton>

          <View style={styles.titleCol}>
            {isRenaming ? (
              <View style={styles.renameRow}>
                <TextInput
                  value={renamedTitle}
                  onChangeText={setRenamedTitle}
                  style={[styles.renameInput, { color: theme.textPrimary, borderColor: theme.accent }]}
                  autoFocus
                />
                <TactileButton onPress={handleSaveRename} style={styles.iconBtn}>
                  <Ionicons name="checkmark" size={20} color={theme.accent} />
                </TactileButton>
                <TactileButton onPress={() => setIsRenaming(false)} style={styles.iconBtn}>
                  <Ionicons name="close" size={20} color={theme.textTertiary} />
                </TactileButton>
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={[styles.barTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                  {playlist.name}
                </Text>
                <TactileButton onPress={() => { setRenamedTitle(playlist.name); setIsRenaming(true); }}>
                  <Ionicons name="pencil" size={16} color={theme.textTertiary} />
                </TactileButton>
              </View>
            )}
          </View>

          <TactileButton onPress={handleDeletePlaylist} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
          </TactileButton>
        </View>

        <FlatList
          data={playlistTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.heroSection}>
              <View style={[styles.playlistIconBig, { backgroundColor: theme.surfaceLight }]}>
                <Ionicons name="musical-notes" size={48} color={theme.accent} />
              </View>

              <Text style={[styles.playlistSubtitle, { color: theme.textSecondary }]}>
                {playlistTracks.length} {playlistTracks.length === 1 ? 'track' : 'tracks'} • {formatTime(totalDuration)}
              </Text>

              {playlistTracks.length > 0 && (
                <View style={styles.buttonRow}>
                  <TactileButton
                    onPress={() => onPlayAll(playlistTracks, false)}
                    style={[styles.primaryPlayBtn, { backgroundColor: theme.accent }]}
                  >
                    <Ionicons name="play" size={18} color={theme.background} />
                    <Text style={[styles.primaryPlayBtnText, { color: theme.background }]}>
                      Play All
                    </Text>
                  </TactileButton>

                  <TactileButton
                    onPress={() => onPlayAll(playlistTracks, true)}
                    style={[styles.shuffleBtn, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder }]}
                  >
                    <Ionicons name="shuffle" size={18} color={theme.textPrimary} />
                    <Text style={[styles.shuffleBtnText, { color: theme.textPrimary }]}>
                      Shuffle
                    </Text>
                  </TactileButton>
                </View>
              )}
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.trackRowWrapper}>
              <View style={{ flex: 1 }}>
                <TrackListItem
                  track={item}
                  index={index}
                  isCurrent={currentTrackId === item.id}
                  isPlaying={isPlaying}
                  theme={theme}
                  onPress={() => onPlayTrack(item, playlistTracks)}
                  onToggleFavorite={onToggleFavorite}
                  onPlayNext={onPlayNext}
                  onAddToQueue={onAddToQueue}
                  onAddToPlaylist={onAddToPlaylist}
                  onEditTags={onEditTags}
                />
              </View>
              <TactileButton
                onPress={() => handleRemoveTrack(item.id, item.title)}
                style={styles.removeTrackBtn}
              >
                <Ionicons name="remove-circle-outline" size={20} color={theme.textTertiary} />
              </TactileButton>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Playlist is currently empty
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                Add tracks from the Library using the "..." track menu.
              </Text>
            </View>
          }
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
  titleCol: {
    flex: 1,
    marginHorizontal: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  renameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  renameInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  iconBtn: {
    padding: 4,
  },
  deleteBtn: {
    padding: 8,
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
  playlistIconBig: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  playlistSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
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
  trackRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeTrackBtn: {
    paddingLeft: 8,
    paddingVertical: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
});
