import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track, AppTheme } from '@/src/types';
import { StorageService } from '@/src/services/playlistStorage';
import { TactileButton } from './TactileButton';
import * as Haptics from 'expo-haptics';

interface TagEditorModalProps {
  visible: boolean;
  track: Track | null;
  theme: AppTheme;
  onClose: () => void;
  onSaved: (updatedTrack: Track) => void;
}

export const TagEditorModal: React.FC<TagEditorModalProps> = ({
  visible,
  track,
  theme,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setArtist(track.artist || '');
      setAlbum(track.album || '');
      setGenre(track.genre || '');
      setYear(track.year || '');
    }
  }, [track]);

  if (!track) return null;

  const handleSave = async () => {
    const updatedMetadata = {
      title: title.trim() || track.filename,
      artist: artist.trim() || 'Unknown Artist',
      album: album.trim() || 'Unknown Album',
      genre: genre.trim() || 'Local Audio',
      year: year.trim(),
    };

    await StorageService.saveTrackMetadataOverride(track.id, updatedMetadata);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const updatedTrack: Track = {
      ...track,
      ...updatedMetadata,
    };

    onSaved(updatedTrack);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="create" size={22} color={theme.accent} />
              <Text style={[styles.title, { color: theme.textPrimary }]}>EDIT TRACK METADATA</Text>
            </View>
            <TactileButton onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textPrimary} />
            </TactileButton>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* File info notice */}
            <View style={[styles.infoBanner, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <Ionicons name="information-circle-outline" size={20} color={theme.accent} />
              <View style={styles.infoBannerTextCol}>
                <Text style={[styles.filenameText, { color: theme.textPrimary }]} numberOfLines={1}>
                  {track.filename}
                </Text>
                <Text style={[styles.filepathText, { color: theme.textTertiary }]} numberOfLines={1}>
                  {track.folder || 'Local Storage'}
                </Text>
              </View>
            </View>

            {/* Inputs */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>TRACK TITLE</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Song title..."
                placeholderTextColor={theme.textTertiary}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceBorder,
                    color: theme.textPrimary,
                  },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>ARTIST NAME</Text>
              <TextInput
                value={artist}
                onChangeText={setArtist}
                placeholder="Artist name..."
                placeholderTextColor={theme.textTertiary}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceBorder,
                    color: theme.textPrimary,
                  },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>ALBUM NAME</Text>
              <TextInput
                value={album}
                onChangeText={setAlbum}
                placeholder="Album name..."
                placeholderTextColor={theme.textTertiary}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceBorder,
                    color: theme.textPrimary,
                  },
                ]}
              />
            </View>

            <View style={styles.rowTwoCols}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>GENRE</Text>
                <TextInput
                  value={genre}
                  onChangeText={setGenre}
                  placeholder="Genre..."
                  placeholderTextColor={theme.textTertiary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.surfaceBorder,
                      color: theme.textPrimary,
                    },
                  ]}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 0.7 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>YEAR</Text>
                <TextInput
                  value={year}
                  onChangeText={setYear}
                  placeholder="2026"
                  keyboardType="numeric"
                  placeholderTextColor={theme.textTertiary}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.surfaceBorder,
                      color: theme.textPrimary,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Save Button */}
            <TactileButton
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={[styles.saveBtnText, { color: theme.background }]}>
                SAVE METADATA
              </Text>
            </TactileButton>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 20,
  },
  infoBannerTextCol: {
    flex: 1,
  },
  filenameText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filepathText: {
    fontSize: 11,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
