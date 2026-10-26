import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Layers } from 'lucide-react-native';
import { Typography, Radius, Spacing, type Theme } from '@/lib/theme';
import { formatCurrency } from '@/lib/useCollectionData';
import type { CollectionWithStats } from '@/lib/supabase';

type Props = {
  collection: CollectionWithStats;
  theme: Theme;
  onPress: () => void;
  depth?: number;
};

export default function CollectionCard({ collection, theme, onPress, depth = 0 }: Props) {
  const hasChildren = collection.childCollections.length > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: theme.bgElevated,
          borderColor: theme.border,
          marginLeft: depth * Spacing.md,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: collection.color + '22' }]}>
        <Text style={styles.icon}>{collection.icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
          {collection.name}
        </Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {collection.cardCount} {collection.cardCount === 1 ? 'card' : 'cards'}
          {hasChildren ? ` · ${collection.childCollections.length} ${collection.childCollections.length === 1 ? 'collection' : 'collections'}` : ''}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.value, { color: theme.textPrimary }]}>
          {formatCurrency(collection.totalValue)}
        </Text>
        <ChevronRight size={20} color={theme.textTertiary} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 16,
  },
  meta: {
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 13,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  value: {
    fontFamily: Typography.fontFamilyBold,
    fontSize: 15,
  },
});
