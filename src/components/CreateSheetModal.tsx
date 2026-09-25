import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../types';
import { TactileButton } from './TactileButton';

interface CreateSheetModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
  onSelectOption: (option: 'playlist' | 'collab' | 'mixed' | 'blend' | 'ai' | 'jam') => void;
}

export const CreateSheetModal: React.FC<CreateSheetModalProps> = ({
  visible,
  onClose,
  theme,
  onSelectOption,
}) => {
  const options = [
    {
      key: 'playlist' as const,
      icon: 'musical-notes' as const,
      title: 'Playlist',
      subtitle: 'Create a playlist with songs or episodes',
      hasBeta: false,
    },
    {
      key: 'collab' as const,
      icon: 'people' as const,
      title: 'Collaborative playlist',
      subtitle: 'Create a playlist together with friends',
      hasBeta: false,
    },
    {
      key: 'mixed' as const,
      icon: 'options' as const,
      title: 'Mixed playlist',
      subtitle: 'Mix songs with smooth transitions',
      hasBeta: true,
    },
    {
      key: 'blend' as const,
      icon: 'git-merge' as const,
      title: 'Blend',
      subtitle: "Combine your friends' tastes into a playlist",
      hasBeta: false,
    },
    {
      key: 'ai' as const,
      icon: 'sparkles' as const,
      title: 'AI Playlist',
      subtitle: 'Turn your ideas into playlists with AI',
      hasBeta: true,
    },
    {
      key: 'jam' as const,
      icon: 'radio' as const,
      title: 'Jam',
      subtitle: 'Listen together from anywhere',
      hasBeta: false,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheetContainer, { backgroundColor: '#181818' }]}>
              {/* Option List */}
              <View style={styles.optionsList}>
                {options.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      onSelectOption(opt.key);
                    }}
                    style={styles.optionRow}
                  >
                    <View style={styles.iconCircle}>
                      <Ionicons name={opt.icon} size={22} color="#FFFFFF" />
                    </View>
                    <View style={styles.textContainer}>
                      <View style={styles.titleRow}>
                        <Text style={styles.optionTitle}>{opt.title}</Text>
                        {opt.hasBeta && (
                          <View style={styles.betaBadge}>
                            <Text style={styles.betaText}>Beta</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Floating Close Button at Bottom */}
              <View style={styles.bottomBar}>
                <TactileButton onPress={onClose} style={styles.circularCloseBtn}>
                  <Ionicons name="close" size={24} color="#000000" />
                </TactileButton>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  optionsList: {
    gap: 18,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  betaBadge: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  betaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
  optionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  bottomBar: {
    alignItems: 'center',
    marginTop: 26,
  },
  circularCloseBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
