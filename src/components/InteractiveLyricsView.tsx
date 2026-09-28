import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppTheme, Track } from '../types';
import { TactileButton } from './TactileButton';
import { formatTime } from '../utils/formatters';

interface LyricLine {
  id: string;
  seconds: number;
  text: string;
  isCustomStamped?: boolean;
}

interface InteractiveLyricsViewProps {
  track: Track;
  currentPosition: number;
  duration: number;
  theme: AppTheme;
  onSeek: (seconds: number) => void;
  onSaveLyrics: (newLyrics: string) => void;
}

export const InteractiveLyricsView: React.FC<InteractiveLyricsViewProps> = ({
  track,
  currentPosition,
  duration,
  theme,
  onSeek,
  onSaveLyrics,
}) => {
  const [isStampMode, setIsStampMode] = useState(false);
  const [stampedIndex, setStampedIndex] = useState(0);
  const [customLines, setCustomLines] = useState<LyricLine[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const lineLayouts = useRef<{ [key: number]: number }>({});

  // Parse raw lyrics into LyricLine items
  const parsedLines = useMemo<LyricLine[]>(() => {
    const raw = track.lyrics || '';
    if (!raw.trim()) {
      return [
        { id: 'placeholder-1', seconds: 0, text: track.title },
        { id: 'placeholder-2', seconds: 5, text: `by ${track.artist}` },
        { id: 'placeholder-3', seconds: 12, text: '♪ Instrumental intro ♪' },
        { id: 'placeholder-4', seconds: 24, text: 'No embedded ID3 lyrics found.' },
        { id: 'placeholder-5', seconds: 36, text: 'Tap "Stamp Tool" below to write and sync your own!' },
      ];
    }

    const lines = raw.split('\n').filter((l) => l.trim().length > 0);
    const lrcRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\](.*)/;

    const hasTimestamps = lines.some((l) => lrcRegex.test(l));

    if (hasTimestamps) {
      return lines.map((line, idx) => {
        const match = line.match(lrcRegex);
        if (match) {
          const mins = parseInt(match[1], 10);
          const secs = parseInt(match[2], 10);
          const millis = match[3] ? parseInt(match[3], 10) : 0;
          const totalSec = mins * 60 + secs + millis / 100;
          return {
            id: `line-${idx}`,
            seconds: totalSec,
            text: match[4].trim(),
          };
        }
        return {
          id: `line-${idx}`,
          seconds: (idx / lines.length) * (duration || 60),
          text: line.trim(),
        };
      });
    }

    // Un-synced text: space out evenly across duration
    const step = Math.max(3, (duration || 120) / Math.max(1, lines.length));
    return lines.map((line, idx) => ({
      id: `line-${idx}`,
      seconds: Math.floor(idx * step),
      text: line.trim(),
    }));
  }, [track.lyrics, track.title, track.artist, duration]);

  // Keep customLines in sync if not in stamp mode
  useEffect(() => {
    if (!isStampMode) {
      setCustomLines(parsedLines);
    }
  }, [parsedLines, isStampMode]);

  // Determine current active lyric line
  const activeLineIndex = useMemo(() => {
    const lines = customLines.length > 0 ? customLines : parsedLines;
    let found = 0;
    for (let i = 0; i < lines.length; i++) {
      if (currentPosition >= lines[i].seconds) {
        found = i;
      } else {
        break;
      }
    }
    return found;
  }, [customLines, parsedLines, currentPosition]);

  // Auto-scroll to center active line
  useEffect(() => {
    if (!isStampMode && lineLayouts.current[activeLineIndex] !== undefined) {
      const y = Math.max(0, lineLayouts.current[activeLineIndex] - 110);
      scrollViewRef.current?.scrollTo({ y, animated: true });
    }
  }, [activeLineIndex, isStampMode]);

  // Stamp current position on current selected stamp index
  const handleStampCurrentLine = () => {
    if (stampedIndex >= customLines.length) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const updated = [...customLines];
    updated[stampedIndex] = {
      ...updated[stampedIndex],
      seconds: Math.floor(currentPosition),
      isCustomStamped: true,
    };
    setCustomLines(updated);

    if (stampedIndex < customLines.length - 1) {
      setStampedIndex(stampedIndex + 1);
      const nextY = lineLayouts.current[stampedIndex + 1];
      if (nextY !== undefined) {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, nextY - 110), animated: true });
      }
    }
  };

  const handleSaveSyncedLrc = () => {
    // Generate standard LRC string
    const lrcText = customLines
      .map((l) => {
        const mins = Math.floor(l.seconds / 60)
          .toString()
          .padStart(2, '0');
        const secs = Math.floor(l.seconds % 60)
          .toString()
          .padStart(2, '0');
        return `[${mins}:${secs}.00] ${l.text}`;
      })
      .join('\n');

    onSaveLyrics(lrcText);
    setIsStampMode(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Lyrics Saved', 'Synchronized LRC timestamps successfully saved to track metadata.');
  };

  const linesToRender = customLines.length > 0 ? customLines : parsedLines;

  return (
    <View style={styles.container}>
      {/* Top Controls Bar */}
      <View style={[styles.controlBar, { borderBottomColor: theme.surfaceBorder }]}>
        <View style={styles.tagInfoRow}>
          <Ionicons name="musical-notes" size={14} color={theme.accent} />
          <Text style={[styles.controlTitle, { color: theme.accent }]}>
            {isStampMode ? 'KARAOKE SYNC STAMPER' : 'INTERACTIVE LYRICS'}
          </Text>
        </View>

        <TactileButton
          onPress={() => {
            setIsStampMode(!isStampMode);
            setStampedIndex(activeLineIndex);
          }}
          style={[
            styles.modeToggleBtn,
            {
              backgroundColor: isStampMode ? theme.accent : theme.surfaceLight,
              borderColor: theme.surfaceBorder,
            },
          ]}
        >
          <Ionicons
            name={isStampMode ? 'checkmark-circle' : 'stopwatch-outline'}
            size={14}
            color={isStampMode ? theme.background : theme.textPrimary}
          />
          <Text
            style={[
              styles.modeToggleText,
              { color: isStampMode ? theme.background : theme.textPrimary },
            ]}
          >
            {isStampMode ? 'Cancel' : 'Sync Tool'}
          </Text>
        </TactileButton>
      </View>

      {/* Main Scrolling Lyrics Container */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {linesToRender.map((line, idx) => {
          const isActive = idx === activeLineIndex;
          const isStampedTarget = isStampMode && idx === stampedIndex;

          return (
            <TactileButton
              key={line.id}
              onPress={() => {
                if (isStampMode) {
                  setStampedIndex(idx);
                } else {
                  Haptics.selectionAsync().catch(() => {});
                  onSeek(line.seconds);
                }
              }}
              onLayout={(e) => {
                lineLayouts.current[idx] = e.nativeEvent.layout.y;
              }}
              style={[
                styles.lyricLineBtn,
                isActive && {
                  backgroundColor: `${theme.accent}15`,
                  borderColor: `${theme.accent}40`,
                },
                isStampedTarget && {
                  borderColor: theme.accent,
                  borderWidth: 1.5,
                },
              ]}
            >
              {/* Timestamp tag */}
              <Text
                style={[
                  styles.timestampBadge,
                  {
                    color: isActive ? theme.accent : theme.textTertiary,
                  },
                ]}
              >
                {formatTime(line.seconds)}
              </Text>

              {/* Lyric Text */}
              <Text
                style={[
                  styles.lyricText,
                  {
                    color: isActive
                      ? theme.textPrimary
                      : isStampedTarget
                      ? theme.accent
                      : theme.textSecondary,
                    fontWeight: isActive ? '800' : '600',
                    fontSize: isActive ? 16 : 14,
                  },
                ]}
              >
                {line.text}
              </Text>

              {isActive && (
                <Ionicons name="volume-high" size={14} color={theme.accent} style={{ marginLeft: 6 }} />
              )}
            </TactileButton>
          );
        })}
      </ScrollView>

      {/* Bottom Stamper Action Deck */}
      {isStampMode && (
        <View style={[styles.stamperDeck, { backgroundColor: theme.surface, borderTopColor: theme.surfaceBorder }]}>
          <Text style={[styles.stamperGuideText, { color: theme.textSecondary }]}>
            Line {stampedIndex + 1}/{linesToRender.length}: Tap "Stamp" when this line is sung
          </Text>

          <View style={styles.stamperActionsRow}>
            <TactileButton
              onPress={handleStampCurrentLine}
              style={[styles.stampNowBtn, { backgroundColor: theme.accent }]}
            >
              <Ionicons name="time" size={18} color={theme.background} />
              <Text style={[styles.stampNowBtnText, { color: theme.background }]}>
                Stamp [{formatTime(currentPosition)}]
              </Text>
            </TactileButton>

            <TactileButton
              onPress={handleSaveSyncedLrc}
              style={[styles.saveLrcBtn, { backgroundColor: theme.surfaceLight, borderColor: theme.accent }]}
            >
              <Ionicons name="save-outline" size={18} color={theme.accent} />
              <Text style={[styles.saveLrcBtnText, { color: theme.accent }]}>Save LRC</Text>
            </TactileButton>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tagInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 10,
  },
  lyricLineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timestampBadge: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 44,
  },
  lyricText: {
    flex: 1,
    lineHeight: 22,
  },
  stamperDeck: {
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  stamperGuideText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  stamperActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stampNowBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  stampNowBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  saveLrcBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveLrcBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
