import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer, LibrarySubTab } from '../context/MusicPlayerContext';
import { TactileButton } from '../components/TactileButton';
import { TrackListItem } from '../components/TrackListItem';
import { AlbumsView } from '../components/AlbumsView';
import { GenresView } from '../components/GenresView';
import { PixelArtworkFallback } from '../components/PixelArtworkFallback';
import { formatFileSize } from '@/src/utils/formatters';
import { LordiconAnimatedIcon } from '../components/LordiconAnimatedIcon';
import { LordiconIconName } from '../../assets/lordicon';

const HeroEqualizerBars: React.FC<{ isPlaying: boolean; color: string }> = ({ isPlaying, color }) => {
  const anim1 = useRef(new Animated.Value(0.3)).current;
  const anim2 = useRef(new Animated.Value(0.7)).current;
  const anim3 = useRef(new Animated.Value(0.4)).current;
  const anim4 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!isPlaying) {
      anim1.setValue(0.2);
      anim2.setValue(0.3);
      anim3.setValue(0.2);
      anim4.setValue(0.3);
      return;
    }

    const createPulse = (val: Animated.Value, min: number, max: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: max,
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: min,
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: false,
          }),
        ])
      );
    };

    const a1 = createPulse(anim1, 0.2, 1.0, 360);
    const a2 = createPulse(anim2, 0.15, 0.85, 440);
    const a3 = createPulse(anim3, 0.3, 0.95, 300);
    const a4 = createPulse(anim4, 0.2, 0.8, 480);

    Animated.parallel([a1, a2, a3, a4]).start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
      a4.stop();
    };
  }, [isPlaying]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 14, gap: 2.5 }}>
      {[anim1, anim2, anim3, anim4].map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            width: 3,
            backgroundColor: color,
            borderRadius: 1.5,
            height: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [3, 14],
            }),
          }}
        />
      ))}
    </View>
  );
};

const SUB_TABS: { key: LibrarySubTab; label: string; icon: keyof typeof Ionicons.glyphMap; lordiconName?: LordiconIconName }[] = [
  { key: 'tracks', label: 'Tracks', icon: 'musical-notes', lordiconName: 'music' },
  { key: 'albums', label: 'Albums', icon: 'disc', lordiconName: 'playlist' },
  { key: 'artists', label: 'Artists', icon: 'people' },
  { key: 'folders', label: 'Folders', icon: 'folder' },
  { key: 'genres', label: 'Genres', icon: 'grid' },
  { key: 'favorites', label: 'Favorites', icon: 'heart', lordiconName: 'heart' },
];

export default function LibraryTab() {
  const {
    theme,
    tracks,
    isLoading,
    playbackState,
    librarySubTab,
    setLibrarySubTab,
    selectedFolder,
    setSelectedFolder,
    albums,
    artists,
    genres,
    folders,
    libraryTracks,
    totalDurationMinutes,
    setSelectedAlbum,
    setSelectedArtist,
    setSelectedGenre,
    handlePlayTrack,
    handlePlayAll,
    handlePlayNext,
    handleAddToQueue,
    handleAddToPlaylist,
    handleEditTags,
    handleToggleFavorite,
    handleScanDevice,
    handlePickFiles,
    setThemeSwitcherOpen,
    setNowPlayingOpen,
    player,
  } = useMusicPlayer();

  const currentOrHeroTrack = playbackState.currentTrack || (tracks.length > 0 ? tracks[0] : null);
  const isCurrentHeroPlaying = playbackState.isPlaying && playbackState.currentTrack?.id === currentOrHeroTrack?.id;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.brandBadgeRow}>
            <View style={[styles.brandBadge, { backgroundColor: `${theme.accent}1A` }]}>
              <Text style={[styles.brandBadgeText, { color: theme.accent }]}>
                MATERIAL YOU GUI
              </Text>
            </View>
          </View>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
            Local Music
          </Text>
        </View>

        <View style={styles.headerButtonsRow}>
          <TactileButton
            onPress={() => setThemeSwitcherOpen(true)}
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
          >
            <Ionicons name="color-palette-outline" size={20} color={theme.accent} />
          </TactileButton>

          <TactileButton
            onPress={handlePickFiles}
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
          >
            <Ionicons name="folder-open-outline" size={20} color={theme.accent} />
          </TactileButton>

          <TactileButton
            onPress={handleScanDevice}
            style={[styles.headerIconBtn, { backgroundColor: theme.surfaceLight }]}
          >
            <Ionicons name="scan-outline" size={20} color={theme.textPrimary} />
          </TactileButton>
        </View>
      </View>

      {/* Screen Content */}
      <View style={styles.mainContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Scanning storage & audio files...
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {/* Graphical Quick-Play Hero Stage */}
            {currentOrHeroTrack && (
              <TactileButton
                onPress={() => setNowPlayingOpen(true)}
                activeScale={0.98}
                style={styles.heroCardWrapper}
              >
                <View
                  style={[
                    styles.heroCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.surfaceBorder,
                    },
                  ]}
                >
                  <View style={styles.heroArtContainer}>
                    {currentOrHeroTrack.artwork ? (
                      <Image
                        source={{ uri: currentOrHeroTrack.artwork }}
                        style={styles.heroArtImage}
                      />
                    ) : (
                      <PixelArtworkFallback
                        seed={currentOrHeroTrack.title}
                        size={56}
                        cornerRadius={14}
                      />
                    )}
                  </View>

                  <View style={styles.heroInfoCol}>
                    <View style={styles.heroTagRow}>
                      <View
                        style={[
                          styles.heroBadge,
                          { backgroundColor: `${theme.accent}18` },
                        ]}
                      >
                        <Text style={[styles.heroBadgeText, { color: theme.accent }]}>
                          {playbackState.currentTrack ? 'NOW PLAYING' : 'QUICK START'}
                        </Text>
                      </View>
                      {isCurrentHeroPlaying && (
                        <HeroEqualizerBars isPlaying={true} color={theme.accent} />
                      )}
                    </View>

                    <Text style={[styles.heroTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {currentOrHeroTrack.title}
                    </Text>
                    <Text style={[styles.heroArtist, { color: theme.textSecondary }]} numberOfLines={1}>
                      {currentOrHeroTrack.artist} • {currentOrHeroTrack.album}
                    </Text>
                  </View>

                  <TactileButton
                    onPress={() => {
                      if (playbackState.currentTrack?.id === currentOrHeroTrack.id) {
                        player.togglePlayPause();
                      } else {
                        handlePlayTrack(currentOrHeroTrack, libraryTracks);
                      }
                    }}
                    activeScale={0.90}
                    style={[styles.heroPlayBtn, { backgroundColor: theme.accent }]}
                  >
                    {isCurrentHeroPlaying ? (
                      <Ionicons
                        name="pause"
                        size={22}
                        color={theme.background}
                      />
                    ) : (
                      <LordiconAnimatedIcon
                        name="play"
                        size={22}
                        color={theme.background}
                        trigger="click"
                        fallbackIcon="play"
                      />
                    )}
                  </TactileButton>
                </View>
              </TactileButton>
            )}

            {/* Material You Filter Chips Ribbon */}
            <View style={styles.subTabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subTabsRow}
              >
                {SUB_TABS.map((item) => {
                  const isActive = librarySubTab === item.key;
                  return (
                    <TactileButton
                      key={item.key}
                      onPress={() => {
                        setLibrarySubTab(item.key);
                        setSelectedFolder(null);
                      }}
                      activeScale={0.95}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: isActive ? theme.accent : theme.surface,
                          borderColor: isActive ? theme.accent : theme.surfaceBorder,
                        },
                      ]}
                    >
                      {item.lordiconName ? (
                        <LordiconAnimatedIcon
                          name={item.lordiconName}
                          size={15}
                          color={isActive ? theme.background : theme.textSecondary}
                          focused={isActive}
                          trigger="playOnFocus"
                          fallbackIcon={item.icon}
                        />
                      ) : (
                        <Ionicons
                          name={item.icon}
                          size={14}
                          color={isActive ? theme.background : theme.textSecondary}
                        />
                      )}
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isActive ? theme.background : theme.textPrimary,
                            fontWeight: isActive ? '700' : '500',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TactileButton>
                  );
                })}
              </ScrollView>
            </View>

            {/* Breadcrumb if inside a selected folder */}
            {selectedFolder && (
              <View style={styles.breadcrumbBar}>
                <TactileButton
                  onPress={() => setSelectedFolder(null)}
                  style={styles.breadcrumbBtn}
                >
                  <Ionicons name="arrow-back" size={16} color={theme.accent} />
                  <Text style={[styles.breadcrumbText, { color: theme.accent }]}>
                    All Folders
                  </Text>
                </TactileButton>
                <Text style={[styles.breadcrumbCurrent, { color: theme.textPrimary }]} numberOfLines={1}>
                  {selectedFolder}
                </Text>
              </View>
            )}

            {/* Library Stats / Quick Shuffle Bar */}
            <View style={styles.statsBar}>
              <Text style={[styles.statsText, { color: theme.textTertiary }]}>
                {tracks.length} tracks • {totalDurationMinutes} mins total
              </Text>
              <TactileButton
                onPress={() => handlePlayAll(libraryTracks, true)}
                style={styles.shuffleAllBtn}
              >
                <Ionicons name="shuffle" size={14} color={theme.accent} />
                <Text style={[styles.shuffleAllText, { color: theme.accent }]}>Shuffle All</Text>
              </TactileButton>
            </View>

            {/* Sub-tab view switch */}
            {librarySubTab === 'albums' ? (
              <AlbumsView
                albums={albums}
                theme={theme}
                onSelectAlbum={(alb: any) => setSelectedAlbum(alb)}
              />
            ) : librarySubTab === 'genres' ? (
              <GenresView
                genres={genres}
                theme={theme}
                onSelectGenre={(gen: any) => setSelectedGenre(gen)}
              />
            ) : librarySubTab === 'artists' ? (
              /* Artists List */
              <FlatList
                data={artists}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <TactileButton
                    onPress={() => setSelectedArtist(item)}
                    style={[
                      styles.folderCard,
                      { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
                    ]}
                  >
                    <View style={[styles.folderIconBox, { backgroundColor: theme.surfaceLight }]}>
                      <Ionicons name="person" size={24} color={theme.accent} />
                    </View>
                    <View style={styles.folderInfoCol}>
                      <Text style={[styles.folderTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.folderMeta, { color: theme.textSecondary }]}>
                        {item.trackCount} {item.trackCount === 1 ? 'song' : 'songs'} • {item.albumCount} {item.albumCount === 1 ? 'album' : 'albums'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
                  </TactileButton>
                )}
              />
            ) : librarySubTab === 'folders' && !selectedFolder ? (
              /* Folders List */
              <FlatList
                data={folders}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <TactileButton
                    onPress={() => setSelectedFolder(item.name)}
                    style={[
                      styles.folderCard,
                      { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
                    ]}
                  >
                    <View style={[styles.folderIconBox, { backgroundColor: theme.surfaceLight }]}>
                      <Ionicons name="folder" size={24} color={theme.accent} />
                    </View>
                    <View style={styles.folderInfoCol}>
                      <Text style={[styles.folderTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.folderMeta, { color: theme.textSecondary }]}>
                        {item.count} {item.count === 1 ? 'track' : 'tracks'} {item.size > 0 ? `• ${formatFileSize(item.size)}` : ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
                  </TactileButton>
                )}
              />
            ) : (
              /* Tracks & Favorites FlatList */
              <FlatList
                data={libraryTracks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item, index }) => (
                  <TrackListItem
                    track={item}
                    index={index}
                    isCurrent={playbackState.currentTrack?.id === item.id}
                    isPlaying={playbackState.isPlaying}
                    theme={theme}
                    onPress={() => handlePlayTrack(item, libraryTracks)}
                    onToggleFavorite={handleToggleFavorite}
                    onPlayNext={handlePlayNext}
                    onAddToQueue={handleAddToQueue}
                    onAddToPlaylist={handleAddToPlaylist}
                    onEditTags={handleEditTags}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="musical-notes-outline" size={54} color={theme.textTertiary} />
                    <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                      {librarySubTab === 'favorites' ? 'No favorites yet' : 'No local music found'}
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                      {librarySubTab === 'favorites'
                        ? 'Tap the heart icon on any song to add it to your favorites.'
                        : 'Tap "Pick Audio Files" or grant storage permissions to scan your device.'}
                    </Text>
                    {librarySubTab !== 'favorites' && (
                      <TactileButton
                        onPress={handlePickFiles}
                        style={[styles.emptyPickBtn, { backgroundColor: theme.accent }]}
                      >
                        <Text style={[styles.emptyPickBtnText, { color: theme.background }]}>
                          Pick Audio Files
                        </Text>
                      </TactileButton>
                    )}
                  </View>
                }
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  brandBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  brandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  brandBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCardWrapper: {
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 2,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  heroArtContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroArtImage: {
    width: '100%',
    height: '100%',
  },
  heroInfoCol: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  heroBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heroArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  heroPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subTabsContainer: {
    paddingVertical: 4,
  },
  subTabsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  breadcrumbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '600',
  },
  breadcrumbCurrent: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  shuffleAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  shuffleAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 160,
  },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 14,
  },
  folderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderInfoCol: {
    flex: 1,
  },
  folderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  folderMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyPickBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 12,
  },
  emptyPickBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
