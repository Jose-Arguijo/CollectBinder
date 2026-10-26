import { useState, useEffect } from 'react';
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
import { X, Camera, Trash2 } from 'lucide-react-native';
import { Typography, Radius, Spacing, CONDITIONS, type Theme } from '@/lib/theme';
import type { Card } from '@/lib/supabase';

type Props = {
  visible: boolean;
  theme: Theme;
  editing?: Card | null;
  collectionIcon: string;
  collectionColor: string;
  onClose: () => void;
  onSave: (data: {
    name: string;
    set_name: string;
    card_number: string;
    condition: string;
    quantity: number;
    value: number;
    notes: string;
    photo_url: string | null;
  }) => void;
  onDelete?: () => void;
};

export default function CardEditModal({
  visible,
  theme,
  editing,
  collectionIcon,
  collectionColor,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = useState('');
  const [setNameVal, setSetNameVal] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [condition, setCondition] = useState(CONDITIONS[2]);
  const [quantity, setQuantity] = useState('1');
  const [value, setValue] = useState('0');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(editing?.name ?? '');
      setSetNameVal(editing?.set_name ?? '');
      setCardNumber(editing?.card_number ?? '');
      setCondition(editing?.condition ?? CONDITIONS[2]);
      setQuantity(String(editing?.quantity ?? 1));
      setValue(String(editing?.value ?? 0));
      setNotes(editing?.notes ?? '');
      setPhotoUrl(editing?.photo_url ?? null);
    }
  }, [visible, editing]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      set_name: setNameVal.trim(),
      card_number: cardNumber.trim(),
      condition,
      quantity: Math.max(1, parseInt(quantity) || 1),
      value: parseFloat(value) || 0,
      notes: notes.trim(),
      photo_url: photoUrl,
    });
  };

  const handleClose = () => {
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
              {editing ? 'Edit Card' : 'New Card'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={22} color={theme.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary, borderColor: theme.border }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Charizard"
              placeholderTextColor={theme.textTertiary}
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Set</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary, borderColor: theme.border }]}
                  value={setNameVal}
                  onChangeText={setSetNameVal}
                  placeholder="Base Set"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
              <View style={styles.flex1}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary, borderColor: theme.border }]}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="4/102"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Condition</Text>
            <View style={styles.conditionRow}>
              {CONDITIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCondition(c)}
                  style={[
                    styles.conditionChip,
                    {
                      backgroundColor: condition === c ? theme.accent : theme.bgSecondary,
                      borderColor: condition === c ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.conditionText,
                      { color: condition === c ? theme.accentText : theme.textSecondary },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Quantity</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary, borderColor: theme.border }]}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
              <View style={styles.flex1}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Value ($)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary, borderColor: theme.border }]}
                  value={value}
                  onChangeText={setValue}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.bgSecondary, color: theme.textPrimary, borderColor: theme.border }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any extra details..."
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Photo URL (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary, borderColor: theme.border }]}
              value={photoUrl ?? ''}
              onChangeText={setPhotoUrl}
              placeholder="https://..."
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="none"
            />
          </ScrollView>

          <View style={[styles.actions, onDelete && { gap: Spacing.sm }]}>
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={[styles.btn, { borderWidth: 1, borderColor: '#ef4444', paddingVertical: Spacing.md }]}>
                <Trash2 size={20} color="#ef4444" strokeWidth={2} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClose} style={[styles.btn, styles.btnGhost, { borderColor: theme.border }]}>
              <Text style={[styles.btnText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim()}
              style={[styles.btn, styles.btnPrimary, { backgroundColor: name.trim() ? theme.accent : theme.border }]}
            >
              <Text style={[styles.btnText, { color: theme.accentText }]}>{editing ? 'Save' : 'Add'}</Text>
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamilyBold,
    fontSize: 20,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  body: {
    maxHeight: 500,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontFamily: Typography.fontFamilySemiBold,
    fontSize: 13,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  input: {
    fontFamily: Typography.fontFamilyRegular,
    fontSize: 15,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  conditionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  conditionText: {
    fontFamily: Typography.fontFamilyMedium,
    fontSize: 13,
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
    justifyContent: 'center',
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
