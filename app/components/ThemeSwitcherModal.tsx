import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '@/src/types';
import { THEMES } from '../../app/constants/theme';
import { StorageService } from '@/src/services/playlistStorage';
import { TactileButton } from './TactileButton';

interface ThemeSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onThemeChanged: (theme: AppTheme) => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  visible,
  onClose,
  currentTheme,
  onThemeChanged,
}) => {
  const handleSelectTheme = async (themeKey: string) => {
    const selected = THEMES[themeKey];
    if (selected) {
      await StorageService.saveThemeId(selected.id);
      onThemeChanged(selected);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalWrapper}>
          <View
            style={[
              styles.contentCard,
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.surfaceBorder },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="color-palette" size={22} color={currentTheme.accent} />
                <Text style={[styles.title, { color: currentTheme.textPrimary }]}>
                  DESIGN AESTHETIC
                </Text>
              </View>
              <TactileButton onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={currentTheme.textPrimary} />
              </TactileButton>
            </View>

            <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>
              Switch aesthetic styling instantly anytime:
            </Text>

            {/* Themes list */}
            <View style={styles.themeList}>
              {Object.values(THEMES).map((theme) => {
                const isSelected = theme.id === currentTheme.id;
                return (
                  <TactileButton
                    key={theme.id}
                    onPress={() => handleSelectTheme(theme.id)}
                    style={[
                      styles.themeItem,
                      {
                        backgroundColor: theme.background,
                        borderColor: isSelected ? theme.accent : theme.surfaceBorder,
                      },
                    ]}
                  >
                    <View style={styles.themeInfoRow}>
                      {/* Color swatches */}
                      <View style={styles.swatchGroup}>
                        <View style={[styles.swatch, { backgroundColor: theme.background }]} />
                        <View style={[styles.swatch, { backgroundColor: theme.surface }]} />
                        <View style={[styles.swatch, { backgroundColor: theme.accent }]} />
                      </View>

                      <Text style={[styles.themeName, { color: theme.textPrimary }]}>
                        {theme.name}
                      </Text>
                    </View>

                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={theme.accent} />
                    )}
                  </TactileButton>
                );
              })}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  contentCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 18,
  },
  themeList: {
    gap: 12,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  themeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  swatchGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  themeName: {
    fontSize: 14,
    fontWeight: '700',
  },
});
