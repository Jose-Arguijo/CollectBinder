import { View, Text, StyleSheet } from 'react-native';
import { Typography, Spacing, Radius, type Theme } from '@/lib/theme';
import { LucideIcon } from 'lucide-react-native';

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  theme: Theme;
};

export default function EmptyState({ icon: Icon, title, subtitle, theme }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: theme.bgSecondary }]}>
        <Icon size={44} color={theme.textTertiary} strokeWidth={1.5} />
      </View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamilyBold,
    fontSize: 18,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 21,
  },
});
