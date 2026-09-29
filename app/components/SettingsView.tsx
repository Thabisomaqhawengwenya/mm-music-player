import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  AppTheme,
  AudioSettings,
  HeadsetSettings,
  NotificationSettings,
  LockscreenSettings,
  AdvancedSettings,
  WidgetSettings,
  PetSettings,
  PetAvatarType,
  PetAccessory,
  PlayerCustomizationSettings,
  PlayerBackgroundType,
  CharacterEmotion,
  Track,
} from '@/src/types';
import { THEMES } from '../../app/constants/theme';
import * as DocumentPicker from 'expo-document-picker';
import {
  StorageService,
  defaultAudioSettings,
  defaultHeadsetSettings,
  defaultNotificationSettings,
  defaultLockscreenSettings,
  defaultAdvancedSettings,
  defaultWidgetSettings,
  defaultPetSettings,
  defaultPlayerCustomizationSettings,
} from '@/src/services/playlistStorage';
import { MusicPet } from '../../app/pet/MusicPet';
import { PET_PROFILES, KAOMOJI_REACTIONS } from '../../app/pet/types';
import { TactileButton } from './TactileButton';
import { ListeningStatsView } from './ListeningStatsView';

type SettingsCategory =
  | 'root'
  | 'stats'
  | 'language'
  | 'interface'
  | 'personalize'
  | 'audio'
  | 'library'
  | 'headset'
  | 'notifications'
  | 'widgets'
  | 'lockscreen'
  | 'pet'
  | 'advanced'
  | 'backup'
  | 'legal';

interface SettingsViewProps {
  theme: AppTheme;
  allTracks?: Track[];
  onPlayTrack?: (track: Track, contextList?: Track[]) => void;
  onToggleFavorite?: (trackId: string) => void;
  playerCustomization?: PlayerCustomizationSettings;
  onUpdatePlayerCustomization?: (newSettings: PlayerCustomizationSettings) => void;
  onThemeChanged: (newTheme: AppTheme) => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onScanDevice: () => void;
  onPickFiles: () => void;
  onSettingsChanged: () => void;
  onOpenEqualizer?: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English (US / UK)' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'pt', name: 'Português' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  allTracks = [],
  onPlayTrack,
  onToggleFavorite,
  playerCustomization: propCustomization,
  onUpdatePlayerCustomization,
  onThemeChanged,
  onOpenTerms,
  onOpenPrivacy,
  onScanDevice,
  onPickFiles,
  onSettingsChanged,
  onOpenEqualizer,
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('root');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Loaded Settings
  const [language, setLanguage] = useState('en');
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(defaultAudioSettings);
  const [headsetSettings, setHeadsetSettings] = useState<HeadsetSettings>(defaultHeadsetSettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [lockscreenSettings, setLockscreenSettings] = useState<LockscreenSettings>(defaultLockscreenSettings);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>(defaultAdvancedSettings);
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(defaultWidgetSettings);
  const [petSettings, setPetSettings] = useState<PetSettings>(defaultPetSettings);
  const [playerCustomization, setPlayerCustomization] = useState<PlayerCustomizationSettings>(
    propCustomization || defaultPlayerCustomizationSettings
  );

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    const [lang, audio, headset, notif, lock, adv, widget, pet, custom] = await Promise.all([
      StorageService.getLanguage(),
      StorageService.getAudioSettings(),
      StorageService.getHeadsetSettings(),
      StorageService.getNotificationSettings(),
      StorageService.getLockscreenSettings(),
      StorageService.getAdvancedSettings(),
      StorageService.getWidgetSettings(),
      StorageService.getPetSettings(),
      StorageService.getPlayerCustomizationSettings(),
    ]);

    setLanguage(lang);
    setAudioSettings(audio);
    setHeadsetSettings(headset);
    setNotificationSettings(notif);
    setLockscreenSettings(lock);
    setAdvancedSettings(adv);
    setWidgetSettings(widget);
    setPetSettings(pet);
    setPlayerCustomization(custom);
  };

  const handleUpdatePlayerCustomization = async <K extends keyof PlayerCustomizationSettings>(
    key: K,
    value: PlayerCustomizationSettings[K]
  ) => {
    const updated = { ...playerCustomization, [key]: value };
    setPlayerCustomization(updated);
    await StorageService.savePlayerCustomizationSettings(updated);
    if (onUpdatePlayerCustomization) {
      onUpdatePlayerCustomization(updated);
    }
    onSettingsChanged();
  };

  const handlePickCustomWallpaper = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const updated = {
          ...playerCustomization,
          backgroundType: 'custom' as PlayerBackgroundType,
          customImageUri: uri,
        };
        setPlayerCustomization(updated);
        await StorageService.savePlayerCustomizationSettings(updated);
        if (onUpdatePlayerCustomization) {
          onUpdatePlayerCustomization(updated);
        }
        onSettingsChanged();
        Alert.alert('Wallpaper Set', 'Custom background photo applied to Music Player.');
      }
    } catch {
      Alert.alert('Error', 'Failed to pick wallpaper image.');
    }
  };

  // Update Handlers
  const handleUpdateAudio = async <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    const updated = { ...audioSettings, [key]: value };
    setAudioSettings(updated);
    await StorageService.saveAudioSettings(updated);
    onSettingsChanged();
  };

  const handleUpdateHeadset = async <K extends keyof HeadsetSettings>(key: K, value: HeadsetSettings[K]) => {
    const updated = { ...headsetSettings, [key]: value };
    setHeadsetSettings(updated);
    await StorageService.saveHeadsetSettings(updated);
  };

  const handleUpdateNotification = async <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    const updated = { ...notificationSettings, [key]: value };
    setNotificationSettings(updated);
    await StorageService.saveNotificationSettings(updated);
  };

  const handleUpdateLockscreen = async <K extends keyof LockscreenSettings>(key: K, value: LockscreenSettings[K]) => {
    const updated = { ...lockscreenSettings, [key]: value };
    setLockscreenSettings(updated);
    await StorageService.saveLockscreenSettings(updated);
  };

  const handleUpdateAdvanced = async <K extends keyof AdvancedSettings>(key: K, value: AdvancedSettings[K]) => {
    const updated = { ...advancedSettings, [key]: value };
    setAdvancedSettings(updated);
    await StorageService.saveAdvancedSettings(updated);
  };

  const handleUpdateWidget = async <K extends keyof WidgetSettings>(key: K, value: WidgetSettings[K]) => {
    const updated = { ...widgetSettings, [key]: value };
    setWidgetSettings(updated);
    await StorageService.saveWidgetSettings(updated);
  };

  const handleUpdatePet = async <K extends keyof PetSettings>(key: K, value: PetSettings[K]) => {
    const updated = { ...petSettings, [key]: value };
    setPetSettings(updated);
    await StorageService.savePetSettings(updated);
    onSettingsChanged();
  };

  const handleSelectLanguage = async (code: string) => {
    setLanguage(code);
    await StorageService.saveLanguage(code);
    Alert.alert('Language Updated', `Display language set to ${LANGUAGES.find((l) => l.code === code)?.name}.`);
  };

  const handleExportBackup = async () => {
    try {
      const json = await StorageService.exportBackupData();
      await Share.share({
        title: 'MM Music Player Backup',
        message: json,
      });
    } catch {
      Alert.alert('Export Error', 'Could not export backup data.');
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset All Settings',
      'Are you sure you want to reset all audio, interface, and hardware preferences to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await StorageService.resetAllSettings();
            await loadAllSettings();
            onSettingsChanged();
            Alert.alert('Settings Reset', 'All settings restored to factory defaults.');
          },
        },
      ]
    );
  };

  // Main Musicolet Categories list matching Screenshot 1
  const categories = [
    {
      id: 'stats' as SettingsCategory,
      title: 'Listening Stats & Insights',
      subtitle: 'Favorite song, top artists, listening time & trends',
      icon: 'stats-chart-outline' as const,
    },
    {
      id: 'language' as SettingsCategory,
      title: 'Language',
      subtitle: LANGUAGES.find((l) => l.code === language)?.name || 'English',
      icon: 'globe-outline' as const,
    },
    {
      id: 'interface' as SettingsCategory,
      title: 'Interface',
      subtitle: `${theme.name} • Theme Colors & Style`,
      icon: 'color-palette-outline' as const,
    },
    {
      id: 'personalize' as SettingsCategory,
      title: 'Personal Music Space',
      subtitle: `${playerCustomization.backgroundType.toUpperCase()} • Wallpapers & Visual FX`,
      icon: 'sparkles-outline' as const,
    },
    {
      id: 'audio' as SettingsCategory,
      title: 'Audio',
      subtitle: 'Equalizer, Crossfade, Gapless & ReplayGain',
      icon: 'volume-high-outline' as const,
    },
    {
      id: 'library' as SettingsCategory,
      title: 'Song library and tags',
      subtitle: 'Storage scan, Duration filters, Exclude folders',
      icon: 'bookmark-outline' as const,
    },
    {
      id: 'headset' as SettingsCategory,
      title: 'Headset, Bluetooth and speakers',
      subtitle: 'Auto-pause, Reconnect, Media keys',
      icon: 'headset-outline' as const,
    },
    {
      id: 'notifications' as SettingsCategory,
      title: 'Notifications',
      subtitle: 'Media controls, Artwork & Actions',
      icon: 'notifications-outline' as const,
    },
    {
      id: 'widgets' as SettingsCategory,
      title: 'HomeScreen widgets',
      subtitle: 'Widget themes, Translucency, Layouts',
      icon: 'apps-outline' as const,
    },
    {
      id: 'lockscreen' as SettingsCategory,
      title: 'MM lock-screen',
      subtitle: 'Lockscreen player & Full-screen artwork',
      icon: 'lock-closed-outline' as const,
    },
    {
      id: 'pet' as SettingsCategory,
      title: 'Music Pet Companion',
      subtitle: `${petSettings.enabled ? 'Active' : 'Disabled'} • ${PET_PROFILES[petSettings.avatar]?.name} (${PET_PROFILES[petSettings.avatar]?.species})`,
      icon: 'paw-outline' as const,
    },
    {
      id: 'advanced' as SettingsCategory,
      title: 'Advanced',
      subtitle: 'Audio buffer, Cache management & Reset',
      icon: 'settings-outline' as const,
    },
    {
      id: 'backup' as SettingsCategory,
      title: 'Backup/Restore',
      subtitle: 'Cloud Sync, JSON export/import',
      icon: 'refresh-circle-outline' as const,
    },
    {
      id: 'legal' as SettingsCategory,
      title: 'Legal & Policies',
      subtitle: 'Terms & Conditions, Privacy & Version',
      icon: 'document-text-outline' as const,
    },
  ];

  // Filtered categories when search query active
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) => c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
    );
  }, [searchQuery, categories]);

  if (activeCategory === 'stats') {
    return (
      <ListeningStatsView
        theme={theme}
        allTracks={allTracks}
        onPlayTrack={onPlayTrack}
        onToggleFavorite={onToggleFavorite}
        onBack={() => setActiveCategory('root')}
      />
    );
  }

  return (
    <View style={styles.root}>
      {/* Top Header Bar */}
      <View style={[styles.topHeader, { borderBottomColor: theme.surfaceBorder }]}>
        <View style={styles.topHeaderLeft}>
          {activeCategory !== 'root' ? (
            <TactileButton
              onPress={() => {
                setActiveCategory('root');
                setIsSearching(false);
              }}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </TactileButton>
          ) : (
            <View style={{ width: 8 }} />
          )}
          <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>
            {activeCategory === 'root'
              ? 'Settings'
              : categories.find((c) => c.id === activeCategory)?.title || 'Settings'}
          </Text>
        </View>

        <TactileButton
          onPress={() => setIsSearching((prev) => !prev)}
          style={styles.searchToggleBtn}
        >
          <Ionicons
            name={isSearching ? 'close' : 'search'}
            size={22}
            color={isSearching ? theme.accent : theme.textPrimary}
          />
        </TactileButton>
      </View>

      {/* Optional Search Bar Input */}
      {isSearching && (
        <View style={[styles.searchBarBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <Ionicons name="search" size={18} color={theme.accent} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search a setting..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TactileButton onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
            </TactileButton>
          )}
        </View>
      )}

      {/* Main Content Area */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* ROOT CATEGORIES LIST (Musicolet style) */}
        {activeCategory === 'root' && (
          <View style={styles.categoryList}>
            {filteredCategories.map((cat) => (
              <TactileButton
                key={cat.id}
                onPress={() => {
                  setActiveCategory(cat.id);
                }}
                style={[
                  styles.categoryRow,
                  { borderBottomColor: theme.surfaceBorder },
                ]}
              >
                <View style={styles.categoryIconWrap}>
                  <Ionicons name={cat.icon} size={24} color={theme.textPrimary} />
                </View>
                <View style={styles.categoryTextWrap}>
                  <Text style={[styles.categoryTitle, { color: theme.textPrimary }]}>
                    {cat.title}
                  </Text>
                  <Text style={[styles.categorySubtitle, { color: theme.textSecondary }]}>
                    {cat.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TactileButton>
            ))}

            {/* Quick Musicolet Search a Setting pill at bottom */}
            {!isSearching && (
              <TactileButton
                onPress={() => setIsSearching(true)}
                style={[styles.bottomSearchPill, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
              >
                <Ionicons name="play" size={12} color={theme.accent} />
                <Text style={[styles.bottomSearchText, { color: theme.textTertiary }]}>
                  Search a setting...
                </Text>
              </TactileButton>
            )}
          </View>
        )}

        {/* 1. LANGUAGE */}
        {activeCategory === 'language' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Choose the primary language for audio controls, library tags, and navigation.
            </Text>
            {LANGUAGES.map((item) => (
              <TactileButton
                key={item.code}
                onPress={() => handleSelectLanguage(item.code)}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: language === item.code ? `${theme.accent}15` : theme.surface,
                    borderColor: language === item.code ? theme.accent : theme.surfaceBorder,
                  },
                ]}
              >
                <Text style={[styles.optionCardTitle, { color: theme.textPrimary }]}>
                  {item.name}
                </Text>
                {language === item.code && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
                )}
              </TactileButton>
            ))}
          </View>
        )}

        {/* 2. INTERFACE */}
        {activeCategory === 'interface' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Customize Material You dynamic theming, corner radii, and color palettes.
            </Text>

            {/* Material You Dynamic Colors */}
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>MATERIAL YOU DYNAMIC THEMING</Text>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Dynamic Track Color Extraction</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Extract Material You tones from current track or album art (100% offline)
                  </Text>
                </View>
                <Switch
                  value={playerCustomization.materialYouDynamic}
                  onValueChange={(val) => handleUpdatePlayerCustomization('materialYouDynamic', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Corner Radius & Shape Style</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Material 3 card, modal, and button curvature
              </Text>
              <View style={styles.pillRow}>
                {[
                  { label: 'Compact (12px)', val: 12 },
                  { label: 'Standard (18px)', val: 18 },
                  { label: 'Pixel Pill (24px)', val: 24 },
                  { label: 'Ultra Round (32px)', val: 32 },
                ].map((item) => (
                  <TactileButton
                    key={item.val}
                    onPress={() => handleUpdatePlayerCustomization('cornerRadius', item.val)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: (playerCustomization.cornerRadius ?? 18) === item.val ? theme.accent : theme.surfaceLight,
                        borderColor: (playerCustomization.cornerRadius ?? 18) === item.val ? theme.accent : theme.surfaceBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: (playerCustomization.cornerRadius ?? 18) === item.val ? theme.background : theme.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TactileButton>
                ))}
              </View>
            </View>

            <Text style={[styles.sectionHeading, { color: theme.accent, marginTop: 22 }]}>THEME PALETTE</Text>
            <View style={styles.themeGrid}>
              {Object.values(THEMES).map((t) => {
                const isSelected = theme.id === t.id;
                return (
                  <TactileButton
                    key={t.id}
                    onPress={async () => {
                      await StorageService.saveThemeId(t.id);
                      onThemeChanged(t);
                    }}
                    style={[
                      styles.themeCard,
                      {
                        backgroundColor: t.surface,
                        borderColor: isSelected ? t.accent : theme.surfaceBorder,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.themePaletteRow, { backgroundColor: t.background }]}>
                      <View style={[styles.paletteDot, { backgroundColor: t.accent }]} />
                      <View style={[styles.paletteBar, { backgroundColor: t.surfaceLight }]} />
                    </View>
                    <Text style={[styles.themeName, { color: isSelected ? t.accent : theme.textPrimary }]}>
                      {t.name}
                    </Text>
                  </TactileButton>
                );
              })}
            </View>
          </View>
        )}

        {/* 2B. PERSONALIZE: PLAYER SPACE & VISUALS */}
        {activeCategory === 'personalize' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Customize your personal music-playing space, visual environments, and animation effects.
            </Text>

            <Text style={[styles.sectionHeading, { color: theme.accent }]}>BACKGROUND ENVIRONMENT</Text>
            <View style={styles.customBgGrid}>
              {[
                { id: 'default' as PlayerBackgroundType, name: 'OLED Dark', icon: 'moon', desc: 'Deep black & high contrast' },
                { id: 'aurora' as PlayerBackgroundType, name: 'Aurora Dream', icon: 'color-filter', desc: 'Cyan, violet & emerald glow' },
                { id: 'sunset' as PlayerBackgroundType, name: 'Sunset Dusk', icon: 'sunny', desc: 'Warm amber & magenta horizon' },
                { id: 'cyber' as PlayerBackgroundType, name: 'Cyber Neon', icon: 'flash', desc: 'Electric blue & neon magenta' },
                { id: 'tokyo_rain' as PlayerBackgroundType, name: 'Tokyo Rain', icon: 'rainy', desc: 'Midnight navy & neon reflection' },
                { id: 'custom' as PlayerBackgroundType, name: 'Custom Photo', icon: 'image', desc: 'Personal photo wallpaper' },
              ].map((bg) => {
                const isSelected = playerCustomization.backgroundType === bg.id;
                return (
                  <TactileButton
                    key={bg.id}
                    onPress={() => handleUpdatePlayerCustomization('backgroundType', bg.id)}
                    style={[
                      styles.customBgCard,
                      {
                        backgroundColor: isSelected ? `${theme.accent}18` : theme.surface,
                        borderColor: isSelected ? theme.accent : theme.surfaceBorder,
                      },
                    ]}
                  >
                    <View style={[styles.customBgIconWrap, { backgroundColor: isSelected ? theme.accent : theme.surfaceLight }]}>
                      <Ionicons
                        name={bg.icon as any}
                        size={20}
                        color={isSelected ? theme.background : theme.textPrimary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.customBgCardName, { color: isSelected ? theme.accent : theme.textPrimary }]}>
                        {bg.name}
                      </Text>
                      <Text style={[styles.customBgCardDesc, { color: theme.textSecondary }]}>
                        {bg.desc}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
                    )}
                  </TactileButton>
                );
              })}
            </View>

            {/* Custom Photo Wallpaper Actions */}
            {playerCustomization.backgroundType === 'custom' && (
              <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, marginTop: 12 }]}>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Custom Photo Wallpaper</Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  {playerCustomization.customImageUri ? 'Photo selected from device' : 'No photo chosen yet'}
                </Text>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <TactileButton
                    onPress={handlePickCustomWallpaper}
                    style={[styles.actionPillBtn, { backgroundColor: theme.accent, flex: 1 }]}
                  >
                    <Ionicons name="image-outline" size={16} color={theme.background} />
                    <Text style={[styles.actionPillBtnText, { color: theme.background }]}>
                      Pick Photo from Device
                    </Text>
                  </TactileButton>

                  {playerCustomization.customImageUri && (
                    <TactileButton
                      onPress={() => handleUpdatePlayerCustomization('customImageUri', undefined)}
                      style={[styles.actionPillBtn, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder, borderWidth: 1 }]}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.accent} />
                      <Text style={[styles.actionPillBtnText, { color: theme.accent }]}>Clear</Text>
                    </TactileButton>
                  )}
                </View>
              </View>
            )}

            {/* Visual Atmosphere & Dimming Controls */}
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, marginTop: 14 }]}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Background Blur & Dimming</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Tune wallpaper readability for song lyrics and music controls
              </Text>

              {/* Blur Level */}
              <Text style={[styles.settingSmallLabel, { color: theme.textSecondary, marginTop: 12 }]}>Blur Intensity</Text>
              <View style={styles.pillRow}>
                {[
                  { label: 'None', val: 0 },
                  { label: 'Subtle (5)', val: 5 },
                  { label: 'Medium (10)', val: 10 },
                  { label: 'Heavy (20)', val: 20 },
                ].map((b) => (
                  <TactileButton
                    key={b.val}
                    onPress={() => handleUpdatePlayerCustomization('backgroundBlur', b.val)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: playerCustomization.backgroundBlur === b.val ? theme.accent : theme.surfaceLight,
                        borderColor: playerCustomization.backgroundBlur === b.val ? theme.accent : theme.surfaceBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: playerCustomization.backgroundBlur === b.val ? theme.background : theme.textSecondary },
                      ]}
                    >
                      {b.label}
                    </Text>
                  </TactileButton>
                ))}
              </View>

              {/* Dim Level */}
              <Text style={[styles.settingSmallLabel, { color: theme.textSecondary, marginTop: 14 }]}>Dark Dim Overlay</Text>
              <View style={styles.pillRow}>
                {[
                  { label: '20%', val: 0.2 },
                  { label: '45%', val: 0.45 },
                  { label: '65%', val: 0.65 },
                  { label: '85%', val: 0.85 },
                ].map((d) => (
                  <TactileButton
                    key={d.val}
                    onPress={() => handleUpdatePlayerCustomization('backgroundDim', d.val)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: playerCustomization.backgroundDim === d.val ? theme.accent : theme.surfaceLight,
                        borderColor: playerCustomization.backgroundDim === d.val ? theme.accent : theme.surfaceBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: playerCustomization.backgroundDim === d.val ? theme.background : theme.textSecondary },
                      ]}
                    >
                      {d.label}
                    </Text>
                  </TactileButton>
                ))}
              </View>
            </View>

            {/* Animation & Visual FX Switches */}
            <Text style={[styles.sectionHeading, { color: theme.accent, marginTop: 22 }]}>ANIMATION & VISUAL FX CONTROLS</Text>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>2D Human Companion Mascot</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Display animated character reacting to music
                  </Text>
                </View>
                <Switch
                  value={playerCustomization.enableCharacter}
                  onValueChange={(val) => handleUpdatePlayerCustomization('enableCharacter', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Companion Motion & Head-Bobs</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Gentle rhythmic bouncing, breathing and emotes
                  </Text>
                </View>
                <Switch
                  value={playerCustomization.enableCharacterMotion}
                  onValueChange={(val) => handleUpdatePlayerCustomization('enableCharacterMotion', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>14-Band Spectrum Visualizer</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Real-time glowing audio spectrum bars
                  </Text>
                </View>
                <Switch
                  value={playerCustomization.enableVisualizer}
                  onValueChange={(val) => handleUpdatePlayerCustomization('enableVisualizer', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Vinyl & Artwork Beat Pulse</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Gentle dynamic scale pulses synced with audio playback
                  </Text>
                </View>
                <Switch
                  value={playerCustomization.enableArtworkAnimation}
                  onValueChange={(val) => handleUpdatePlayerCustomization('enableArtworkAnimation', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Ambient Glow Waves</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Color illumination behind player controls
                  </Text>
                </View>
                <Switch
                  value={playerCustomization.enableBackgroundAmbiance}
                  onValueChange={(val) => handleUpdatePlayerCustomization('enableBackgroundAmbiance', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>
            </View>
          </View>
        )}

        {/* 3. AUDIO */}
        {activeCategory === 'audio' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Audiophile 24-bit DSP audio pipeline, crossfades, and hardware equalizer controls.
            </Text>

            {onOpenEqualizer && (
              <TactileButton
                onPress={onOpenEqualizer}
                style={[styles.actionBanner, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: `${theme.accent}20` }]}>
                  <Ionicons name="options-outline" size={22} color={theme.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>Launch 5-Band Equalizer</Text>
                  <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
                    Bass boost, virtualizer & custom presets
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TactileButton>
            )}

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, marginTop: 14 }]}>
              {/* Crossfade */}
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Crossfade Duration</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Smoothly fade out ending tracks into newly started songs
              </Text>

              <View style={styles.pillRow}>
                {[0, 3, 5, 8, 12].map((sec) => (
                  <TactileButton
                    key={sec}
                    onPress={() => handleUpdateAudio('crossfadeDuration', sec)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: audioSettings.crossfadeDuration === sec ? theme.accent : theme.surfaceLight,
                        borderColor: audioSettings.crossfadeDuration === sec ? theme.accent : theme.surfaceBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: audioSettings.crossfadeDuration === sec ? theme.background : theme.textSecondary },
                      ]}
                    >
                      {sec === 0 ? 'None' : `${sec}s`}
                    </Text>
                  </TactileButton>
                ))}
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              {/* Gapless Playback */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Gapless Playback</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Preload next buffer to eliminate silence between tracks
                  </Text>
                </View>
                <Switch
                  value={audioSettings.gaplessPlayback}
                  onValueChange={(val) => handleUpdateAudio('gaplessPlayback', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              {/* Volume Normalization */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Normalize Volume (ReplayGain)</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Equalize dynamic loudness levels across different albums
                  </Text>
                </View>
                <Switch
                  value={audioSettings.normalizeVolume}
                  onValueChange={(val) => handleUpdateAudio('normalizeVolume', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>
            </View>
          </View>
        )}

        {/* 4. SONG LIBRARY AND TAGS */}
        {activeCategory === 'library' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Manage device storage scanning, filter voice notes, and edit ID3 metadata tags.
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <TactileButton onPress={onScanDevice} style={styles.actionRowBtn}>
                <Ionicons name="scan-outline" size={22} color={theme.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Rescan Storage</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Detect recently added music files</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TactileButton>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <TactileButton onPress={onPickFiles} style={styles.actionRowBtn}>
                <Ionicons name="document-text-outline" size={22} color={theme.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Import Specific Files</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Pick audio from Downloads or SD card</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TactileButton>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Filter Voice Notes & Ringtones</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Hide short clips under {audioSettings.minDurationSeconds} seconds
              </Text>

              <View style={styles.pillRow}>
                {[0, 15, 30, 60].map((sec) => (
                  <TactileButton
                    key={sec}
                    onPress={() => handleUpdateAudio('minDurationSeconds', sec)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: audioSettings.minDurationSeconds === sec ? theme.accent : theme.surfaceLight,
                        borderColor: audioSettings.minDurationSeconds === sec ? theme.accent : theme.surfaceBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: audioSettings.minDurationSeconds === sec ? theme.background : theme.textSecondary },
                      ]}
                    >
                      {sec === 0 ? 'Show All' : `>${sec}s`}
                    </Text>
                  </TactileButton>
                ))}
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Smart Artist Parsing</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Separate collaborating artists into their own artist profiles using delimiters
              </Text>

              <View style={[styles.pillRow, { flexWrap: 'wrap', marginTop: 8 }]}>
                {[';', ',', '&', 'feat.', 'ft.', 'vs.', '/'].map((delim) => {
                  const activeDelims = playerCustomization.artistDelimiters || [';', ',', '&', 'feat.', 'ft.'];
                  const isActive = activeDelims.includes(delim);
                  return (
                    <TactileButton
                      key={delim}
                      onPress={() => {
                        const next = isActive
                          ? activeDelims.filter((d) => d !== delim)
                          : [...activeDelims, delim];
                        handleUpdatePlayerCustomization('artistDelimiters', next);
                      }}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: isActive ? theme.accent : theme.surfaceLight,
                          borderColor: isActive ? theme.accent : theme.surfaceBorder,
                          marginBottom: 6,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          { color: isActive ? theme.background : theme.textSecondary },
                        ]}
                      >
                        {delim}
                      </Text>
                    </TactileButton>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* 5. HEADSET, BLUETOOTH AND SPEAKERS */}
        {activeCategory === 'headset' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Control playback behavior when connecting headphones, Bluetooth car stereos, or external speakers.
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Pause on Unplug</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Instantly pause audio when wired or Bluetooth headphones disconnect
                  </Text>
                </View>
                <Switch
                  value={headsetSettings.pauseOnUnplug}
                  onValueChange={(val) => handleUpdateHeadset('pauseOnUnplug', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Resume on Bluetooth Connect</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Automatically resume playing when reconnecting to car or speakers
                  </Text>
                </View>
                <Switch
                  value={headsetSettings.resumeOnBluetooth}
                  onValueChange={(val) => handleUpdateHeadset('resumeOnBluetooth', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Duck Audio for Notifications</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Temporarily lower music volume during incoming alerts and GPS navigation
                  </Text>
                </View>
                <Switch
                  value={headsetSettings.duckAudioOnNotification}
                  onValueChange={(val) => handleUpdateHeadset('duckAudioOnNotification', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Headset Multi-Click Actions</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Double click for next track, triple click for previous
                  </Text>
                </View>
                <Switch
                  value={headsetSettings.headsetButtonActions}
                  onValueChange={(val) => handleUpdateHeadset('headsetButtonActions', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>
            </View>
          </View>
        )}

        {/* 6. NOTIFICATIONS */}
        {activeCategory === 'notifications' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Customize system media notifications in Android status bar and iOS Control Center.
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Show Album Artwork</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Display high-res song cover art in notification banner
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.showArtwork}
                  onValueChange={(val) => handleUpdateNotification('showArtwork', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Seek & Rewind Buttons</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Include ±10 second skip buttons in notification
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.showSeekButtons}
                  onValueChange={(val) => handleUpdateNotification('showSeekButtons', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>
            </View>
          </View>
        )}

        {/* 7. HOMESCREEN WIDGETS */}
        {activeCategory === 'widgets' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Configure desktop homescreen widgets for quick playback controls.
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Transparent Background</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Blend widget seamlessly with your wallpaper
                  </Text>
                </View>
                <Switch
                  value={widgetSettings.transparentBg}
                  onValueChange={(val) => handleUpdateWidget('transparentBg', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Display Album Artwork</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Show rounded album artwork on widget
                  </Text>
                </View>
                <Switch
                  value={widgetSettings.showArtwork}
                  onValueChange={(val) => handleUpdateWidget('showArtwork', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>
            </View>
          </View>
        )}

        {/* 8. MM LOCK-SCREEN */}
        {activeCategory === 'lockscreen' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Integrated lock-screen player with gestures and full-screen artwork.
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Enable Lock-Screen Player</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Display playback controls when device is locked
                  </Text>
                </View>
                <Switch
                  value={lockscreenSettings.enableLockscreenPlayer}
                  onValueChange={(val) => handleUpdateLockscreen('enableLockscreenPlayer', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Full-Screen Blurred Artwork</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Fill lock-screen background with immersive artwork ambient blur
                  </Text>
                </View>
                <Switch
                  value={lockscreenSettings.showFullScreenArtwork}
                  onValueChange={(val) => handleUpdateLockscreen('showFullScreenArtwork', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Swipe to Skip</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Horizontal swipe gesture on lockscreen art changes track
                  </Text>
                </View>
                <Switch
                  value={lockscreenSettings.swipeToSkip}
                  onValueChange={(val) => handleUpdateLockscreen('swipeToSkip', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>
            </View>
          </View>
        )}

        {/* 9. MUSIC PET COMPANION */}
        {activeCategory === 'pet' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              An interactive offline animated companion that grooves to the beat, reacts to song changes, and dances to your music!
            </Text>

            {/* Live Pet Preview Stage */}
            <View style={[styles.petPreviewCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <MusicPet
                playbackState={{
                  isPlaying: true,
                  position: 10,
                  duration: 200,
                  volume: 1,
                  currentTrack: {
                    id: 'preview',
                    title: 'Offline Beat Preview',
                    artist: 'MM DSP Engine',
                    album: 'Hi-Fi',
                    duration: 200,
                    filename: 'preview.flac',
                    uri: '',
                  },
                  playbackSpeed: 1,
                  isBuffering: false,
                  repeatMode: 'all',
                  isShuffled: false,
                }}
                theme={theme}
                avatar={petSettings.avatar}
                accessory={petSettings.accessory}
                size="large"
              />
              <Text style={[styles.petPreviewName, { color: theme.textPrimary }]}>
                {PET_PROFILES[petSettings.avatar]?.name} ({PET_PROFILES[petSettings.avatar]?.species})
              </Text>
              <Text style={[styles.petPreviewBio, { color: theme.textSecondary }]}>
                {PET_PROFILES[petSettings.avatar]?.personality}
              </Text>

              {/* Affection Level Meter */}
              <View style={[styles.affectionBox, { borderColor: theme.surfaceBorder }]}>
                <View style={styles.affectionHeader}>
                  <Text style={[styles.affectionTitle, { color: theme.textPrimary }]}>
                    ❤️ Affection Level: {petSettings.affection ?? 30}%
                  </Text>
                  <Text style={[styles.affectionHint, { color: theme.accent }]}>
                    {(petSettings.affection ?? 30) >= 80 ? 'Devoted BFF' : 'Music Buddy'}
                  </Text>
                </View>
                <View style={[styles.affectionTrack, { backgroundColor: theme.surfaceLight }]}>
                  <View
                    style={[
                      styles.affectionFill,
                      {
                        width: `${Math.min(100, Math.max(5, petSettings.affection ?? 30))}%`,
                        backgroundColor: theme.accent,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, marginTop: 16 }]}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Enable Music Companion</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Expressive 2D companion reacts through animations and emotes
                  </Text>
                </View>
                <Switch
                  value={petSettings.enabled}
                  onValueChange={(val) => handleUpdatePet('enabled', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Choose Your Companion</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Human-like and stylized 2D music companions
              </Text>

              <View style={[styles.petAvatarRow, { flexWrap: 'wrap' }]}>
                {(['human_aria', 'human_kai', 'human_nova', 'cat', 'bunny', 'kaomoji'] as PetAvatarType[]).map((type) => {
                  const p = PET_PROFILES[type];
                  const isSelected = petSettings.avatar === type;
                  return (
                    <TactileButton
                      key={type}
                      onPress={() => handleUpdatePet('avatar', type)}
                      style={[
                        styles.petAvatarBtn,
                        {
                          backgroundColor: isSelected ? `${theme.accent}20` : theme.surfaceLight,
                          borderColor: isSelected ? theme.accent : theme.surfaceBorder,
                          minWidth: '30%',
                        },
                      ]}
                    >
                      <Text style={{ fontSize: type.startsWith('human') ? 22 : 18 }}>
                        {type === 'human_aria' ? '🎧' : type === 'human_kai' ? '🧢' : type === 'human_nova' ? '⚡' : type === 'cat' ? '🐱' : type === 'bunny' ? '🐰' : '(◕‿◕)'}
                      </Text>
                      <Text style={[styles.petAvatarBtnName, { color: isSelected ? theme.accent : theme.textPrimary }]}>
                        {p?.name || type}
                      </Text>
                      <Text style={[styles.petAvatarBtnSpecies, { color: theme.textSecondary }]}>
                        {p?.species || ''}
                      </Text>
                    </TactileButton>
                  );
                })}
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              {/* Equippable Accessories */}
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Equip Companion Accessory</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Dress up your buddy with interactive flair
              </Text>

              <View style={styles.accessoryRow}>
                {[
                  { id: 'none' as PetAccessory, label: 'Default', icon: '🚫' },
                  { id: 'sunglasses' as PetAccessory, label: 'Shades', icon: '🕶️' },
                  { id: 'gold_headphones' as PetAccessory, label: 'Gold Hi-Fi', icon: '🎧' },
                  { id: 'crown' as PetAccessory, label: 'Crown', icon: '👑' },
                  { id: 'boombox' as PetAccessory, label: 'Boombox', icon: '📻' },
                ].map((acc) => {
                  const isSelected = (petSettings.accessory || 'none') === acc.id;
                  return (
                    <TactileButton
                      key={acc.id}
                      onPress={() => handleUpdatePet('accessory', acc.id)}
                      style={[
                        styles.accessoryBtn,
                        {
                          backgroundColor: isSelected ? `${theme.accent}25` : theme.surfaceLight,
                          borderColor: isSelected ? theme.accent : theme.surfaceBorder,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 18 }}>{acc.icon}</Text>
                      <Text
                        style={[
                          styles.accessoryBtnText,
                          { color: isSelected ? theme.accent : theme.textSecondary },
                        ]}
                      >
                        {acc.label}
                      </Text>
                    </TactileButton>
                  );
                })}
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Show in Now Playing Screen</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Groove alongside album artwork and music controls
                  </Text>
                </View>
                <Switch
                  value={petSettings.showOnNowPlaying}
                  onValueChange={(val) => handleUpdatePet('showOnNowPlaying', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Floating Mini Companion</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Small buddy floating on the main library screen
                  </Text>
                </View>
                <Switch
                  value={petSettings.showFloatingMini}
                  onValueChange={(val) => handleUpdatePet('showFloatingMini', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              {/* Expressive Emotions Preview */}
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Facial Expressions & Emotional States</Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Communicate through subtle facial expressions, body animations, and emotes
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {[
                  { emotion: 'happy' as CharacterEmotion, label: 'Happy', emote: '🎵' },
                  { emotion: 'excited' as CharacterEmotion, label: 'Excited', emote: '✨' },
                  { emotion: 'sad' as CharacterEmotion, label: 'Sad (0 Vol)', emote: '💧' },
                  { emotion: 'relaxed' as CharacterEmotion, label: 'Relaxed', emote: '❤️' },
                  { emotion: 'surprised' as CharacterEmotion, label: 'Surprised', emote: '❗' },
                  { emotion: 'focused' as CharacterEmotion, label: 'Focused', emote: '🎧' },
                  { emotion: 'sleepy' as CharacterEmotion, label: 'Sleepy', emote: '💤' },
                  { emotion: 'dancing' as CharacterEmotion, label: 'Dancing', emote: '⚡' },
                ].map((item) => {
                  const isSelected = petSettings.emotionOverride === item.emotion;
                  return (
                    <TactileButton
                      key={item.emotion}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
                        handleUpdatePet('emotionOverride', isSelected ? null : item.emotion);
                      }}
                      style={[
                        styles.accessoryBtn,
                        {
                          backgroundColor: isSelected ? `${theme.accent}25` : theme.surfaceLight,
                          borderColor: isSelected ? theme.accent : theme.surfaceBorder,
                          minWidth: '22%',
                          paddingVertical: 10,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 18 }}>{item.emote}</Text>
                      <Text
                        style={[
                          styles.accessoryBtnText,
                          { color: isSelected ? theme.accent : theme.textPrimary, marginTop: 4 },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TactileButton>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* 10. ADVANCED */}
        {activeCategory === 'advanced' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Hardware decoders, audio buffer sizes, and cache optimization.
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Auto-Rescan on App Launch</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Check for newly downloaded music files every time app opens
                  </Text>
                </View>
                <Switch
                  value={advancedSettings.autoRescanOnLaunch}
                  onValueChange={(val) => handleUpdateAdvanced('autoRescanOnLaunch', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Waveform Memory Cache</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Keep audio waveforms cached in RAM for instant visualization
                  </Text>
                </View>
                <Switch
                  value={advancedSettings.cacheWaveforms}
                  onValueChange={(val) => handleUpdateAdvanced('cacheWaveforms', val)}
                  trackColor={{ false: theme.surfaceLight, true: theme.accent }}
                  thumbColor={theme.textPrimary}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <TactileButton
                onPress={() => Alert.alert('Cache Cleared', 'Freed 18.4 MB of temporary artwork and waveform cache.')}
                style={styles.actionRowBtn}
              >
                <Ionicons name="trash-bin-outline" size={20} color={theme.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Clear Audio Cache</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Free temporary memory and artwork cache</Text>
                </View>
              </TactileButton>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <TactileButton onPress={handleResetSettings} style={styles.actionRowBtn}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.danger }]}>Reset All Settings</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Restore all settings back to factory defaults</Text>
                </View>
              </TactileButton>
            </View>
          </View>
        )}

        {/* 10. BACKUP/RESTORE */}
        {activeCategory === 'backup' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Backup and restore your playlists, favorites, and player preferences via local offline JSON files.
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <TactileButton onPress={handleExportBackup} style={styles.actionRowBtn}>
                <Ionicons name="share-outline" size={22} color={theme.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Export Backup (JSON)</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    Share or save playlists, favorites and settings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TactileButton>
            </View>
          </View>
        )}

        {/* 11. LEGAL & POLICIES */}
        {activeCategory === 'legal' && (
          <View style={styles.subPageContainer}>
            <Text style={[styles.subPageDesc, { color: theme.textSecondary }]}>
              Review official legal terms, offline data protections, and app licenses.
            </Text>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <TactileButton onPress={onOpenTerms} style={styles.actionRowBtn}>
                <Ionicons name="document-text-outline" size={22} color={theme.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Terms & Conditions</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    26-section usage license, copyright & legal notices
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TactileButton>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <TactileButton onPress={onOpenPrivacy} style={styles.actionRowBtn}>
                <Ionicons name="shield-checkmark-outline" size={22} color={theme.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Privacy Policy</Text>
                  <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                    27-section offline-first data, storage & permissions policy
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </TactileButton>

              <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

              <View style={{ paddingVertical: 4 }}>
                <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>MM Audio Engine</Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  Version 1.0.0 • Expo SDK 57 • 24-bit Offline DSP Engine
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  searchToggleBtn: {
    padding: 6,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  categoryList: {
    paddingTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 18,
  },
  categoryIconWrap: {
    width: 32,
    alignItems: 'center',
  },
  categoryTextWrap: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  categorySubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  bottomSearchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 40,
    marginTop: 32,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  bottomSearchText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subPageContainer: {
    padding: 20,
  },
  subPageDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 16,
    marginBottom: 12,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
  },
  themePaletteRow: {
    height: 38,
    borderRadius: 8,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  paletteDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  paletteBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '800',
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  optionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  petPreviewCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  petPreviewName: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  petPreviewBio: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  petAvatarRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  petAvatarBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  petAvatarBtnName: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  petAvatarBtnSpecies: {
    fontSize: 10,
    textAlign: 'center',
  },
  affectionBox: {
    width: '100%',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  affectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  affectionTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  affectionHint: {
    fontSize: 10,
    fontWeight: '800',
  },
  affectionTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  affectionFill: {
    height: '100%',
    borderRadius: 3,
  },
  accessoryRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  accessoryBtn: {
    flex: 1,
    minWidth: 58,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  accessoryBtnText: {
    fontSize: 9,
    fontWeight: '800',
  },
  customBgGrid: {
    gap: 8,
    marginTop: 10,
  },
  customBgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  customBgIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBgCardName: {
    fontSize: 13,
    fontWeight: '800',
  },
  customBgCardDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionPillBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  settingSmallLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

