import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  Animated,
  PanResponder,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import {
  Track,
  PlaybackState,
  AppTheme,
  PetSettings,
  PlayerCustomizationSettings,
  PlayerBackgroundType,
  CharacterEmotion,
} from '../types';
import { AudioPlayerService } from '../services/audioPlayer';
import { StorageService } from '../services/playlistStorage';
import { TactileButton } from './TactileButton';
import { formatTime } from '../utils/formatters';
import { MusicPet } from '../pet/MusicPet';
import { WaveformScrubber } from './WaveformScrubber';
import { InteractiveLyricsView } from './InteractiveLyricsView';
import { InteractiveTurntableDeck } from './InteractiveTurntableDeck';
import { DynamicVisualizerStage } from './DynamicVisualizerStage';
import { DjQuickFxModal } from './DjQuickFxModal';

interface NowPlayingModalProps {
  visible: boolean;
  onClose: () => void;
  playbackState: PlaybackState;
  theme: AppTheme;
  petSettings?: PetSettings;
  playerCustomization: PlayerCustomizationSettings;
  onUpdatePlayerCustomization: (settings: Partial<PlayerCustomizationSettings>) => void;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
  onOpenQueue: () => void;
  onOpenTagEditor: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
  onNavigateToTab?: (tab: 'library' | 'playlists' | 'vibes' | 'settings', subTab?: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ARTWORK_SIZE = Math.min(SCREEN_WIDTH - 80, SCREEN_HEIGHT < 750 ? 190 : 225);

export const NowPlayingModal: React.FC<NowPlayingModalProps> = ({
  visible,
  onClose,
  playbackState,
  theme,
  petSettings,
  playerCustomization,
  onUpdatePlayerCustomization,
  onOpenEqualizer,
  onOpenSleepTimer,
  onOpenQueue,
  onOpenTagEditor,
  onToggleFavorite,
  onNavigateToTab,
}) => {
  const player = AudioPlayerService.getInstance();
  const track = playbackState.currentTrack;

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [djFxModalOpen, setDjFxModalOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [mascotEmotion, setMascotEmotion] = useState<CharacterEmotion | null>(null);
  const [volume, setVolume] = useState(playbackState.volume ?? 1.0);

  // Sync volume state from playback
  useEffect(() => {
    setVolume(playbackState.volume ?? 1.0);
  }, [playbackState.volume]);

  // Dynamic emotional response to volume: 0 volume makes mascot sad
  useEffect(() => {
    if (volume === 0) {
      setMascotEmotion('sad');
    } else if (isScrubbing) {
      setMascotEmotion('focused');
    } else if (playbackState.isPlaying) {
      setMascotEmotion(null); // let engine determine dancing / happy
    } else {
      setMascotEmotion('relaxed');
    }
  }, [volume, isScrubbing, playbackState.isPlaying]);

  // Artwork pulsing animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (playbackState.isPlaying && playerCustomization?.enableArtworkAnimation) {
      const loop = Animated.loop(
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
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [playbackState.isPlaying, playerCustomization?.enableArtworkAnimation]);

  // Volume Bar touch & pan responder
  const volumeBarWidth = SCREEN_WIDTH - 120;
  const volumePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouchVolume(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleTouchVolume(evt.nativeEvent.locationX);
      },
    })
  ).current;

  const handleTouchVolume = (locationX: number) => {
    const clampedRatio = Math.max(0, Math.min(1, locationX / volumeBarWidth));
    handleVolumeChange(clampedRatio);
  };

  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    player.setVolume(clamped);
  };

  const handlePickCustomBackground = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets[0]?.uri) {
        onUpdatePlayerCustomization({
          backgroundType: 'custom',
          customImageUri: res.assets[0].uri,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to pick custom background image:', e);
    }
  };

  if (!track) return null;

  // Render Background environment
  const renderBackgroundLayer = () => {
    const bgType = playerCustomization?.backgroundType || 'default';

    if (bgType === 'custom' && playerCustomization?.customImageUri) {
      return (
        <ImageBackground
          source={{ uri: playerCustomization.customImageUri }}
          blurRadius={playerCustomization.backgroundBlur ?? 10}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `rgba(0, 0, 0, ${playerCustomization.backgroundDim ?? 0.65})` },
            ]}
          />
        </ImageBackground>
      );
    }

    if (bgType === 'aurora') {
      return (
        <LinearGradient
          colors={['#050C16', '#062024', '#083832', '#06131E']}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        >
          {playerCustomization?.enableBackgroundAmbiance && (
            <View style={styles.auroraGlowHaze} />
          )}
        </LinearGradient>
      );
    }

    if (bgType === 'sunset') {
      return (
        <LinearGradient
          colors={['#0B0715', '#240B28', '#3D1533', '#150820']}
          locations={[0, 0.35, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        >
          {playerCustomization?.enableBackgroundAmbiance && (
            <View style={styles.sunsetGlowHaze} />
          )}
        </LinearGradient>
      );
    }

    if (bgType === 'cyber') {
      return (
        <LinearGradient
          colors={['#05060E', '#0B1028', '#160E36', '#080816']}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        >
          {playerCustomization?.enableBackgroundAmbiance && (
            <View style={styles.cyberGridOverlay} />
          )}
        </LinearGradient>
      );
    }

    if (bgType === 'tokyo_rain') {
      return (
        <LinearGradient
          colors={['#060914', '#0A1428', '#0D203C', '#070D1B']}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      );
    }

    // Default OLED Dark
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background }]} />;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenRoot}>
        {renderBackgroundLayer()}

        <SafeAreaView style={styles.safeArea}>
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
              {/* Personalize Player Space Button */}
              <TactileButton
                onPress={() => setCustomizerOpen(true)}
                style={styles.headerButton}
              >
                <Ionicons name="color-palette-outline" size={21} color={theme.accent} />
              </TactileButton>

              {/* Lyrics Toggle */}
              <TactileButton
                onPress={() => setShowLyrics(!showLyrics)}
                style={styles.headerButton}
              >
                <Ionicons
                  name={showLyrics ? 'disc-outline' : 'chatbubble-ellipses-outline'}
                  size={21}
                  color={showLyrics ? theme.accent : theme.textSecondary}
                />
              </TactileButton>

              {/* More Actions Menu */}
              <TactileButton
                onPress={() => setMoreMenuOpen(true)}
                style={styles.headerButton}
              >
                <Ionicons name="ellipsis-vertical" size={21} color={theme.textPrimary} />
              </TactileButton>
            </View>
          </View>

          {/* Center Stage: Turntable / Artwork / Lyrics */}
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
                <InteractiveLyricsView
                  track={track}
                  currentPosition={playbackState.position}
                  duration={playbackState.duration}
                  theme={theme}
                  onSeek={(sec) => player.seekTo(sec)}
                  onSaveLyrics={async (newLyrics) => {
                    await StorageService.saveTrackMetadataOverride(track.id, { lyrics: newLyrics });
                    track.lyrics = newLyrics;
                  }}
                />
              </View>
            ) : (
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <InteractiveTurntableDeck
                  track={track}
                  isPlaying={playbackState.isPlaying}
                  theme={theme}
                  size={ARTWORK_SIZE}
                  onNext={() => player.next()}
                  onPrevious={() => player.previous()}
                  onScratchDelta={(deltaSec) => {
                    const target = Math.max(0, Math.min(playbackState.duration, playbackState.position + deltaSec));
                    player.seekTo(target);
                  }}
                />
              </Animated.View>
            )}
          </View>

          {/* 2D Expressive Mascot & Visualizer */}
          <View style={styles.petAndVisualizerContainer}>
            {playerCustomization?.enableCharacter && (
              <View style={styles.nowPlayingPetStage}>
                <MusicPet
                  playbackState={playbackState}
                  theme={theme}
                  avatar={petSettings?.avatar || 'human_aria'}
                  accessory={petSettings?.accessory}
                  affection={petSettings?.affection}
                  motionEnabled={playerCustomization?.enableCharacterMotion}
                  size="compact"
                  emotionOverride={mascotEmotion}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setMascotEmotion(mascotEmotion === 'happy' ? 'excited' : 'happy');
                    setTimeout(() => setMascotEmotion(null), 2500);
                  }}
                />
              </View>
            )}

            {playerCustomization?.enableVisualizer && (
              <DynamicVisualizerStage
                isPlaying={playbackState.isPlaying}
                theme={theme}
              />
            )}
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

          {/* Tactile Waveform Scrubber */}
          <View style={styles.waveformContainer}>
            <WaveformScrubber
              track={track}
              position={playbackState.position}
              duration={playbackState.duration}
              theme={theme}
              onSeek={(sec) => {
                player.seekTo(sec);
                setMascotEmotion('focused');
              }}
            />
          </View>

          {/* Main Controls Row */}
          <View style={styles.controlsRow}>
            <TactileButton
              onPress={() => player.toggleShuffle()}
              style={styles.secondaryControlBtn}
            >
              <Ionicons
                name="shuffle"
                size={22}
                color={playbackState.isShuffled ? theme.accent : theme.textTertiary}
              />
            </TactileButton>

            <TactileButton
              onPress={() => player.previous()}
              style={styles.primaryControlBtn}
            >
              <Ionicons name="play-skip-back" size={26} color={theme.textPrimary} />
            </TactileButton>

            <TactileButton
              onPress={() => player.togglePlayPause()}
              style={[styles.playPauseBtn, { backgroundColor: theme.textPrimary }]}
            >
              <Ionicons
                name={playbackState.isPlaying ? 'pause' : 'play'}
                size={32}
                color={theme.background}
              />
            </TactileButton>

            <TactileButton
              onPress={() => player.next()}
              style={styles.primaryControlBtn}
            >
              <Ionicons name="play-skip-forward" size={26} color={theme.textPrimary} />
            </TactileButton>

            <TactileButton
              onPress={() => player.toggleRepeatMode()}
              style={styles.secondaryControlBtn}
            >
              <Ionicons
                name={playbackState.repeatMode === 'one' ? 'repeat' : 'repeat'}
                size={22}
                color={playbackState.repeatMode !== 'off' ? theme.accent : theme.textTertiary}
              />
              {playbackState.repeatMode === 'one' && (
                <View style={[styles.repeatOneBadge, { backgroundColor: theme.accent }]}>
                  <Text style={[styles.repeatOneText, { color: theme.background }]}>1</Text>
                </View>
              )}
            </TactileButton>
          </View>

          {/* Interactive Software Volume Bar (Auto-pause on 0 & Auto-resume on >0) */}
          <View style={styles.volumeRow}>
            <TactileButton
              onPress={() => handleVolumeChange(volume === 0 ? 0.75 : 0)}
              style={styles.volumeIconBtn}
            >
              <Ionicons
                name={volume === 0 ? 'volume-mute' : volume < 0.4 ? 'volume-low' : 'volume-medium'}
                size={18}
                color={volume === 0 ? theme.danger : theme.textTertiary}
              />
            </TactileButton>

            {/* Draggable & Tappable Volume Scrubber Bar */}
            <View
              style={[styles.volumeBarTrack, { backgroundColor: theme.surfaceLight }]}
              {...volumePanResponder.panHandlers}
            >
              <View
                style={[
                  styles.volumeBarProgress,
                  { width: `${volume * 100}%`, backgroundColor: volume === 0 ? theme.danger : theme.accent },
                ]}
              />
              <View
                style={[
                  styles.volumeThumb,
                  { left: `${Math.min(96, Math.max(0, volume * 100))}%`, backgroundColor: theme.textPrimary },
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

          {/* Musicolet-Style Quick Navigation Strip (Reference Image 2) */}
          <View style={[styles.quickNavStrip, { borderTopColor: theme.surfaceBorder }]}>
            {/* 1. Queue */}
            <TouchableOpacity
              onPress={onOpenQueue}
              style={styles.quickNavBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="list-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* 2. Play Indicator Pill */}
            <TouchableOpacity
              onPress={() => player.togglePlayPause()}
              style={[
                styles.quickPlayPill,
                { backgroundColor: playbackState.isPlaying ? theme.textPrimary : theme.accent },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={playbackState.isPlaying ? 'pause' : 'play'}
                size={14}
                color={theme.background}
              />
            </TouchableOpacity>

            {/* 3. Folders */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                if (onNavigateToTab) onNavigateToTab('library', 'folders');
              }}
              style={styles.quickNavBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="folder-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* 4. Albums */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                if (onNavigateToTab) onNavigateToTab('library', 'albums');
              }}
              style={styles.quickNavBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="disc-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* 5. Artists */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                if (onNavigateToTab) onNavigateToTab('library', 'artists');
              }}
              style={styles.quickNavBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* 6. Tags */}
            <TouchableOpacity
              onPress={() => onOpenTagEditor(track)}
              style={styles.quickNavBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="pricetag-outline" size={19} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* 7. Genres */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                if (onNavigateToTab) onNavigateToTab('library', 'genres');
              }}
              style={styles.quickNavBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="musical-notes-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* 8. Vibes */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                if (onNavigateToTab) onNavigateToTab('vibes');
              }}
              style={styles.quickNavBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles-outline" size={20} color={theme.accent} />
            </TouchableOpacity>

            {/* 9. More Options */}
            <TouchableOpacity
              onPress={() => setMoreMenuOpen(true)}
              style={styles.quickNavBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Modal: Personalize Music Space & Background Customizer */}
        <Modal
          visible={customizerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCustomizerOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.customizerCard,
                { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
              ]}
            >
              <View style={styles.customizerHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="color-palette" size={20} color={theme.accent} />
                  <Text style={[styles.customizerTitle, { color: theme.textPrimary }]}>
                    Personalize Music Space
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setCustomizerOpen(false)}>
                  <Ionicons name="close-circle" size={24} color={theme.textTertiary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                {/* Visual Background Environments */}
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Player Background
                </Text>
                <View style={styles.bgGrid}>
                  {[
                    { id: 'default' as PlayerBackgroundType, label: 'OLED Dark', color: '#07080B' },
                    { id: 'aurora' as PlayerBackgroundType, label: 'Aurora', color: '#083832' },
                    { id: 'sunset' as PlayerBackgroundType, label: 'Sunset Dusk', color: '#33122B' },
                    { id: 'cyber' as PlayerBackgroundType, label: 'Cyber Neon', color: '#160E36' },
                    { id: 'tokyo_rain' as PlayerBackgroundType, label: 'Tokyo Rain', color: '#0D203C' },
                    { id: 'custom' as PlayerBackgroundType, label: 'Custom Photo', color: theme.surfaceLight },
                  ].map((bg) => {
                    const isSelected = playerCustomization?.backgroundType === bg.id;
                    return (
                      <TouchableOpacity
                        key={bg.id}
                        onPress={() => {
                          if (bg.id === 'custom' && !playerCustomization?.customImageUri) {
                            handlePickCustomBackground();
                          } else {
                            onUpdatePlayerCustomization({ backgroundType: bg.id });
                          }
                        }}
                        style={[
                          styles.bgOptionBtn,
                          {
                            backgroundColor: bg.color,
                            borderColor: isSelected ? theme.accent : theme.surfaceBorder,
                          },
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.bgOptionLabel, { color: '#FFFFFF' }]}>
                          {bg.label}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={theme.accent}
                            style={{ position: 'absolute', top: 4, right: 4 }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Upload Wallpaper Button if custom */}
                <TouchableOpacity
                  onPress={handlePickCustomBackground}
                  style={[
                    styles.uploadWallpaperBtn,
                    { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="image-outline" size={18} color={theme.accent} />
                  <Text style={[styles.uploadWallpaperText, { color: theme.textPrimary }]}>
                    {playerCustomization?.customImageUri ? 'Change Custom Wallpaper' : 'Upload Wallpaper / Photo'}
                  </Text>
                </TouchableOpacity>

                {/* Animation & Visual Toggles */}
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary, marginTop: 16 }]}>
                  Visual Effects & Motion
                </Text>

                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
                      2D Companion Mascot
                    </Text>
                    <Text style={[styles.toggleSub, { color: theme.textTertiary }]}>
                      Display human anime companion
                    </Text>
                  </View>
                  <Switch
                    value={playerCustomization?.enableCharacter ?? true}
                    onValueChange={(val) => onUpdatePlayerCustomization({ enableCharacter: val })}
                    trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                    thumbColor={theme.textPrimary}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
                      Character Motion & Dance
                    </Text>
                    <Text style={[styles.toggleSub, { color: theme.textTertiary }]}>
                      Subtle rhythm bobbing and natural breathing
                    </Text>
                  </View>
                  <Switch
                    value={playerCustomization?.enableCharacterMotion ?? true}
                    onValueChange={(val) => onUpdatePlayerCustomization({ enableCharacterMotion: val })}
                    trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                    thumbColor={theme.textPrimary}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
                      Audio Spectrum Visualizer
                    </Text>
                    <Text style={[styles.toggleSub, { color: theme.textTertiary }]}>
                      Dynamic pulsating spectrum bars
                    </Text>
                  </View>
                  <Switch
                    value={playerCustomization?.enableVisualizer ?? true}
                    onValueChange={(val) => onUpdatePlayerCustomization({ enableVisualizer: val })}
                    trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                    thumbColor={theme.textPrimary}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
                      Vinyl / Artwork Pulse
                    </Text>
                    <Text style={[styles.toggleSub, { color: theme.textTertiary }]}>
                      Subtle heartbeat zoom reacting to tempo
                    </Text>
                  </View>
                  <Switch
                    value={playerCustomization?.enableArtworkAnimation ?? true}
                    onValueChange={(val) => onUpdatePlayerCustomization({ enableArtworkAnimation: val })}
                    trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                    thumbColor={theme.textPrimary}
                  />
                </View>

                {/* Equalizer & Sleep Timer Quick Access */}
                <View style={styles.modalQuickTools}>
                  <TouchableOpacity
                    onPress={() => {
                      setCustomizerOpen(false);
                      onOpenEqualizer();
                    }}
                    style={[styles.modalToolBtn, { backgroundColor: theme.surfaceLight }]}
                  >
                    <Ionicons name="options-outline" size={18} color={theme.accent} />
                    <Text style={[styles.modalToolBtnText, { color: theme.textPrimary }]}>
                      Equalizer
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setCustomizerOpen(false);
                      onOpenSleepTimer();
                    }}
                    style={[styles.modalToolBtn, { backgroundColor: theme.surfaceLight }]}
                  >
                    <Ionicons name="moon-outline" size={18} color={theme.accent} />
                    <Text style={[styles.modalToolBtnText, { color: theme.textPrimary }]}>
                      Sleep Timer
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal: More Playback & Utility Tools */}
        <Modal
          visible={moreMenuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMoreMenuOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.moreMenuCard,
                { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
              ]}
            >
              <View style={styles.moreMenuHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="apps-outline" size={20} color={theme.accent} />
                  <Text style={[styles.moreMenuTitle, { color: theme.textPrimary }]}>
                    Playback Tools
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setMoreMenuOpen(false)}>
                  <Ionicons name="close-circle" size={24} color={theme.textTertiary} />
                </TouchableOpacity>
              </View>

              <View style={styles.moreMenuGrid}>
                {/* 1. Equalizer */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { backgroundColor: theme.surfaceLight }]}
                  onPress={() => {
                    setMoreMenuOpen(false);
                    onOpenEqualizer();
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: 'rgba(0, 229, 255, 0.12)' }]}>
                    <Ionicons name="options-outline" size={22} color={theme.accent} />
                  </View>
                  <Text style={[styles.moreMenuLabel, { color: theme.textPrimary }]}>Equalizer</Text>
                  <Text style={[styles.moreMenuSub, { color: theme.textTertiary }]}>10-Band EQ & FX</Text>
                </TouchableOpacity>

                {/* 2. Sleep Timer */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { backgroundColor: theme.surfaceLight }]}
                  onPress={() => {
                    setMoreMenuOpen(false);
                    onOpenSleepTimer();
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                    <Ionicons name="moon-outline" size={22} color="#a855f7" />
                  </View>
                  <Text style={[styles.moreMenuLabel, { color: theme.textPrimary }]}>Sleep Timer</Text>
                  <Text style={[styles.moreMenuSub, { color: theme.textTertiary }]}>Auto Stop</Text>
                </TouchableOpacity>

                {/* 3. DJ Quick-FX */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { backgroundColor: theme.surfaceLight }]}
                  onPress={() => {
                    setMoreMenuOpen(false);
                    setDjFxModalOpen(true);
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: 'rgba(236, 72, 153, 0.12)' }]}>
                    <Ionicons name="speedometer-outline" size={22} color="#ec4899" />
                  </View>
                  <Text style={[styles.moreMenuLabel, { color: theme.textPrimary }]}>DJ Quick-FX</Text>
                  <Text style={[styles.moreMenuSub, { color: theme.textTertiary }]}>XY Filter Pad</Text>
                </TouchableOpacity>

                {/* 4. Edit Song Tags */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { backgroundColor: theme.surfaceLight }]}
                  onPress={() => {
                    setMoreMenuOpen(false);
                    onOpenTagEditor(track);
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]}>
                    <Ionicons name="create-outline" size={22} color="#22c55e" />
                  </View>
                  <Text style={[styles.moreMenuLabel, { color: theme.textPrimary }]}>Tag Editor</Text>
                  <Text style={[styles.moreMenuSub, { color: theme.textTertiary }]}>Title, Artist, Genre</Text>
                </TouchableOpacity>

                {/* 5. Personalize Space */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { backgroundColor: theme.surfaceLight }]}
                  onPress={() => {
                    setMoreMenuOpen(false);
                    setCustomizerOpen(true);
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <Ionicons name="color-palette-outline" size={22} color="#f59e0b" />
                  </View>
                  <Text style={[styles.moreMenuLabel, { color: theme.textPrimary }]}>Personalize</Text>
                  <Text style={[styles.moreMenuSub, { color: theme.textTertiary }]}>Theme & Wallpaper</Text>
                </TouchableOpacity>

                {/* 6. Playback Queue */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { backgroundColor: theme.surfaceLight }]}
                  onPress={() => {
                    setMoreMenuOpen(false);
                    onOpenQueue();
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                    <Ionicons name="list-outline" size={22} color="#3b82f6" />
                  </View>
                  <Text style={[styles.moreMenuLabel, { color: theme.textPrimary }]}>Queue</Text>
                  <Text style={[styles.moreMenuSub, { color: theme.textTertiary }]}>View Next Tracks</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Instant DJ Quick-FX & XY Filter Pad */}
        <DjQuickFxModal
          visible={djFxModalOpen}
          onClose={() => setDjFxModalOpen(false)}
          theme={theme}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenRoot: {
    flex: 1,
    position: 'relative',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  auroraGlowHaze: {
    position: 'absolute',
    top: 60,
    left: '10%',
    width: '80%',
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    filter: 'blur(40px)',
  },
  sunsetGlowHaze: {
    position: 'absolute',
    top: 80,
    left: '15%',
    width: '70%',
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
  },
  cyberGridOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(255, 101, 132, 0.08)',
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
    marginVertical: 4,
  },
  lyricsCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  petAndVisualizerContainer: {
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowPlayingPetStage: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  petBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  petToggleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petToggleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 2,
  },
  metaTextCol: {
    flex: 1,
    marginRight: 16,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  trackArtist: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 3,
  },
  trackAlbum: {
    fontSize: 12,
    marginTop: 2,
  },
  favButton: {
    padding: 6,
  },
  waveformContainer: {
    paddingHorizontal: 24,
    marginTop: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    marginVertical: 4,
  },
  secondaryControlBtn: {
    padding: 8,
    position: 'relative',
  },
  repeatOneBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneText: {
    fontSize: 8,
    fontWeight: '900',
  },
  primaryControlBtn: {
    padding: 10,
  },
  playPauseBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
    marginVertical: 4,
  },
  volumeIconBtn: {
    padding: 4,
  },
  volumeBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  volumeBarProgress: {
    height: '100%',
    borderRadius: 3,
  },
  volumeThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: -4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  quickNavStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  quickNavBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPlayPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  customizerCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 32,
  },
  customizerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  customizerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  bgGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  bgOptionBtn: {
    width: '31%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bgOptionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  uploadWallpaperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  uploadWallpaperText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  modalQuickTools: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalToolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalToolBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  moreMenuCard: {
    width: '90%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  moreMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moreMenuTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  moreMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  moreMenuItem: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  moreMenuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  moreMenuLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  moreMenuSub: {
    fontSize: 11,
    textAlign: 'center',
  },
});
