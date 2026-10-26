import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { Plus, Sun, Moon, Layers, Search, X, FolderPlus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/lib/theme-context';
import { useCollectionData, formatCurrency } from '@/lib/useCollectionData';
import { Typography, Spacing, Radius, type Theme } from '@/lib/theme';
import CollectionCard from '@/components/CollectionCard';
import EmptyState from '@/components/EmptyState';
import CollectionEditModal from '@/components/CollectionEditModal';
import type { CollectionWithStats } from '@/lib/supabase';

export default function HomeScreen() {
  const { theme, isDark, toggle } = useTheme();
  const { tree, loading, error, addCollection, reload } = useCollectionData();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const totalValue = useMemo(
    () => tree.reduce((sum, c) => sum + c.totalValue, 0),
    [tree],
  );
  const totalCards = useMemo(
    () => tree.reduce((sum, c) => sum + c.cardCount, 0),
    [tree],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return tree;
    const query = search.toLowerCase();
    const matchCollection = (col: CollectionWithStats): CollectionWithStats | null => {
      const selfMatch = col.name.toLowerCase().includes(query);
      const matchedChildren = col.childCollections
        .map(matchCollection)
        .filter(Boolean) as CollectionWithStats[];
      if (selfMatch || matchedChildren.length > 0) {
        return { ...col, childCollections: selfMatch ? col.childCollections : matchedChildren };
      }
      return null;
    };
    return tree.map(matchCollection).filter(Boolean) as CollectionWithStats[];
  }, [tree, search]);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.appName, { color: theme.textPrimary }]}>Binder</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {totalCards} {totalCards === 1 ? 'card' : 'cards'} · {formatCurrency(totalValue)}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowSearch((s) => !s)}
            style={[styles.iconBtn, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
          >
            {showSearch ? <X size={20} color={theme.textPrimary} strokeWidth={2} /> : <Search size={20} color={theme.textPrimary} strokeWidth={2} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggle}
            style={[styles.iconBtn, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
          >
            {isDark ? <Sun size={20} color={theme.textPrimary} strokeWidth={2} /> : <Moon size={20} color={theme.textPrimary} strokeWidth={2} />}
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchRow}>
          <Search size={18} color={theme.textTertiary} strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.bgElevated, color: theme.textPrimary, borderColor: theme.border }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search collections..."
            placeholderTextColor={theme.textTertiary}
            autoFocus
          />
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error && <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>}

        {filtered.length === 0 && !error ? (
          search.trim() ? (
            <EmptyState
              icon={Search}
              title="No matches"
              subtitle="Try a different search term."
              theme={theme}
            />
          ) : (
            <EmptyState
              icon={Layers}
              title="No collections yet"
              subtitle="Create your first collection to start tracking your cards."
              theme={theme}
            />
          )
        ) : (
          filtered.map((col) => (
            <View key={col.id}>
              <CollectionCard
                collection={col}
                theme={theme}
                onPress={() => router.push(`/collection/${col.id}`)}
              />
              {col.childCollections.map((child) => (
                <CollectionCard
                  key={child.id}
                  collection={child}
                  theme={theme}
                  depth={1}
                  onPress={() => router.push(`/collection/${child.id}`)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent }]}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.85}
      >
        <Plus size={26} color={theme.accentText} strokeWidth={2.5} />
        <Text style={[styles.fabText, { color: theme.accentText }]}>New Collection</Text>
      </TouchableOpacity>

      <CollectionEditModal
        visible={showAdd}
        theme={theme}
        onClose={() => setShowAdd(false)}
        onSave={async (name, icon, color) => {
          await addCollection(name, icon, color, null);
          setShowAdd(false);
        }}
      />
    </SafeAreaView>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  appName: {
    fontFamily: Typography.fontFamilyBold,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: {
    position: 'absolute',
    left: Spacing.md + 4,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 15,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingLeft: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  errorText: {
    fontFamily: Typography.fontFamilyMedium,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 15,
  },
});
