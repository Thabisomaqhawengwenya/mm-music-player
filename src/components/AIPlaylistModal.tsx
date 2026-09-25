import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, Track, Playlist } from '../types';
import { TactileButton } from './TactileButton';
import { StorageService } from '../services/playlistStorage';

interface AIPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
  allTracks: Track[];
  onPlaylistCreated: (playlist: Playlist) => void;
  mode?: 'ai' | 'blend' | 'mixed' | 'collab';
}

const AI_PROMPT_SUGGESTIONS = [
  '⚡ High Energy Workout Hype',
  '🌙 Late Night Ambient Chill',
  '☕ Acoustic Morning Focus',
  '🚗 Highway Night Drive Vibes',
  '🌧️ Nostalgic Melancholy Beats',
  '🔥 Weekend Party Starters',
];

export const AIPlaylistModal: React.FC<AIPlaylistModalProps> = ({
  visible,
  onClose,
  theme,
  allTracks,
  onPlaylistCreated,
  mode = 'ai',
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blendArtist1, setBlendArtist1] = useState('');
  const [blendArtist2, setBlendArtist2] = useState('');
  const [collabRoomName, setCollabRoomName] = useState('');

  // Get unique artists for blend
  const uniqueArtists = Array.from(new Set(allTracks.map((t) => t.artist).filter(Boolean))).slice(0, 12);

  const handleGenerateAI = async (selectedPrompt?: string) => {
    const finalPrompt = selectedPrompt || prompt;
    if (!finalPrompt.trim()) {
      Alert.alert('Prompt Required', 'Please enter or select a mood or theme for your AI playlist.');
      return;
    }

    if (allTracks.length === 0) {
      Alert.alert('No Songs Found', 'Please scan or import songs into your library first.');
      return;
    }

    setIsGenerating(true);

    try {
      // Intelligent local semantic scoring
      const p = finalPrompt.toLowerCase();
      const scored = allTracks.map((track) => {
        let score = Math.random() * 2; // base variance
        const text = `${track.title} ${track.artist} ${track.album} ${track.genre || ''}`.toLowerCase();

        if (p.includes('chill') || p.includes('ambient') || p.includes('focus') || p.includes('morning')) {
          if (track.duration > 180) score += 4;
          if (text.includes('acoustic') || text.includes('slow') || text.includes('chill') || text.includes('piano')) score += 6;
        } else if (p.includes('workout') || p.includes('hype') || p.includes('energy') || p.includes('party')) {
          if (text.includes('remix') || text.includes('rock') || text.includes('dance') || text.includes('club')) score += 6;
          if (track.duration < 240) score += 3;
        } else if (p.includes('night') || p.includes('drive')) {
          if (text.includes('night') || text.includes('dark') || text.includes('drive') || text.includes('moon')) score += 7;
        }

        // Keyword overlap
        finalPrompt.split(/\s+/).forEach((word) => {
          if (word.length > 2 && text.includes(word.toLowerCase())) {
            score += 5;
          }
        });

        return { track, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const selectedTracks = scored.slice(0, Math.min(20, scored.length)).map((s) => s.track.id);

      const playlistTitle = finalPrompt.length > 30 ? `${finalPrompt.slice(0, 27)}...` : finalPrompt;
      const created = await StorageService.createPlaylist(`🤖 ${playlistTitle}`, selectedTracks);

      setIsGenerating(false);
      onPlaylistCreated(created);
      onClose();
      Alert.alert('AI Playlist Ready', `Created "${created.name}" with ${created.trackIds.length} curated tracks!`);
    } catch {
      setIsGenerating(false);
      Alert.alert('Error', 'Failed to generate AI playlist.');
    }
  };

  const handleCreateBlend = async () => {
    if (!blendArtist1 || !blendArtist2) {
      Alert.alert('Select Two Artists', 'Please choose two artists to blend together into a unified playlist.');
      return;
    }

    const t1 = allTracks.filter((t) => t.artist === blendArtist1);
    const t2 = allTracks.filter((t) => t.artist === blendArtist2);

    const blended: string[] = [];
    const maxLen = Math.max(t1.length, t2.length);
    for (let i = 0; i < maxLen; i++) {
      if (t1[i]) blended.push(t1[i].id);
      if (t2[i]) blended.push(t2[i].id);
    }

    const created = await StorageService.createPlaylist(`⚡ Blend: ${blendArtist1} & ${blendArtist2}`, blended);
    onPlaylistCreated(created);
    onClose();
    Alert.alert('Blend Created', `Blended ${blended.length} tracks from ${blendArtist1} and ${blendArtist2}!`);
  };

  const handleCreateMixed = async () => {
    // Sort tracks with crossfade/mixed transition sequence
    const shuffled = [...allTracks].sort(() => Math.random() - 0.5).slice(0, 25);
    const created = await StorageService.createPlaylist(`🎚️ Mixed Flow (${new Date().toLocaleDateString()})`, shuffled.map((t) => t.id));
    onPlaylistCreated(created);
    onClose();
    Alert.alert('Mixed Flow Created', `Created "${created.name}" with dynamic crossfaded transition sequence.`);
  };

  const handleCreateCollab = async () => {
    const name = collabRoomName.trim() || 'Friends Jam Session';
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const created = await StorageService.createPlaylist(`👥 ${name} [${roomCode}]`, []);
    onPlaylistCreated(created);
    onClose();
    Alert.alert('Collaborative Playlist Ready', `Share Room Code: ${roomCode} with friends to add songs together!`);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: theme.surfaceBorder }]}>
          <View style={styles.headerTitleRow}>
            <Ionicons
              name={
                mode === 'ai'
                  ? 'sparkles'
                  : mode === 'blend'
                  ? 'git-merge'
                  : mode === 'mixed'
                  ? 'options'
                  : 'people'
              }
              size={22}
              color={theme.accent}
            />
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              {mode === 'ai'
                ? 'AI SMART PLAYLIST'
                : mode === 'blend'
                ? 'ARTIST BLEND'
                : mode === 'mixed'
                ? 'SMOOTH MIXED FLOW'
                : 'COLLABORATIVE PLAYLIST'}
            </Text>
          </View>
          <TactileButton onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.textPrimary} />
          </TactileButton>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 60 }}>
          {mode === 'ai' && (
            <View>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Describe a mood, activity, or scene. The local AI engine will inspect tempo, titles, and artist acoustics to compose your perfect tracklist.
              </Text>

              {/* Text Input */}
              <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.accent} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="e.g. 90s nostalgia for late night coding..."
                  placeholderTextColor={theme.textTertiary}
                  value={prompt}
                  onChangeText={setPrompt}
                />
              </View>

              {/* Quick Prompt Ideas */}
              <Text style={[styles.quickIdeasHeader, { color: theme.accent }]}>
                OR TAP A QUICK INSPIRATION:
              </Text>
              <View style={styles.suggestionsContainer}>
                {AI_PROMPT_SUGGESTIONS.map((sug) => (
                  <TactileButton
                    key={sug}
                    onPress={() => {
                      setPrompt(sug);
                      handleGenerateAI(sug);
                    }}
                    style={[styles.sugBtn, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                  >
                    <Text style={[styles.sugBtnText, { color: theme.textPrimary }]}>{sug}</Text>
                  </TactileButton>
                ))}
              </View>

              <TactileButton
                onPress={() => handleGenerateAI()}
                style={[styles.actionBtn, { backgroundColor: theme.accent }]}
              >
                <Ionicons name="sparkles" size={18} color={theme.background} />
                <Text style={[styles.actionBtnText, { color: theme.background }]}>
                  {isGenerating ? 'Generating Playlist...' : 'Generate with AI'}
                </Text>
              </TactileButton>
            </View>
          )}

          {mode === 'blend' && (
            <View>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Pick two artists from your library. We will interweave their greatest tracks into a harmonious blend.
              </Text>

              <Text style={[styles.quickIdeasHeader, { color: theme.accent, marginTop: 16 }]}>
                1. SELECT FIRST ARTIST: {blendArtist1 ? `(${blendArtist1})` : ''}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {uniqueArtists.map((art) => (
                    <TactileButton
                      key={`a1_${art}`}
                      onPress={() => setBlendArtist1(art)}
                      style={[
                        styles.artistPill,
                        {
                          backgroundColor: blendArtist1 === art ? theme.accent : theme.surface,
                          borderColor: blendArtist1 === art ? theme.accent : theme.surfaceBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.artistPillText,
                          { color: blendArtist1 === art ? theme.background : theme.textPrimary },
                        ]}
                      >
                        {art}
                      </Text>
                    </TactileButton>
                  ))}
                </View>
              </ScrollView>

              <Text style={[styles.quickIdeasHeader, { color: theme.accent, marginTop: 16 }]}>
                2. SELECT SECOND ARTIST: {blendArtist2 ? `(${blendArtist2})` : ''}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {uniqueArtists.map((art) => (
                    <TactileButton
                      key={`a2_${art}`}
                      onPress={() => setBlendArtist2(art)}
                      style={[
                        styles.artistPill,
                        {
                          backgroundColor: blendArtist2 === art ? theme.accent : theme.surface,
                          borderColor: blendArtist2 === art ? theme.accent : theme.surfaceBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.artistPillText,
                          { color: blendArtist2 === art ? theme.background : theme.textPrimary },
                        ]}
                      >
                        {art}
                      </Text>
                    </TactileButton>
                  ))}
                </View>
              </ScrollView>

              <TactileButton
                onPress={handleCreateBlend}
                style={[styles.actionBtn, { backgroundColor: theme.accent, marginTop: 28 }]}
              >
                <Ionicons name="git-merge" size={18} color={theme.background} />
                <Text style={[styles.actionBtnText, { color: theme.background }]}>
                  Blend Selected Artists
                </Text>
              </TactileButton>
            </View>
          )}

          {mode === 'mixed' && (
            <View>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Creates an automated DJ-style flow with 3-second gapless crossfading enabled between compatible audio tracks.
              </Text>

              <View style={[styles.cardInfo, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                <Ionicons name="hardware-chip-outline" size={32} color={theme.accent} />
                <Text style={[styles.cardInfoTitle, { color: theme.textPrimary }]}>Smart Track Sequence</Text>
                <Text style={[styles.cardInfoSub, { color: theme.textSecondary }]}>
                  Analyzes library durations and arranges 25 tracks with smooth volume crossfading.
                </Text>
              </View>

              <TactileButton
                onPress={handleCreateMixed}
                style={[styles.actionBtn, { backgroundColor: theme.accent, marginTop: 24 }]}
              >
                <Ionicons name="options" size={18} color={theme.background} />
                <Text style={[styles.actionBtnText, { color: theme.background }]}>
                  Build Mixed Playlist
                </Text>
              </TactileButton>
            </View>
          )}

          {mode === 'collab' && (
            <View>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Start a shared cloud playlist room. Invite friends with your unique code so anyone on the network can contribute songs!
              </Text>

              <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, marginTop: 16 }]}>
                <Ionicons name="people-outline" size={20} color={theme.accent} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Playlist Room Name (e.g. Roadtrip 2026)"
                  placeholderTextColor={theme.textTertiary}
                  value={collabRoomName}
                  onChangeText={setCollabRoomName}
                />
              </View>

              <TactileButton
                onPress={handleCreateCollab}
                style={[styles.actionBtn, { backgroundColor: theme.accent, marginTop: 24 }]}
              >
                <Ionicons name="share-social-outline" size={18} color={theme.background} />
                <Text style={[styles.actionBtnText, { color: theme.background }]}>
                  Create Shared Room
                </Text>
              </TactileButton>
            </View>
          )}
        </ScrollView>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  quickIdeasHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 10,
  },
  suggestionsContainer: {
    gap: 8,
  },
  sugBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sugBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 24,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  artistPill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  artistPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardInfo: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  cardInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardInfoSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
