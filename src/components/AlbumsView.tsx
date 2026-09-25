import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Album, AppTheme } from '../types';
import { TactileButton } from './TactileButton';

interface AlbumsViewProps {
  albums: Album[];
  theme: AppTheme;
  onSelectAlbum: (album: Album) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 48) / 2;

export const AlbumsView: React.FC<AlbumsViewProps> = ({
  albums,
  theme,
  onSelectAlbum,
}) => {
  return (
    <FlatList
      data={albums}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.columnWrapper}
      renderItem={({ item }) => (
        <TactileButton
          onPress={() => onSelectAlbum(item)}
          style={[
            styles.albumCard,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <View style={[styles.artworkContainer, { backgroundColor: theme.surfaceLight }]}>
            {item.artwork ? (
              <Image source={{ uri: item.artwork }} style={styles.artwork} />
            ) : (
              <View style={styles.artPlaceholder}>
                <Ionicons name="disc" size={54} color={theme.accent} />
              </View>
            )}
            <View style={[styles.trackCountBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <Text style={[styles.trackCountText, { color: theme.textPrimary }]}>
                {item.trackCount} {item.trackCount === 1 ? 'track' : 'tracks'}
              </Text>
            </View>
          </View>

          <View style={styles.metaContainer}>
            <Text style={[styles.albumTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.albumArtist, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.artist} {item.year ? `• ${item.year}` : ''}
            </Text>
          </View>
        </TactileButton>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="disc-outline" size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No albums found
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  albumCard: {
    width: COLUMN_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  artworkContainer: {
    width: '100%',
    height: COLUMN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  artPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trackCountText: {
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metaContainer: {
    padding: 10,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  albumArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
