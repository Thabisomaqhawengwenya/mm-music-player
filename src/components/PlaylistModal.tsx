import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Playlist, Track, AppTheme } from '../types';
import { StorageService } from '../services/playlistStorage';
import { TactileButton } from './TactileButton';

interface PlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
  allTracks: Track[];
  onPlayTracks: (tracks: Track[]) => void;
  onOpenPlaylistDetail?: (playlist: Playlist) => void;
  addTrackMode?: Track | null; // If set, user is choosing which playlist to add this track to
  onTrackAddedToPlaylist?: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  visible,
  onClose,
  theme,
  allTracks,
  onPlayTracks,
  onOpenPlaylistDetail,
  addTrackMode,
  onTrackAddedToPlaylist,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPlaylists();
    }
  }, [visible]);

  const loadPlaylists = async () => {
    const list = await StorageService.getPlaylists();
    setPlaylists(list);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const initialTrackIds = addTrackMode ? [addTrackMode.id] : [];
    const created = await StorageService.createPlaylist(newPlaylistName.trim(), initialTrackIds);
    setNewPlaylistName('');
    setShowCreateInput(false);
    await loadPlaylists();

    if (addTrackMode && onTrackAddedToPlaylist) {
      Alert.alert('Added', `Added "${addTrackMode.title}" to "${created.name}"`);
      onTrackAddedToPlaylist();
      onClose();
    }
  };

  const handleSelectPlaylist = async (playlist: Playlist) => {
    if (addTrackMode) {
      await StorageService.addTrackToPlaylist(playlist.id, addTrackMode.id);
      Alert.alert('Added', `Added "${addTrackMode.title}" to "${playlist.name}"`);
      if (onTrackAddedToPlaylist) onTrackAddedToPlaylist();
      onClose();
    } else if (onOpenPlaylistDetail) {
      onOpenPlaylistDetail(playlist);
      onClose();
    } else {
      // Play this playlist
      playPlaylist(playlist);
    }
  };

  const playPlaylist = (playlist: Playlist) => {
    const playlistTracks = playlist.trackIds
      .map(id => allTracks.find(t => t.id === id))
      .filter((t): t is Track => t !== undefined);

    if (playlistTracks.length > 0) {
      onPlayTracks(playlistTracks);
      onClose();
    } else {
      Alert.alert('Empty Playlist', 'This playlist has no audio tracks yet.');
    }
  };

  const handleDeletePlaylist = async (playlistId: string, name: string) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deletePlaylist(playlistId);
            await loadPlaylists();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Playlist }) => {
    const trackCount = item.trackIds.length;

    return (
      <View
        style={[
          styles.playlistItem,
          { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
        ]}
      >
        <TactileButton
          onPress={() => handleSelectPlaylist(item)}
          style={styles.playlistClickArea}
        >
          <View style={[styles.playlistIconBox, { backgroundColor: theme.surfaceLight }]}>
            <Ionicons name="musical-notes" size={24} color={theme.accent} />
          </View>

          <View style={styles.playlistTextCol}>
            <Text style={[styles.playlistName, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.playlistCount, { color: theme.textSecondary }]}>
              {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
            </Text>
          </View>
        </TactileButton>

        {!addTrackMode && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TactileButton
              onPress={() => playPlaylist(item)}
              style={styles.deleteBtn}
            >
              <Ionicons name="play-circle-outline" size={22} color={theme.accent} />
            </TactileButton>
            <TactileButton
              onPress={() => handleDeletePlaylist(item.id, item.name)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={18} color={theme.textTertiary} />
            </TactileButton>
          </View>
        )}
      </View>
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="library" size={22} color={theme.accent} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {addTrackMode ? 'ADD TO PLAYLIST' : 'PLAYLISTS'}
            </Text>
          </View>
          <TactileButton onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.textPrimary} />
          </TactileButton>
        </View>

        {/* Create playlist toggle / input */}
        <View style={styles.createSection}>
          {showCreateInput ? (
            <View style={styles.createInputRow}>
              <TextInput
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                placeholder="Playlist name..."
                placeholderTextColor={theme.textTertiary}
                autoFocus
                style={[
                  styles.createInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.accent,
                    color: theme.textPrimary,
                  },
                ]}
              />
              <TactileButton
                onPress={handleCreatePlaylist}
                style={[styles.createSubmitBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={[styles.createSubmitText, { color: theme.background }]}>Save</Text>
              </TactileButton>
              <TactileButton
                onPress={() => setShowCreateInput(false)}
                style={styles.cancelInputBtn}
              >
                <Ionicons name="close" size={20} color={theme.textTertiary} />
              </TactileButton>
            </View>
          ) : (
            <TactileButton
              onPress={() => setShowCreateInput(true)}
              style={[
                styles.newPlaylistBtn,
                { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder },
              ]}
            >
              <Ionicons name="add-circle" size={22} color={theme.accent} />
              <Text style={[styles.newPlaylistBtnText, { color: theme.textPrimary }]}>
                Create New Playlist
              </Text>
            </TactileButton>
          )}
        </View>

        {/* Playlists list */}
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No custom playlists yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                Create one above to organize your offline music
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 6,
  },
  createSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  newPlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  newPlaylistBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  createInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  createInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  createSubmitBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  createSubmitText: {
    fontSize: 14,
    fontWeight: '800',
  },
  cancelInputBtn: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  playlistClickArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  playlistIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  playlistTextCol: {
    flex: 1,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '700',
  },
  playlistCount: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
