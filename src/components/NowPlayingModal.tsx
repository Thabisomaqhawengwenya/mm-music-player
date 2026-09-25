import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track, PlaybackState, AppTheme } from '../types';
import { AudioPlayerService } from '../services/audioPlayer';
import { StorageService } from '../services/playlistStorage';
import { TactileButton } from './TactileButton';
import { formatTime } from '../utils/formatters';

interface NowPlayingModalProps {
  visible: boolean;
  onClose: () => void;
  playbackState: PlaybackState;
  theme: AppTheme;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
  onOpenQueue: () => void;
  onOpenTagEditor: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(SCREEN_WIDTH - 64, 320);

export const NowPlayingModal: React.FC<NowPlayingModalProps> = ({
  visible,
  onClose,
  playbackState,
  theme,
  onOpenEqualizer,
  onOpenSleepTimer,
  onOpenQueue,
  onOpenTagEditor,
  onToggleFavorite,
}) => {
  const player = AudioPlayerService.getInstance();
  const track = playbackState.currentTrack;

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);

  // Artwork pulsing / rotation animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (playbackState.isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.025,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [playbackState.isPlaying]);

  const currentPos = isScrubbing ? scrubPosition : playbackState.position;
  const duration = playbackState.duration || 1;
  const progressPercent = Math.min(100, Math.max(0, (currentPos / duration) * 100));

  // Scrubber bar touch responder
  const barWidth = SCREEN_WIDTH - 48;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsScrubbing(true);
        const touchX = Math.max(0, Math.min(barWidth, evt.nativeEvent.locationX));
        const newSec = (touchX / barWidth) * (playbackState.duration || 1);
        setScrubPosition(newSec);
      },
      onPanResponderMove: (evt, gestureState) => {
        const touchX = Math.max(0, Math.min(barWidth, evt.nativeEvent.locationX));
        const newSec = (touchX / barWidth) * (playbackState.duration || 1);
        setScrubPosition(newSec);
      },
      onPanResponderRelease: async (evt) => {
        const touchX = Math.max(0, Math.min(barWidth, evt.nativeEvent.locationX));
        const finalSec = (touchX / barWidth) * (playbackState.duration || 1);
        await player.seekTo(finalSec);
        setIsScrubbing(false);
      },
    })
  ).current;

  // Sleep timer remaining countdown
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setSleepRemaining(player.getSleepTimerRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [showLyrics, setShowLyrics] = useState(false);
  const [volume, setVolume] = useState(playbackState.volume ?? 1.0);

  // 14 animated visualizer bars
  const visualizerAnims = useRef(
    Array.from({ length: 14 }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (playbackState.isPlaying) {
      const parallel = visualizerAnims.map((anim) =>
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 180 + Math.random() * 150,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: Math.random() * 0.3 + 0.15,
            duration: 180 + Math.random() * 150,
            useNativeDriver: true,
          }),
        ])
      );
      animLoop = Animated.loop(Animated.parallel(parallel));
      animLoop.start();
    } else {
      visualizerAnims.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.15,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }

    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [playbackState.isPlaying]);

  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    player.setVolume(clamped);
  };

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
  const nextSpeed = () => {
    const currentIdx = speeds.indexOf(playbackState.playbackSpeed);
    const nextIdx = (currentIdx + 1) % speeds.length;
    player.setPlaybackSpeed(speeds[nextIdx]);
  };

  if (!track) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="light-content" />

        {/* Top Header */}
        <View style={styles.header}>
          <TactileButton onPress={onClose} style={styles.headerButton}>
            <Ionicons name="chevron-down" size={26} color={theme.textPrimary} />
          </TactileButton>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerSubtitle, { color: theme.textTertiary }]}>
              NOW PLAYING
            </Text>
            <Text style={[styles.headerFolder, { color: theme.textSecondary }]} numberOfLines={1}>
              {track.folder || 'Local Storage'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Lyrics toggle button */}
            <TactileButton
              onPress={() => setShowLyrics(!showLyrics)}
              style={styles.headerButton}
            >
              <Ionicons
                name={showLyrics ? 'disc-outline' : 'chatbubble-ellipses-outline'}
                size={22}
                color={showLyrics ? theme.accent : theme.textSecondary}
              />
            </TactileButton>

            {/* Tag Editor button */}
            <TactileButton
              onPress={() => onOpenTagEditor(track)}
              style={styles.headerButton}
            >
              <Ionicons name="create-outline" size={22} color={theme.textSecondary} />
            </TactileButton>
          </View>
        </View>

        {/* Center Artwork or Lyrics Container */}
        <View style={styles.artworkSection}>
          {showLyrics ? (
            <View
              style={[
                styles.lyricsCard,
                {
                  width: ARTWORK_SIZE,
                  height: ARTWORK_SIZE,
                  backgroundColor: theme.surface,
                  borderColor: theme.surfaceBorder,
                },
              ]}
            >
              <View style={styles.lyricsCardHeader}>
                <Ionicons name="musical-notes" size={16} color={theme.accent} />
                <Text style={[styles.lyricsCardTitle, { color: theme.accent }]}>LYRICS</Text>
              </View>
              <ScrollView style={styles.lyricsScroll} showsVerticalScrollIndicator={false}>
                {track.lyrics ? (
                  <Text style={[styles.lyricsText, { color: theme.textPrimary }]}>
                    {track.lyrics}
                  </Text>
                ) : (
                  <View style={styles.lyricsPlaceholder}>
                    <Text style={[styles.lyricsLeadLine, { color: theme.textPrimary }]}>
                      {track.title}
                    </Text>
                    <Text style={[styles.lyricsSubLine, { color: theme.textSecondary }]}>
                      {track.artist}
                    </Text>
                    <Text style={[styles.lyricsHint, { color: theme.textTertiary }]}>
                      Embedded offline ID3 lyrics not detected in this file.{'\n\n'}Tap the pencil icon in the top header to edit tags and attach custom lyrics.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.artworkCard,
                {
                  width: ARTWORK_SIZE,
                  height: ARTWORK_SIZE,
                  borderColor: theme.surfaceBorder,
                  shadowColor: theme.accent,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              {track.artwork ? (
                <Image source={{ uri: track.artwork }} style={styles.artworkImage} />
              ) : (
                <View style={[styles.artworkPlaceholder, { backgroundColor: theme.surface }]}>
                  <Ionicons name="disc" size={96} color={theme.accent} />
                  <Text style={[styles.audioPill, { color: theme.accent, borderColor: theme.accent }]}>
                    HI-RES AUDIO
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </View>

        {/* Dynamic Spectrum Audio Visualizer Bars */}
        <View style={styles.visualizerRow}>
          {visualizerAnims.map((anim, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.visualizerBar,
                {
                  backgroundColor: theme.accent,
                  transform: [{ scaleY: anim }],
                },
              ]}
            />
          ))}
        </View>

        {/* Track Details & Favorite */}
        <View style={styles.metaRow}>
          <View style={styles.metaTextCol}>
            <Text style={[styles.trackTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {track.title}
            </Text>
            <Text style={[styles.trackArtist, { color: theme.textSecondary }]} numberOfLines={1}>
              {track.artist}
            </Text>
            <Text style={[styles.trackAlbum, { color: theme.textTertiary }]} numberOfLines={1}>
              {track.album} {track.year ? `• ${track.year}` : ''}
            </Text>
          </View>

          <TactileButton
            onPress={() => onToggleFavorite(track.id)}
            style={styles.favButton}
          >
            <Ionicons
              name={track.isFavorite ? 'heart' : 'heart-outline'}
              size={26}
              color={track.isFavorite ? theme.danger : theme.textTertiary}
            />
          </TactileButton>
        </View>

        {/* Scrubber Progress Bar */}
        <View style={styles.scrubberContainer}>
          <View
            style={[styles.scrubberTrack, { backgroundColor: theme.surfaceLight }]}
            {...panResponder.panHandlers}
          >
            <View
              style={[
                styles.scrubberProgress,
                { width: `${progressPercent}%`, backgroundColor: theme.accent },
              ]}
            />
            <View
              style={[
                styles.scrubberThumb,
                {
                  left: `${progressPercent}%`,
                  backgroundColor: theme.textPrimary,
                  borderColor: theme.accent,
                },
              ]}
            />
          </View>

          <View style={styles.timeRow}>
            <Text style={[styles.timeText, { color: theme.textTertiary }]}>
              {formatTime(currentPos)}
            </Text>
            <Text style={[styles.timeText, { color: theme.textTertiary }]}>
              {formatTime(playbackState.duration)}
            </Text>
          </View>
        </View>

        {/* Main Controls Row */}
        <View style={styles.mainControlsRow}>
          <TactileButton
            onPress={() => player.toggleShuffle()}
            style={styles.iconControl}
          >
            <Ionicons
              name="shuffle"
              size={22}
              color={playbackState.isShuffled ? theme.accent : theme.textTertiary}
            />
          </TactileButton>

          <TactileButton
            onPress={() => player.previous()}
            style={styles.iconControl}
          >
            <Ionicons name="play-skip-back" size={28} color={theme.textPrimary} />
          </TactileButton>

          <TactileButton
            onPress={() => player.togglePlayPause()}
            style={[styles.playHeroButton, { backgroundColor: theme.accent }]}
            activeScale={0.92}
          >
            <Ionicons
              name={playbackState.isPlaying ? 'pause' : 'play'}
              size={32}
              color={theme.background}
            />
          </TactileButton>

          <TactileButton
            onPress={() => player.next()}
            style={styles.iconControl}
          >
            <Ionicons name="play-skip-forward" size={28} color={theme.textPrimary} />
          </TactileButton>

          <TactileButton
            onPress={() => player.toggleRepeatMode()}
            style={styles.iconControl}
          >
            <Ionicons
              name="repeat"
              size={22}
              color={playbackState.repeatMode !== 'off' ? theme.accent : theme.textTertiary}
            />
            {playbackState.repeatMode === 'one' && (
              <View style={[styles.repeatBadge, { backgroundColor: theme.accent }]}>
                <Text style={[styles.repeatBadgeText, { color: theme.background }]}>1</Text>
              </View>
            )}
          </TactileButton>
        </View>

        {/* Software Volume Bar */}
        <View style={styles.volumeRow}>
          <TactileButton
            onPress={() => handleVolumeChange(volume === 0 ? 0.8 : 0)}
            style={styles.volumeIconBtn}
          >
            <Ionicons
              name={volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-low' : 'volume-medium'}
              size={18}
              color={theme.textTertiary}
            />
          </TactileButton>

          <View style={[styles.volumeBarTrack, { backgroundColor: theme.surfaceLight }]}>
            <View
              style={[
                styles.volumeBarProgress,
                { width: `${volume * 100}%`, backgroundColor: theme.accent },
              ]}
            />
          </View>

          <TactileButton
            onPress={() => handleVolumeChange(1.0)}
            style={styles.volumeIconBtn}
          >
            <Ionicons name="volume-high" size={18} color={theme.textTertiary} />
          </TactileButton>
        </View>

        {/* Bottom Utility Bar */}
        <View style={[styles.bottomToolBar, { borderTopColor: theme.surfaceBorder }]}>
          {/* Speed Pill */}
          <TactileButton
            onPress={nextSpeed}
            style={[styles.toolPill, { backgroundColor: theme.surfaceLight }]}
          >
            <Text style={[styles.toolPillText, { color: theme.accent }]}>
              {playbackState.playbackSpeed}x
            </Text>
          </TactileButton>

          {/* Equalizer */}
          <TactileButton onPress={onOpenEqualizer} style={styles.toolIconBtn}>
            <Ionicons name="options-outline" size={22} color={theme.textSecondary} />
          </TactileButton>

          {/* Sleep Timer */}
          <TactileButton onPress={onOpenSleepTimer} style={styles.toolIconBtn}>
            <Ionicons
              name="moon-outline"
              size={22}
              color={sleepRemaining ? theme.accent : theme.textSecondary}
            />
            {sleepRemaining !== null && (
              <Text style={[styles.timerCountdownText, { color: theme.accent }]}>
                {formatTime(sleepRemaining)}
              </Text>
            )}
          </TactileButton>

          {/* Queue */}
          <TactileButton onPress={onOpenQueue} style={styles.toolIconBtn}>
            <Ionicons name="list" size={22} color={theme.textSecondary} />
          </TactileButton>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerFolder: {
    fontSize: 12,
    marginTop: 2,
  },
  artworkSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  artworkCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  artworkPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPill: {
    marginTop: 16,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 4,
  },
  metaTextCol: {
    flex: 1,
    marginRight: 16,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  trackArtist: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  trackAlbum: {
    fontSize: 13,
    marginTop: 2,
  },
  favButton: {
    padding: 8,
  },
  scrubberContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  scrubberTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  scrubberProgress: {
    height: 8,
    borderRadius: 4,
  },
  scrubberThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginLeft: -8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  mainControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    marginVertical: 12,
  },
  iconControl: {
    padding: 12,
    position: 'relative',
  },
  playHeroButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  repeatBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  bottomToolBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  toolPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  toolPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toolIconBtn: {
    padding: 8,
    alignItems: 'center',
  },
  timerCountdownText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  lyricsCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    overflow: 'hidden',
  },
  lyricsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  lyricsCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  lyricsScroll: {
    flex: 1,
  },
  lyricsText: {
    fontSize: 16,
    lineHeight: 28,
    fontWeight: '600',
  },
  lyricsPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  lyricsLeadLine: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  lyricsSubLine: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  lyricsHint: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 12,
  },
  visualizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 24,
    marginVertical: 4,
  },
  visualizerBar: {
    width: 3,
    height: 22,
    borderRadius: 1.5,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 12,
    marginVertical: 4,
  },
  volumeIconBtn: {
    padding: 4,
  },
  volumeBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeBarProgress: {
    height: '100%',
    borderRadius: 2,
  },
});
