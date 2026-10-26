import { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography, Radius, Spacing } from '@/lib/theme';
import type { Card } from '@/lib/supabase';

type Props = {
  card: Card;
  icon: string;
  color: string;
  size: number;
  photoUrl?: string | null;
};

export default function CardFace({ card, icon, color, size, photoUrl }: Props) {
  const darker = useMemo(() => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 40);
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 40);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, [color]);

  const fontSize = size * 0.08;

  if (photoUrl) {
    return (
      <View style={[styles.container, { width: size, height: size * 1.4, borderRadius: Radius.lg }]}>
        <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[color, darker]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { width: size, height: size * 1.4, borderRadius: Radius.lg }]}
    >
      <View style={styles.header}>
        <Text style={[styles.icon, { fontSize: size * 0.12 }]}>{icon}</Text>
        {card.card_number ? (
          <Text style={[styles.cardNum, { fontSize: fontSize * 0.9 }]}>#{card.card_number}</Text>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text
          style={[styles.cardName, { fontSize }]}
          numberOfLines={3}
          adjustsFontSizeToFit
        >
          {card.name}
        </Text>
        {card.set_name ? (
          <Text style={[styles.cardSet, { fontSize: fontSize * 0.75 }]} numberOfLines={1}>
            {card.set_name}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        {card.condition ? (
          <View style={[styles.badge, { paddingVertical: size * 0.015, paddingHorizontal: size * 0.04 }]}>
            <Text style={[styles.badgeText, { fontSize: fontSize * 0.65 }]}>{card.condition}</Text>
          </View>
        ) : null}
        <Text style={[styles.qtyText, { fontSize: fontSize * 0.7 }]}>×{card.quantity}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    fontFamily: Typography.fontFamilyRegular,
  },
  cardNum: {
    fontFamily: Typography.fontFamilySemiBold,
    color: 'rgba(255,255,255,0.8)',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  cardName: {
    fontFamily: Typography.fontFamilyBold,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  cardSet: {
    fontFamily: Typography.fontFamilyMedium,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontFamily: Typography.fontFamilySemiBold,
    color: '#fff',
  },
  qtyText: {
    fontFamily: Typography.fontFamilyBold,
    color: 'rgba(255,255,255,0.9)',
  },
});
