import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../types';
import { SyncClientService, AuthUser } from '../services/syncClient';
import { TactileButton } from './TactileButton';

interface CloudSyncModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppTheme;
  onSyncCompleted: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  visible,
  onClose,
  theme,
  onSyncCompleted,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [serverUrl, setServerUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthMode, setIsAuthMode] = useState<'login' | 'register'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadState();
    }
  }, [visible]);

  const loadState = async () => {
    const authUser = await SyncClientService.getAuthUser();
    setUser(authUser);
    const url = await SyncClientService.getServerUrl();
    setServerUrl(url);
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }

    setAuthLoading(true);
    if (isAuthMode === 'register') {
      if (!name.trim()) {
        Alert.alert('Required', 'Please enter your name.');
        setAuthLoading(false);
        return;
      }
      const res = await SyncClientService.register(email, password, name);
      setAuthLoading(false);
      if (res.success) {
        Alert.alert('Success', 'Account created and signed in.');
        await loadState();
      } else {
        Alert.alert('Registration Failed', res.error || 'Check server connection.');
      }
    } else {
      const res = await SyncClientService.login(email, password);
      setAuthLoading(false);
      if (res.success) {
        Alert.alert('Signed In', 'Welcome back!');
        await loadState();
      } else {
        Alert.alert('Login Failed', res.error || 'Invalid credentials or server unreachable.');
      }
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const res = await SyncClientService.syncNow();
    setIsSyncing(false);

    if (res.success) {
      Alert.alert('Sync Successful', res.message || 'Your offline music data is synchronized.');
      onSyncCompleted();
    } else if (res.offline) {
      Alert.alert('Offline Mode', res.message || 'Device is offline. Changes remain safely stored locally.');
    } else {
      Alert.alert('Sync Notice', res.message || 'Could not reach sync server.');
    }
  };

  const handleLogout = async () => {
    await SyncClientService.logout();
    setUser(null);
    Alert.alert('Signed Out', 'You are now operating in purely local offline mode.');
  };

  const handleSaveUrl = async () => {
    if (serverUrl.trim()) {
      await SyncClientService.setServerUrl(serverUrl.trim());
      Alert.alert('Saved', 'Server connection URL updated.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="cloud-done" size={24} color={theme.accent} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              OFFLINE SYNC & BACKUP
            </Text>
          </View>
          <TactileButton onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.textPrimary} />
          </TactileButton>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Status banner */}
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
            ]}
          >
            <View style={styles.statusDotRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: user ? theme.success : theme.accent },
                ]}
              />
              <Text style={[styles.statusText, { color: theme.textPrimary }]}>
                {user ? `Connected as ${user.email}` : 'Pure Offline Mode (Local Storage)'}
              </Text>
            </View>
            <Text style={[styles.statusSubtext, { color: theme.textTertiary }]}>
              {user
                ? 'Your playlists, favorites, tag edits, and EQ settings automatically sync when online.'
                : 'All your music and playlists work 100% offline. Sign in anytime to backup and sync across devices.'}
            </Text>
          </View>

          {user ? (
            /* Authenticated Actions */
            <View style={styles.authenticatedSection}>
              <TactileButton
                onPress={handleSync}
                style={[styles.primaryActionBtn, { backgroundColor: theme.accent }]}
                activeScale={0.96}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color={theme.background} />
                ) : (
                  <>
                    <Ionicons name="sync" size={20} color={theme.background} />
                    <Text style={[styles.primaryActionBtnText, { color: theme.background }]}>
                      Sync Library Now
                    </Text>
                  </>
                )}
              </TactileButton>

              <TactileButton
                onPress={handleLogout}
                style={[styles.outlineBtn, { borderColor: theme.danger }]}
              >
                <Text style={[styles.outlineBtnText, { color: theme.danger }]}>
                  Sign Out (Stay Offline)
                </Text>
              </TactileButton>
            </View>
          ) : (
            /* Auth Form */
            <View
              style={[
                styles.authCard,
                { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
              ]}
            >
              <View style={styles.authModeToggle}>
                <TactileButton
                  onPress={() => setIsAuthMode('login')}
                  style={[
                    styles.authToggleBtn,
                    isAuthMode === 'login' && { backgroundColor: theme.surfaceLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.authToggleText,
                      { color: isAuthMode === 'login' ? theme.accent : theme.textSecondary },
                    ]}
                  >
                    Sign In
                  </Text>
                </TactileButton>

                <TactileButton
                  onPress={() => setIsAuthMode('register')}
                  style={[
                    styles.authToggleBtn,
                    isAuthMode === 'register' && { backgroundColor: theme.surfaceLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.authToggleText,
                      { color: isAuthMode === 'register' ? theme.accent : theme.textSecondary },
                    ]}
                  >
                    Register
                  </Text>
                </TactileButton>
              </View>

              {isAuthMode === 'register' && (
                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>NAME</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name..."
                    placeholderTextColor={theme.textTertiary}
                    style={[
                      styles.input,
                      { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder, color: theme.textPrimary },
                    ]}
                  />
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>EMAIL</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="user@example.com"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[
                    styles.input,
                    { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder, color: theme.textPrimary },
                  ]}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>PASSWORD</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters..."
                  placeholderTextColor={theme.textTertiary}
                  secureTextEntry
                  style={[
                    styles.input,
                    { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder, color: theme.textPrimary },
                  ]}
                />
              </View>

              <TactileButton
                onPress={handleAuth}
                style={[styles.submitAuthBtn, { backgroundColor: theme.accent }]}
              >
                {authLoading ? (
                  <ActivityIndicator size="small" color={theme.background} />
                ) : (
                  <Text style={[styles.submitAuthBtnText, { color: theme.background }]}>
                    {isAuthMode === 'login' ? 'Sign In & Connect' : 'Create Sync Account'}
                  </Text>
                )}
              </TactileButton>
            </View>
          )}

          {/* Server Connection URL Configuration */}
          <View
            style={[
              styles.serverConfigCard,
              { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
            ]}
          >
            <View style={styles.serverConfigHeader}>
              <Ionicons name="server-outline" size={18} color={theme.accent} />
              <Text style={[styles.serverConfigTitle, { color: theme.textPrimary }]}>
                BACKEND SERVER URL
              </Text>
            </View>
            <Text style={[styles.serverConfigHelp, { color: theme.textTertiary }]}>
              Default is http://10.0.2.2:4000 (Android emulator) or your local network IP (e.g. http://192.168.1.x:4000)
            </Text>
            <View style={styles.serverUrlRow}>
              <TextInput
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://10.0.2.2:4000"
                placeholderTextColor={theme.textTertiary}
                autoCapitalize="none"
                style={[
                  styles.serverUrlInput,
                  { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder, color: theme.textPrimary },
                ]}
              />
              <TactileButton
                onPress={handleSaveUrl}
                style={[styles.serverSaveBtn, { backgroundColor: theme.surfaceLight }]}
              >
                <Text style={[styles.serverSaveBtnText, { color: theme.accent }]}>Save</Text>
              </TactileButton>
            </View>
          </View>
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
    paddingVertical: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  statusBanner: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusSubtext: {
    fontSize: 12,
    lineHeight: 18,
  },
  authenticatedSection: {
    gap: 12,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  outlineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  authCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
  },
  authModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  authToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  authToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  submitAuthBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitAuthBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  serverConfigCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  serverConfigHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  serverConfigTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  serverConfigHelp: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  serverUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serverUrlInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  serverSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  serverSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
