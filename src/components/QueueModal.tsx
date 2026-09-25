import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track, AppTheme } from '../types';
import { AudioPlayerService } from '../services/audioPlayer';
import { StorageService } from '../services/playlistStorage';
import { TactileButton } from './TactileButton';
import { formatTime } from '../utils/formatters';

interface QueueModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
  currentTrackId?: string;
  onQueueUpdated: () => void;
}

export const QueueModal: React.FC<QueueModalProps> = ({
  visible,
  onClose,
  theme,
  currentTrackId,
  onQueueUpdated,
}) => {
  const player = AudioPlayerService.getInstance();
  const queue = player.getQueue();
  const currentIndex = player.getCurrentIndex();

  const handlePlayIndex = (index: number) => {
    player.playAtIndex(index);
    onQueueUpdated();
  };

  const handleRemove = (index: number) => {
    player.removeFromQueue(index);
    onQueueUpdated();
  };

  const handleSaveAsPlaylist = () => {
    if (queue.length === 0) return;
    Alert.prompt(
      'New Playlist from Queue',
      'Enter a name for this playlist:',
      async (name) => {
        if (name && name.trim()) {
          const trackIds = queue.map(t => t.id);
          await StorageService.createPlaylist(name.trim(), trackIds);
          Alert.alert('Success', `Saved "${name.trim()}" with ${trackIds.length} tracks.`);
        }
      }
    );
  };

  const renderItem = ({ item, index }: { item: Track; index: number }) => {
    const isCurrent = index === currentIndex;

    return (
      <View
        style={[
          styles.queueItem,
          {
            backgroundColor: isCurrent ? theme.surfaceLight : theme.surface,
            borderColor: isCurrent ? theme.accent : theme.surfaceBorder,
          },
        ]}
      >
        <TactileButton
          onPress={() => handlePlayIndex(index)}
          style={styles.itemContent}
        >
          <View style={styles.indexCol}>
            {isCurrent ? (
              <Ionicons name="volume-high" size={18} color={theme.accent} />
            ) : (
              <Text style={[styles.indexText, { color: theme.textTertiary }]}>
                {index + 1}
              </Text>
            )}
          </View>

          <View style={styles.infoCol}>
            <Text
              style={[
                styles.trackTitle,
                { color: isCurrent ? theme.accent : theme.textPrimary },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.trackArtist, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.artist} • {formatTime(item.duration)}
            </Text>
          </View>
        </TactileButton>

        <TactileButton
          onPress={() => handleRemove(index)}
          style={styles.removeBtn}
        >
          <Ionicons name="trash-outline" size={18} color={theme.textTertiary} />
        </TactileButton>
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
            <Ionicons name="list" size={22} color={theme.accent} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>PLAYBACK QUEUE</Text>
            <Text style={[styles.badge, { color: theme.accent, backgroundColor: theme.surfaceLight }]}>
              {queue.length}
            </Text>
          </View>

          <TactileButton onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.textPrimary} />
          </TactileButton>
        </View>

        {/* Save as Playlist Action */}
        {queue.length > 0 && (
          <View style={styles.actionBanner}>
            <TactileButton
              onPress={handleSaveAsPlaylist}
              style={[styles.savePlaylistBtn, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            >
              <Ionicons name="folder-outline" size={18} color={theme.accent} />
              <Text style={[styles.savePlaylistText, { color: theme.textPrimary }]}>
                Save Current Queue as Playlist
              </Text>
            </TactileButton>
          </View>
        )}

        {/* Queue List */}
        <FlatList
          data={queue}
          keyExtractor={(item, idx) => `${item.id}_${idx}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Queue is empty
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
  badge: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  closeBtn: {
    padding: 6,
  },
  actionBanner: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  savePlaylistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  savePlaylistText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 8,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 12,
  },
  indexCol: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  indexText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoCol: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  trackArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  removeBtn: {
    padding: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
});
