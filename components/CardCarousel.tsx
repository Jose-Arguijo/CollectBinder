import { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import { Typography, Spacing, type Theme } from '@/lib/theme';
import { formatCurrency } from '@/lib/useCollectionData';
import type { Card, Collection } from '@/lib/supabase';
import CardFace from './CardFace';

type Props = {
  cards: Card[];
  collection: Collection;
  theme: Theme;
  onCardPress: (card: Card) => void;
};

const { width: screenWidth } = Dimensions.get('window');
const CARD_SIZE = Math.min(screenWidth * 0.55, 220);
const SPACING = screenWidth * 0.1;

export default function CardCarousel({ cards, collection, theme, onCardPress }: Props) {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList<Card>>(null);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_SIZE + SPACING * 2,
      offset: (CARD_SIZE + SPACING * 2) * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Card; index: number }) => {
      const cardWidth = CARD_SIZE + SPACING * 2;

      return (
        <CarouselItem
          item={item}
          index={index}
          scrollX={scrollX}
          cardWidth={cardWidth}
          collection={collection}
          theme={theme}
          onCardPress={onCardPress}
        />
      );
    },
    [collection, theme, onCardPress],
  );

  if (cards.length === 0) return null;

  const totalValue = cards.reduce((sum, c) => sum + c.value * c.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {cards.length} {cards.length === 1 ? 'card' : 'cards'}
        </Text>
        <Text style={[styles.value, { color: theme.textPrimary }]}>
          {formatCurrency(totalValue)}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={cards}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_SIZE + SPACING * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.list}
        getItemLayout={getItemLayout}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        renderItem={renderItem}
      />
    </View>
  );
}

function CarouselItem({
  item,
  index,
  scrollX,
  cardWidth,
  collection,
  theme,
  onCardPress,
}: {
  item: Card;
  index: number;
  scrollX: any;
  cardWidth: number;
  collection: Collection;
  theme: Theme;
  onCardPress: (card: Card) => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * cardWidth,
      index * cardWidth,
      (index + 1) * cardWidth,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.78, 1, 0.78],
      Extrapolation.CLAMP,
    );

    const rotate = interpolate(
      scrollX.value,
      inputRange,
      [15, 0, -15],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { rotate: `${rotate}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[styles.itemWrap, { width: cardWidth }, animatedStyle]}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={() => onCardPress(item)}>
        <CardFace
          card={item}
          icon={collection.icon}
          color={collection.color}
          size={CARD_SIZE}
          photoUrl={item.photo_url}
        />
      </TouchableOpacity>
      <Text style={[styles.cardName, { color: theme.textPrimary }]} numberOfLines={1}>
        {item.name}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: Typography.fontFamilyMedium,
    fontSize: 14,
  },
  value: {
    fontFamily: Typography.fontFamilyBold,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  itemWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  cardName: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: CARD_SIZE,
  },
});
