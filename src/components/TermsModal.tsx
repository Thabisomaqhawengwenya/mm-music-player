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

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
}

export const TermsModal: React.FC<TermsModalProps> = ({
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
            <Ionicons name="document-text" size={22} color={theme.accent} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              TERMS & CONDITIONS
            </Text>
          </View>
          <TactileButton onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.textPrimary} />
          </TactileButton>
        </View>

        {/* Scrollable Terms Content */}
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
              Welcome to <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>MM Music Player</Text> ("App", "Application", "Service", "we", "us", or "our"), developed and operated by <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>Maqhawe T Ngwenya</Text>.
            </Text>
            <Text style={[styles.metaNotice, { color: theme.textTertiary }]}>
              By downloading, installing, accessing, or using the App, you acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy.
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>1. Description of the Service</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              MM Music Player is an application designed primarily to allow users to access and play compatible audio files stored on their device. Available functionality includes:
            </Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Scanning locally stored audio files</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Creating and managing a personal music library</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Playing music stored on the device</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Creating and managing custom playlists</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Adding songs to favorites</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Searching songs, artists, albums, or metadata</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• 5-band equalizer and DSP audio processing</Text>
            <Text style={[styles.bullet, { color: theme.textSecondary }]}>• Offline and optional delta cloud sync backup</Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>2. Eligibility</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              You may use the App only if you are legally capable of entering into these Terms under the laws applicable to you. If you are under the legal age, you should use the App only with the involvement and permission of a parent or guardian.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>3. License to Use the App</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              We grant you a limited, non-exclusive, non-transferable, non-sublicensable, and revocable license to install and use the App for personal and lawful use. All rights not expressly granted are reserved.
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>4. Your Music & Content</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              You remain responsible for the audio content stored on, imported into, or played through the App. We do not claim ownership of your music files, recordings, or metadata. You are responsible for ensuring that you have necessary legal authorizations to possess and play copyrighted material.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>5. Copyright & IP</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              You agree not to use the App to knowingly infringe copyright, circumvent protection mechanisms, or distribute unauthorized copies of copyrighted music. We do not authorize or encourage copyright infringement.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>6. Local Device Storage</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              The App accesses storage files (audio files, metadata, album art) purely to provide playback functionality. You may manage these permissions anytime through your device's operating-system settings.
            </Text>
          </View>

          {/* Section 7 & 8 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>7. Availability & Backups</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              Compatibility depends on audio codecs, hardware, and OS restrictions. You are responsible for maintaining independent backups of your personal audio files.
            </Text>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>8. Acceptable Use</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              You agree to use the App only for lawful purposes. You must not attempt to reverse engineer, disrupt, overload, or introduce malicious code into the App or its synchronization backend.
            </Text>
          </View>

          {/* Section 18 & 19 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>9. Warranties & Limitation of Liability</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              The App is provided on an "as is" and "as available" basis without warranties of any kind. To the maximum extent permitted by applicable law, Maqhawe T Ngwenya and affiliates will not be liable for indirect, incidental, or consequential damages.
            </Text>
          </View>

          {/* Section 23 */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.accent }]}>10. Governing Law</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              These Terms are governed by and interpreted according to the laws of South Africa, without regard to conflict-of-law principles.
            </Text>
          </View>

          {/* Section 26 */}
          <View style={[styles.contactCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
            <Text style={[styles.contactTitle, { color: theme.accent }]}>Contact Information</Text>
            <Text style={[styles.contactDetail, { color: theme.textPrimary }]}>
              App: MM Music Player
            </Text>
            <Text style={[styles.contactDetail, { color: theme.textPrimary }]}>
              Developer: Maqhawe T Ngwenya
            </Text>
            <Text style={[styles.contactDetail, { color: theme.textPrimary }]}>
              Email: thabisomaqhawengwenya@gmail.com
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Accept / Dismiss Button */}
        <View style={[styles.bottomBar, { borderTopColor: theme.surfaceBorder }]}>
          <TactileButton
            onPress={onClose}
            style={[styles.acceptBtn, { backgroundColor: theme.accent }]}
          >
            <Text style={[styles.acceptBtnText, { color: theme.background }]}>
              I Understand & Agree
            </Text>
          </TactileButton>
        </View>
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
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  metaBanner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaIntro: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  metaNotice: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 4,
  },
  contactCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  contactDetail: {
    fontSize: 13,
    lineHeight: 20,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  acceptBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
