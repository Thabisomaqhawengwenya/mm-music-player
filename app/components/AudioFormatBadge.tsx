import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AudioFormatType } from '@/src/types';
import { detectAudioFormat } from '@/src/utils/audioFormats';

interface AudioFormatBadgeProps {
  format?: AudioFormatType;
  filename?: string;
  isLossless?: boolean;
  size?: 'small' | 'medium' | 'large';
  showCodecName?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AudioFormatBadge: React.FC<AudioFormatBadgeProps> = ({
  format,
  filename,
  isLossless,
  size = 'small',
  showCodecName = false,
  style,
}) => {
  const details = detectAudioFormat(filename);
  const activeFormat = format || details.format;
  const isActuallyLossless = isLossless ?? details.isLossless;

  const getLabel = () => {
    if (showCodecName) {
      return details.badgeLabel;
    }
    if (isActuallyLossless) {
      return activeFormat === 'FLAC' ? 'HI-RES' : activeFormat;
    }
    return activeFormat;
  };

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isActuallyLossless
            ? `${details.badgeColor}22`
            : 'rgba(255, 255, 255, 0.08)',
          borderColor: isActuallyLossless ? `${details.badgeColor}66` : 'rgba(255, 255, 255, 0.14)',
          paddingHorizontal: isSmall ? 5 : isLarge ? 8 : 6,
          paddingVertical: isSmall ? 1.5 : isLarge ? 3 : 2,
        },
        style,
      ]}
    >
      {isActuallyLossless && (
        <View
          style={[
            styles.indicatorDot,
            { backgroundColor: details.badgeColor },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: isActuallyLossless ? details.badgeColor : 'rgba(255, 255, 255, 0.75)',
            fontSize: isSmall ? 9 : isLarge ? 11 : 10,
            fontWeight: isActuallyLossless ? '700' : '600',
          },
        ]}
      >
        {getLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    gap: 3.5,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  text: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
