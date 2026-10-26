import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { ArrowLeft, Plus, LayoutGrid, GalleryHorizontalEnd, Search, X, MoreVertical, FolderPlus, Pencil, Trash2, Move } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/lib/theme-context';
import { useCollectionData, formatCurrency } from '@/lib/useCollectionData';
import { Typography, Spacing, Radius, type Theme } from '@/lib/theme';
import CardCarousel from '@/components/CardCarousel';
import CardFace from '@/components/CardFace';
import EmptyState from '@/components/EmptyState';
import CollectionEditModal from '@/components/CollectionEditModal';
import CardEditModal from '@/components/CardEditModal';
import MoveCollectionModal from '@/components/MoveCollectionModal';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const {
    collections,
    tree,
    loading,
    error,
    getCollection,
    getCardsInCollection,
    getSubcollections,
    addCollection,
    updateCollection,
    deleteCollection,
    addCard,
    updateCard,
    deleteCard,
    moveCollection,
  } = useCollectionData();

  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showEditCollection, setShowEditCollection] = useState(false);
  const [showMoveCollection, setShowMoveCollection] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const collection = id ? getCollection(id) : undefined;
  const allCards = useMemo(() => (id ? getCardsInCollection(id) : []), [id, getCardsInCollection]);
  const subcollections = useMemo(() => (id ? getSubcollections(id) : []), [id, getSubcollections]);

  const collectionStats = useMemo(() => {
    function findInTree(items: typeof tree): any {
      for (const item of items) {
        if (item.id === id) return item;
        const found = findInTree(item.childCollections);
        if (found) return found;
      }
      return null;
    }
    return findInTree(tree);
  }, [tree, id]);

  const filteredCards = useMemo(() => {
    if (!search.trim()) return allCards;
    const q = search.toLowerCase();
    return allCards.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.set_name.toLowerCase().includes(q) ||
        c.condition.toLowerCase().includes(q) ||
        c.notes.toLowerCase().includes(q),
    );
  }, [allCards, search]);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={theme.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <EmptyState icon={Search} title="Collection not found" subtitle="It may have been deleted." theme={theme} />
      </SafeAreaView>
    );
  }

  const editingCard = editingCardId ? allCards.find((c) => c.id === editingCardId) : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.collectionIcon]}>{collection.icon}</Text>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            {collection.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowMenu((s) => !s)}
          style={styles.backBtn}
        >
          <MoreVertical size={22} color={theme.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={[styles.menu, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
          <MenuItem icon={Pencil} label="Edit Collection" theme={theme} onPress={() => { setShowMenu(false); setShowEditCollection(true); }} />
          <MenuItem icon={FolderPlus} label="Add Subcollection" theme={theme} onPress={() => { setShowMenu(false); setShowAddCollection(true); }} />
          <MenuItem icon={Move} label="Move Collection" theme={theme} onPress={() => { setShowMenu(false); setShowMoveCollection(true); }} />
          <MenuItem icon={Trash2} label="Delete Collection" theme={theme} danger onPress={() => { setShowMenu(false); deleteCollection(collection.id); router.back(); }} />
        </View>
      )}

      <View style={styles.statsBar}>
        <View style={[styles.statPill, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>
            {collectionStats?.cardCount ?? allCards.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>cards</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>
            {formatCurrency(collectionStats?.totalValue ?? 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>est. value</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>
            {subcollections.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>subcollections</Text>
        </View>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          onPress={() => setShowSearch((s) => !s)}
          style={[styles.toolBtn, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
        >
          {showSearch ? <X size={18} color={theme.textPrimary} strokeWidth={2} /> : <Search size={18} color={theme.textPrimary} strokeWidth={2} />}
        </TouchableOpacity>
        <View style={[styles.toggleGroup, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => setViewMode('carousel')}
            style={[styles.toggleBtn, viewMode === 'carousel' && { backgroundColor: theme.bgElevated, borderRadius: Radius.sm }]}
          >
            <GalleryHorizontalEnd size={18} color={viewMode === 'carousel' ? theme.textPrimary : theme.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            style={[styles.toggleBtn, viewMode === 'grid' && { backgroundColor: theme.bgElevated, borderRadius: Radius.sm }]}
          >
            <LayoutGrid size={18} color={viewMode === 'grid' ? theme.textPrimary : theme.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchRow}>
          <Search size={16} color={theme.textTertiary} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.bgElevated, color: theme.textPrimary, borderColor: theme.border }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search cards..."
            placeholderTextColor={theme.textTertiary}
            autoFocus
          />
        </View>
      )}

      {subcollections.length > 0 && !search && (
        <View style={styles.subSection}>
          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>Subcollections</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subScroll}>
            {subcollections.map((sub) => {
              const subStats = collectionStats?.childCollections.find((c: any) => c.id === sub.id);
              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.subChip, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
                  onPress={() => router.push(`/collection/${sub.id}`)}
                >
                  <Text style={styles.subIcon}>{sub.icon}</Text>
                  <View style={styles.subInfo}>
                    <Text style={[styles.subName, { color: theme.textPrimary }]} numberOfLines={1}>{sub.name}</Text>
                    <Text style={[styles.subMeta, { color: theme.textSecondary }]}>
                      {subStats?.cardCount ?? 0} cards · {formatCurrency(subStats?.totalValue ?? 0)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.subChipAdd, { borderColor: theme.border }]}
              onPress={() => setShowAddCollection(true)}
            >
              <FolderPlus size={20} color={theme.textSecondary} strokeWidth={2} />
              <Text style={[styles.subAddText, { color: theme.textSecondary }]}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <View style={styles.cardArea}>
        {filteredCards.length === 0 ? (
          search.trim() ? (
            <EmptyState icon={Search} title="No matches" subtitle="Try a different search." theme={theme} />
          ) : (
            <EmptyState
              icon={Plus}
              title="No cards yet"
              subtitle="Add your first card to this collection."
              theme={theme}
            />
          )
        ) : viewMode === 'carousel' ? (
          <CardCarousel
            cards={filteredCards}
            collection={collection}
            theme={theme}
            onCardPress={(card) => setEditingCardId(card.id)}
          />
        ) : (
          <FlatList
            data={filteredCards}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => setEditingCardId(item.id)}
                activeOpacity={0.8}
              >
                <CardFace
                  card={item}
                  icon={collection.icon}
                  color={collection.color}
                  size={150}
                  photoUrl={item.photo_url}
                />
                <Text style={[styles.gridName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.gridValue, { color: theme.textSecondary }]}>
                  {formatCurrency(item.value * item.quantity)}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent }]}
        onPress={() => setShowAddCard(true)}
        activeOpacity={0.85}
      >
        <Plus size={26} color={theme.accentText} strokeWidth={2.5} />
        <Text style={[styles.fabText, { color: theme.accentText }]}>Add Card</Text>
      </TouchableOpacity>

      <CollectionEditModal
        visible={showAddCollection}
        theme={theme}
        defaultParentId={collection.id}
        onClose={() => setShowAddCollection(false)}
        onSave={async (name, icon, color) => {
          await addCollection(name, icon, color, collection.id);
          setShowAddCollection(false);
        }}
      />

      <CollectionEditModal
        visible={showEditCollection}
        theme={theme}
        editing={collection}
        onClose={() => setShowEditCollection(false)}
        onSave={async (name, icon, color) => {
          await updateCollection(collection.id, { name, icon, color });
          setShowEditCollection(false);
        }}
      />

      <MoveCollectionModal
        visible={showMoveCollection}
        theme={theme}
        collections={collections}
        movingId={collection.id}
        onClose={() => setShowMoveCollection(false)}
        onMove={async (targetId) => {
          await moveCollection(collection.id, targetId);
          setShowMoveCollection(false);
          router.back();
        }}
      />

      <CardEditModal
        visible={showAddCard}
        theme={theme}
        collectionIcon={collection.icon}
        collectionColor={collection.color}
        onClose={() => setShowAddCard(false)}
        onSave={async (data) => {
          await addCard({ ...data, collection_id: collection.id });
          setShowAddCard(false);
        }}
      />

      <CardEditModal
        visible={!!editingCard}
        theme={theme}
        editing={editingCard ?? undefined}
        collectionIcon={collection.icon}
        collectionColor={collection.color}
        onClose={() => setEditingCardId(null)}
        onSave={async (data) => {
          if (editingCard) {
            await updateCard(editingCard.id, data);
          }
          setEditingCardId(null);
        }}
        onDelete={async () => {
          if (editingCard) {
            await deleteCard(editingCard.id);
          }
          setEditingCardId(null);
        }}
      />
    </SafeAreaView>
  );
}

function MenuItem({
  icon: Icon,
  label,
  theme,
  onPress,
  danger,
}: {
  icon: typeof Pencil;
  label: string;
  theme: Theme;
  onPress: () => void;
  danger?: boolean;
}) {
  const color = danger ? '#ef4444' : theme.textPrimary;
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon size={18} color={color} strokeWidth={2} />
      <Text style={[styles.menuText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  collectionIcon: {
    fontSize: 22,
  },
  headerTitle: {
    fontFamily: Typography.fontFamilyBold,
    fontSize: 18,
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.xs,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  menuText: {
    fontFamily: Typography.fontFamilyMedium,
    fontSize: 15,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 2,
  },
  statValue: {
    fontFamily: Typography.fontFamilyBold,
    fontSize: 16,
  },
  statLabel: {
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 12,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleGroup: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    width: 36,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 15,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  subSection: {
    marginBottom: Spacing.sm,
  },
  subTitle: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 14,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  subScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  subChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  subIcon: {
    fontSize: 24,
  },
  subInfo: {
    gap: 1,
  },
  subName: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 14,
  },
  subMeta: {
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 12,
  },
  subChipAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  subAddText: {
    fontFamily: Typography.fontFamilyMedium,
    fontSize: 14,
  },
  cardArea: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  gridRow: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  gridName: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 13,
  },
  gridValue: {
    fontFamily: Typography.fontFamilyMedium,
    fontSize: 12,
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
