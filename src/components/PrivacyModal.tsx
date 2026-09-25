import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../types';
import { TactileButton } from './TactileButton';

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  visible,
  onClose,
  theme,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Navigation Bar */}
        <View style={[styles.topBar, { borderBottomColor: theme.surfaceBorder }]}>
          <View style={styles.titleRow}>
            <Ionicons name="shield-checkmark" size={22} color={theme.accent} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              PRIVACY POLICY
            </Text>
          </View>
          <TactileButton onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.textPrimary} />
          </TactileButton>
        </View>

        {/* Scrollable Policy Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Metadata Banner */}
          <View style={[styles.metaBanner, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={[styles.metaText, { color: theme.accent }]}>
              Effective Date: September 25, 2026
            </Text>
            <Text style={[styles.metaText, { color: theme.textTertiary }]}>
              Last Updated: September 25, 2026
            </Text>
            <Text style={[styles.metaIntro, { color: theme.textSecondary }]}>
              This Privacy Policy explains how <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>Maqhawe T Ngwenya</Text> ("we", "us", or "our") collects, uses, stores, protects, and handles information in connection with <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>MM Music Player</Text> ("App").
            </Text>
            <Text style={[styles.metaNotice, { color: theme.textTertiary }]}>
              We designed MM Music Player primarily as an offline music application. Our goal is to minimize unnecessary collection of personal information and keep music-library information on your device.
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>1. Scope of This Privacy Policy</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              This Privacy Policy applies to information processed through MM Music Player mobile, desktop, or other supported versions. It does not apply to third-party services that may have their own independent privacy terms.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>2. Information We Collect</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              MM Music Player operates offline and does not require account creation to play your songs. We do NOT collect your full name, email, telephone number, contacts, precise location, government ID, or personal communications for offline playback.
            </Text>
          </View>

          {/* Section 3 & 4 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>3 & 4. Music Library & Audio Files</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              The App accesses local audio files stored on your device to display album art, song titles, artists, genres, track numbers, and playback durations.
            </Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Audio files are processed locally on your hardware.</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• We do NOT upload your personal music files to our servers.</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Your music files remain under your complete control.</Text>
          </View>

          {/* Section 5 & 6 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>5 & 6. Playlists, Favorites & History</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              Custom playlists, favorites, playback order, and recently played tracks are stored locally on your device storage. We do not use your playback history for advertising or behavioral profiling.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>7. Device Permissions</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              The App may request the following device permissions:
            </Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Audio & Media: To scan, read metadata, and play compatible music.</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Notifications: To display lockscreen and notification bar media controls.</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Foreground Service: To continue playback seamlessly when the app is in the background.</Text>
          </View>

          {/* Section 8 & 9 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>8 & 9. Local Storage & Automatic Data</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              App preferences such as audio equalizer presets, theme colors, crossfade duration, and minimum audio filters are stored directly in your device's isolated storage sandbox.
            </Text>
          </View>

          {/* Section 12 & 14 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>12 & 14. Internet Connectivity & Advertising</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              All core playback functionality is 100% offline. Network connectivity is only utilized if you choose to enable the optional private cloud backup dashboard. MM Music Player does not sell your data to brokers.
            </Text>
          </View>

          {/* Section 18 & 19 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>18 & 19. Content Ownership & Security</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              We claim zero ownership over the music stored on your device. You retain full ownership of your personal audio files. We employ reasonable security measures to safeguard app configurations.
            </Text>
          </View>

          {/* Section 21 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>21. Deleting Your Data</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              You can delete locally stored information at any time by clearing app data, removing playlists, or resetting the app to default settings through the Settings tab.
            </Text>
          </View>

          {/* Section 27 - Contact */}
          <View style={[styles.contactCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={[styles.sectionHeading, { color: theme.accent, marginTop: 0 }]}>27. Contact Us</Text>
            <Text style={[styles.contactRow, { color: theme.textPrimary }]}>
              App: <Text style={{ color: theme.textSecondary }}>MM Music Player</Text>
            </Text>
            <Text style={[styles.contactRow, { color: theme.textPrimary }]}>
              Developer: <Text style={{ color: theme.textSecondary }}>Maqhawe T Ngwenya</Text>
            </Text>
            <Text style={[styles.contactRow, { color: theme.textPrimary }]}>
              Email: <Text style={{ color: theme.accent }}>thabisomaqhawengwenya@gmail.com</Text>
            </Text>
            <Text style={[styles.contactRow, { color: theme.textPrimary }]}>
              Jurisdiction: <Text style={{ color: theme.textSecondary }}>South Africa</Text>
            </Text>
          </View>

          {/* Agree Button */}
          <TactileButton
            onPress={onClose}
            style={[styles.agreeBtn, { backgroundColor: theme.accent }]}
          >
            <Ionicons name="checkmark-circle" size={20} color={theme.background} />
            <Text style={[styles.agreeBtnText, { color: theme.background }]}>
              I Understand & Accept
            </Text>
          </TactileButton>
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  metaBanner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metaIntro: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  metaNotice: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 8,
    marginTop: 3,
  },
  contactCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 24,
    gap: 8,
  },
  contactRow: {
    fontSize: 13,
    fontWeight: '700',
  },
  agreeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  agreeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
