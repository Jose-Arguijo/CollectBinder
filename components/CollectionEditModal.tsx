import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Typography, Radius, Spacing, COLLECTION_ICONS, COLLECTION_COLORS, type Theme } from '@/lib/theme';
import type { Collection } from '@/lib/supabase';

type Props = {
  visible: boolean;
  theme: Theme;
  editing?: Collection | null;
  defaultParentId?: string | null;
  onClose: () => void;
  onSave: (name: string, icon: string, color: string) => void;
};

export default function CollectionEditModal({
  visible,
  theme,
  editing,
  defaultParentId,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(editing?.name ?? '');
  const [icon, setIcon] = useState(editing?.icon ?? COLLECTION_ICONS[0]);
  const [color, setColor] = useState(editing?.color ?? COLLECTION_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), icon, color);
    setName('');
    setIcon(COLLECTION_ICONS[0]);
    setColor(COLLECTION_COLORS[0]);
  };

  const handleClose = () => {
    setName('');
    setIcon(COLLECTION_ICONS[0]);
    setColor(COLLECTION_COLORS[0]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.bgElevated }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {editing ? 'Edit Collection' : 'New Collection'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={22} color={theme.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary, borderColor: theme.border }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Pokémon Cards"
              placeholderTextColor={theme.textTertiary}
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Icon</Text>
            <View style={styles.iconGrid}>
              {COLLECTION_ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  onPress={() => setIcon(ic)}
                  style={[
                    styles.iconCell,
                    { backgroundColor: theme.bgSecondary, borderColor: icon === ic ? color : 'transparent' },
                  ]}
                >
                  <Text style={styles.iconText}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
            <View style={styles.colorRow}>
              {COLLECTION_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: theme.textPrimary }]}
                >
                  {color === c && <Check size={16} color="#fff" strokeWidth={3} />}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleClose} style={[styles.btn, styles.btnGhost, { borderColor: theme.border }]}>
              <Text style={[styles.btnText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim()}
              style={[styles.btn, styles.btnPrimary, { backgroundColor: name.trim() ? theme.accent : theme.border }]}
            >
              <Text style={[styles.btnText, { color: theme.accentText }]}>{editing ? 'Save' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '85%',
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
  body: {
    maxHeight: 400,
  },
  label: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 14,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  input: {
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  iconText: {
    fontSize: 24,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  btn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  btnGhost: {
    borderWidth: 1,
  },
  btnPrimary: {},
  btnText: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 16,
  },
});
