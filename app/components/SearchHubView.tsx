import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track, Album, Artist, AppTheme } from '@/src/types';
import { TactileButton } from './TactileButton';
import { TrackListItem } from './TrackListItem';
import { LordiconAnimatedIcon } from './LordiconAnimatedIcon';

interface SearchHubViewProps {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  theme: AppTheme;
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: Track, contextList: Track[]) => void;
  onSelectAlbum: (album: Album) => void;
  onSelectArtist: (artist: Artist) => void;
  onToggleFavorite: (trackId: string) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onEditTags: (track: Track) => void;
}

type FilterScope = 'all' | 'tracks' | 'albums' | 'artists';

export const SearchHubView: React.FC<SearchHubViewProps> = ({
  tracks,
  albums,
  artists,
  theme,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onSelectAlbum,
  onSelectArtist,
  onToggleFavorite,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onEditTags,
}) => {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<FilterScope>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [longOnly, setLongOnly] = useState(false);

  // Search logic
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let matchedTracks = tracks;
    if (favoritesOnly) matchedTracks = matchedTracks.filter((t) => t.isFavorite);
    if (longOnly) matchedTracks = matchedTracks.filter((t) => t.duration >= 180);

    if (q) {
      matchedTracks = matchedTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          (t.genre && t.genre.toLowerCase().includes(q))
      );
    }

    let matchedAlbums = albums;
    if (q) {
      matchedAlbums = matchedAlbums.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.artist.toLowerCase().includes(q)
      );
    }

    let matchedArtists = artists;
    if (q) {
      matchedArtists = matchedArtists.filter((a) =>
        a.name.toLowerCase().includes(q)
      );
    }

    return {
      tracks: matchedTracks,
      albums: matchedAlbums,
      artists: matchedArtists,
    };
  }, [tracks, albums, artists, query, favoritesOnly, longOnly]);

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBarWrapper}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
        >
          <LordiconAnimatedIcon
            name="search"
            size={20}
            color={query.length > 0 ? theme.accent : theme.textTertiary}
            focused={query.length > 0}
            trigger="playOnFocus"
            fallbackIcon="search"
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tracks, albums, artists, genres..."
            placeholderTextColor={theme.textTertiary}
            style={[styles.searchInput, { color: theme.textPrimary }]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TactileButton onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
            </TactileButton>
          )}
        </View>
      </View>

      {/* Filter Category Tabs & Smart Filter Pills */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['all', 'tracks', 'albums', 'artists'] as FilterScope[]).map((tab) => (
            <TactileButton
              key={tab}
              onPress={() => setScope(tab)}
              style={[
                styles.scopeChip,
                {
                  backgroundColor: scope === tab ? theme.accent : theme.surfaceLight,
                  borderColor: scope === tab ? theme.accent : theme.surfaceBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.scopeChipText,
                  { color: scope === tab ? theme.background : theme.textSecondary },
                ]}
              >
                {tab.toUpperCase()}
              </Text>
            </TactileButton>
          ))}

          {/* Smart Quick Filters */}
          <TactileButton
            onPress={() => setFavoritesOnly(!favoritesOnly)}
            style={[
              styles.smartPill,
              {
                backgroundColor: favoritesOnly ? `${theme.danger}25` : theme.surfaceLight,
                borderColor: favoritesOnly ? theme.danger : theme.surfaceBorder,
              },
            ]}
          >
            <Ionicons
              name={favoritesOnly ? 'heart' : 'heart-outline'}
              size={14}
              color={favoritesOnly ? theme.danger : theme.textTertiary}
            />
            <Text
              style={[
                styles.smartPillText,
                { color: favoritesOnly ? theme.danger : theme.textTertiary },
              ]}
            >
              Favorites
            </Text>
          </TactileButton>

          <TactileButton
            onPress={() => setLongOnly(!longOnly)}
            style={[
              styles.smartPill,
              {
                backgroundColor: longOnly ? `${theme.accent}25` : theme.surfaceLight,
                borderColor: longOnly ? theme.accent : theme.surfaceBorder,
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={longOnly ? theme.accent : theme.textTertiary}
            />
            <Text
              style={[
                styles.smartPillText,
                { color: longOnly ? theme.accent : theme.textTertiary },
              ]}
            >
              &gt; 3 mins
            </Text>
          </TactileButton>
        </ScrollView>
      </View>

      {/* Search Results Content */}
      <FlatList
        data={scope === 'albums' || scope === 'artists' ? [] : filtered.tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Matching Artists Section */}
            {(scope === 'all' || scope === 'artists') && filtered.artists.length > 0 && (
              <View style={styles.artistsCarouselSection}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  ARTISTS ({filtered.artists.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.artistCarousel}>
                  {filtered.artists.slice(0, 10).map((artist) => (
                    <TactileButton
                      key={artist.name}
                      onPress={() => onSelectArtist(artist)}
                      style={[styles.artistBubble, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                    >
                      <View style={[styles.artistAvatar, { backgroundColor: theme.surfaceLight }]}>
                        {artist.artwork ? (
                          <Image source={{ uri: artist.artwork }} style={styles.avatarImg} />
                        ) : (
                          <Ionicons name="person" size={24} color={theme.accent} />
                        )}
                      </View>
                      <Text style={[styles.artistBubbleName, { color: theme.textPrimary }]} numberOfLines={1}>
                        {artist.name}
                      </Text>
                    </TactileButton>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Matching Albums Section */}
            {(scope === 'all' || scope === 'albums') && filtered.albums.length > 0 && (
              <View style={styles.albumsCarouselSection}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  ALBUMS ({filtered.albums.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.albumCarousel}>
                  {filtered.albums.slice(0, 10).map((album) => (
                    <TactileButton
                      key={album.id}
                      onPress={() => onSelectAlbum(album)}
                      style={[styles.albumBubble, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                    >
                      <View style={[styles.albumSquare, { backgroundColor: theme.surfaceLight }]}>
                        {album.artwork ? (
                          <Image source={{ uri: album.artwork }} style={styles.albumImg} />
                        ) : (
                          <Ionicons name="disc" size={26} color={theme.accent} />
                        )}
                      </View>
                      <Text style={[styles.albumBubbleTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                        {album.name}
                      </Text>
                      <Text style={[styles.albumBubbleArtist, { color: theme.textTertiary }]} numberOfLines={1}>
                        {album.artist}
                      </Text>
                    </TactileButton>
                  ))}
                </ScrollView>
              </View>
            )}

            {(scope === 'all' || scope === 'tracks') && filtered.tracks.length > 0 && (
              <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 12 }]}>
                TRACKS ({filtered.tracks.length})
              </Text>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <TrackListItem
            track={item}
            index={index}
            isCurrent={currentTrackId === item.id}
            isPlaying={isPlaying}
            theme={theme}
            onPress={() => onPlayTrack(item, filtered.tracks)}
            onToggleFavorite={onToggleFavorite}
            onPlayNext={onPlayNext}
            onAddToQueue={onAddToQueue}
            onAddToPlaylist={onAddToPlaylist}
            onEditTags={onEditTags}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={50} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              {query ? 'No matching audio found' : 'Search your entire offline library'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
              {query ? 'Try different keywords or reset filters.' : 'Find tracks, albums, artists, or genres instantly.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterSection: {
    paddingBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  scopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  scopeChipText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  smartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  smartPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  artistsCarouselSection: {
    marginVertical: 10,
  },
  albumsCarouselSection: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  artistCarousel: {
    gap: 12,
  },
  artistBubble: {
    width: 90,
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  artistAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  artistBubbleName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  albumCarousel: {
    gap: 12,
  },
  albumBubble: {
    width: 104,
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  albumSquare: {
    width: 88,
    height: 88,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  albumImg: {
    width: '100%',
    height: '100%',
  },
  albumBubbleTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  albumBubbleArtist: {
    fontSize: 10,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
