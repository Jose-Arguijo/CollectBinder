import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable, FlatList } from 'react-native';
import { X, Folder, FolderInput } from 'lucide-react-native';
import { Typography, Radius, Spacing, type Theme } from '@/lib/theme';
import type { Collection } from '@/lib/supabase';

type Props = {
  visible: boolean;
  theme: Theme;
  collections: Collection[];
  movingId: string;
  onClose: () => void;
  onMove: (targetId: string | null) => void;
};

export default function MoveCollectionModal({ visible, theme, collections, movingId, onClose, onMove }: Props) {
  const ancestors = new Set<string>();
  const collect = (id: string) => {
    const col = collections.find((c) => c.id === id);
    if (col) {
      ancestors.add(col.id);
      if (col.parent_id) collect(col.parent_id);
    }
  };
  collect(movingId);

  const validTargets = [
    { id: null as string | null, name: 'Top Level', icon: '🏠', color: theme.accent },
    ...collections
      .filter((c) => c.id !== movingId && !ancestors.has(c.id))
      .map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color })),
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.bgElevated }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Move to</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={theme.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={validTargets}
            keyExtractor={(item, idx) => item.id ?? `root-${idx}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, { borderColor: theme.border }]}
                onPress={() => onMove(item.id)}
              >
                <View style={[styles.iconWrap, { backgroundColor: item.color + '22' }]}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <Text style={[styles.rowText, { color: theme.textPrimary }]}>{item.name}</Text>
                <FolderInput size={18} color={theme.textTertiary} strokeWidth={2} />
              </TouchableOpacity>
            )}
            style={styles.list}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamilyBold,
    fontSize: 20,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  list: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  rowText: {
    flex: 1,
    fontFamily: Typography.fontFamilyMedium,
    fontSize: 16,
  },
});
