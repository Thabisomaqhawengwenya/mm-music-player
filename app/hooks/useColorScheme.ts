import { useColorScheme as useDeviceColorScheme } from 'react-native';

/**
 * Hook to retrieve the current system color scheme ('light' | 'dark' | null).
 */
export function useColorScheme() {
  return useDeviceColorScheme();
}
