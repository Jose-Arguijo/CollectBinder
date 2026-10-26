import { useRef, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Typography, Spacing, type Theme } from '@/lib/theme';
import { formatCurrency } from '@/lib/useCollectionData';
import type { Card, Collection } from '@/lib/supabase';
import CardFace from './CardFace';

type CardStyle = { icon: string; color: string; subLabel?: string };

type Props = {
  cards: Card[];
  collection: Collection;
  theme: Theme;
  onCardPress: (card: Card) => void;
  getCardStyle?: (card: Card) => CardStyle;
};

const { width: screenWidth } = Dimensions.get('window');
const CARD_SIZE = Math.min(screenWidth * 0.58, 230);
const ITEM_WIDTH = CARD_SIZE + 16;
const SIDE_PADDING = Math.max(0, (screenWidth - ITEM_WIDTH) / 2);

const LOOPS = 5;

export default function CardCarousel({ cards, collection, theme, onCardPress, getCardStyle }: Props) {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isJumping = useRef(false);

  const canLoop = cards.length > 1;
  const loopedData = canLoop ? Array(LOOPS).fill(cards).flat() : cards;
  const baseOffset = canLoop ? cards.length * 2 * ITEM_WIDTH : 0;

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH,
      offset: index * ITEM_WIDTH,
      index,
    }),
    [],
  );

  useEffect(() => {
    if (canLoop && flatListRef.current) {
      const t = setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: baseOffset, animated: false });
        scrollX.value = baseOffset;
      }, 50);
      return () => clearTimeout(t);
    }
  }, [canLoop, baseOffset]);

  const handleScroll = useCallback(
    (e: any) => {
      scrollX.value = e.nativeEvent.contentOffset.x;
      const idx = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
      const realIdx = canLoop ? ((idx % cards.length) + cards.length) % cards.length : idx;
      setActiveIndex(realIdx);
    },
    [canLoop, cards.length],
  );

  const handleMomentumEnd = useCallback(
    (e: any) => {
      if (!canLoop || isJumping.current) return;
      const offset = e.nativeEvent.contentOffset.x;
      const currentIndex = Math.round(offset / ITEM_WIDTH);
      const totalItems = loopedData.length;

      if (currentIndex <= cards.length) {
        isJumping.current = true;
        const newOffset = offset + cards.length * ITEM_WIDTH;
        flatListRef.current?.scrollToOffset({ offset: newOffset, animated: false });
        scrollX.value = newOffset;
        requestAnimationFrame(() => { isJumping.current = false; });
      } else if (currentIndex >= totalItems - cards.length - 1) {
        isJumping.current = true;
        const newOffset = offset - cards.length * ITEM_WIDTH;
        flatListRef.current?.scrollToOffset({ offset: newOffset, animated: false });
        scrollX.value = newOffset;
        requestAnimationFrame(() => { isJumping.current = false; });
      }
    },
    [canLoop, cards.length, loopedData.length],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Card; index: number }) => {
      const style = getCardStyle
        ? getCardStyle(item)
        : { icon: collection.icon, color: collection.color, subLabel: undefined };

      return (
        <CarouselItem
          item={item}
          index={index}
          scrollX={scrollX}
          icon={style.icon}
          color={style.color}
          subLabel={style.subLabel}
          theme={theme}
          onCardPress={onCardPress}
        />
      );
    },
    [collection, theme, onCardPress, getCardStyle],
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
        data={loopedData}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={[styles.list, { paddingHorizontal: SIDE_PADDING }]}
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        renderItem={renderItem}
        style={styles.listStyle}
      />

      <View style={styles.counterRow}>
        <View style={[styles.counter, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
          <Text style={[styles.counterText, { color: theme.textPrimary }]}>
            {activeIndex + 1} / {cards.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

function CarouselItem({
  item,
  index,
  scrollX,
  icon,
  color,
  subLabel,
  theme,
  onCardPress,
}: {
  item: Card;
  index: number;
  scrollX: any;
  icon: string;
  color: string;
  subLabel?: string;
  theme: Theme;
  onCardPress: (card: Card) => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const center = index * ITEM_WIDTH;
    const distance = Math.abs(scrollX.value - center);

    const scale = interpolate(
      distance,
      [0, ITEM_WIDTH, ITEM_WIDTH * 2],
      [1, 0.82, 0.68],
      Extrapolation.CLAMP,
    );

    const rotate = interpolate(
      scrollX.value - center,
      [-ITEM_WIDTH * 2, -ITEM_WIDTH, 0, ITEM_WIDTH, ITEM_WIDTH * 2],
      [-22, -12, 0, 12, 22],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      distance,
      [0, ITEM_WIDTH, ITEM_WIDTH * 2],
      [1, 0.55, 0.3],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }, { rotate: `${rotate}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[styles.itemWrap, { width: ITEM_WIDTH }, animatedStyle]}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={() => onCardPress(item)}>
        <CardFace
          card={item}
          icon={icon}
          color={color}
          size={CARD_SIZE}
          photoUrl={item.photo_url}
        />
      </TouchableOpacity>
      <View style={styles.labelContainer}>
        <Text style={[styles.cardName, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        {subLabel ? (
          <Text style={[styles.subLabel, { color: theme.textTertiary }]} numberOfLines={1}>
            {subLabel}
          </Text>
        ) : null}
      </View>
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
  listStyle: {
    flex: 1,
  },
  list: {
    paddingVertical: Spacing.lg,
  },
  itemWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    width: CARD_SIZE,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  cardName: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 13,
    textAlign: 'center',
  },
  subLabel: {
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  counterRow: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  counter: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
  },
  counterText: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 13,
  },
});
