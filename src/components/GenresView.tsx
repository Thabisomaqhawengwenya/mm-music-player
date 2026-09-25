import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Genre, AppTheme } from '../types';
import { TactileButton } from './TactileButton';

interface GenresViewProps {
  genres: Genre[];
  theme: AppTheme;
  onSelectGenre: (genre: Genre) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export const GenresView: React.FC<GenresViewProps> = ({
  genres,
  theme,
  onSelectGenre,
}) => {
  return (
    <FlatList
      data={genres}
      keyExtractor={(item) => item.name}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.columnWrapper}
      renderItem={({ item }) => {
        const cardColor = item.color || theme.accent;
        return (
          <TactileButton
            onPress={() => onSelectGenre(item)}
            style={[
              styles.genreCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            <View style={[styles.colorStripe, { backgroundColor: cardColor }]} />
            <View style={styles.cardInner}>
              <View style={[styles.iconCircle, { backgroundColor: `${cardColor}20` }]}>
                <Ionicons name="musical-note" size={24} color={cardColor} />
              </View>
              <Text style={[styles.genreName, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.genreCount, { color: theme.textSecondary }]}>
                {item.trackCount} {item.trackCount === 1 ? 'track' : 'tracks'}
              </Text>
            </View>
          </TactileButton>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="radio-outline" size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No genres identified
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  genreCard: {
    width: CARD_WIDTH,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  colorStripe: {
    height: 4,
    width: '100%',
  },
  cardInner: {
    padding: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  genreName: {
    fontSize: 15,
    fontWeight: '800',
  },
  genreCount: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
