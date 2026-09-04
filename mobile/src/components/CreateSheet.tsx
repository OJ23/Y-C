import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CreationType } from '../types';
import { useTheme } from '../theme';

const options: Array<{ key: CreationType; icon: string; title: string; detail: string; ready: boolean }> = [
  { key: 'moment', icon: '◉', title: 'Create Moment', detail: 'Share a food photo and its story.', ready: false },
  { key: 'dish', icon: '♨', title: 'Add Dish', detail: 'Add a dish and connect its restaurant.', ready: false },
  { key: 'restaurant', icon: '⌂', title: 'Add Restaurant', detail: 'Share a place worth discovering.', ready: true }
];

type Props = { visible: boolean; onClose: () => void; onSelect: (type: CreationType) => void };

export function CreateSheet({ visible, onClose, onSelect }: Props) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root} accessibilityViewIsModal>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} accessibilityLabel="Close create menu" onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}><Text style={[styles.eyebrow, { color: colors.accent }]}>CREATE NEW</Text><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>What would you like to share?</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close create menu" onPress={onClose} style={[styles.close, { backgroundColor: colors.background }]}><Text style={[styles.closeText, { color: colors.text }]}>×</Text></Pressable>
          </View>
          {options.map(option => (
            <Pressable key={option.key} accessibilityRole="button" accessibilityHint={option.ready ? 'Opens the creation form' : 'Opens a preview of this upcoming flow'} onPress={() => onSelect(option.key)} style={({ pressed }) => [styles.option, { borderColor: colors.border }, pressed && { backgroundColor: colors.background }]}>
              <View style={[styles.optionIcon, { backgroundColor: `${colors.primary}18` }]}><Text style={[styles.optionIconText, { color: colors.primary }]}>{option.icon}</Text></View>
              <View style={styles.optionCopy}><Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text><Text style={[styles.optionDetail, { color: colors.muted }]}>{option.detail}</Text></View>
              {!option.ready && <Text style={[styles.soon, { color: colors.accent }]}>NEXT</Text>}
              {option.ready && <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>}
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: { padding: 20, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  handle: { width: 42, height: 5, alignSelf: 'center', borderRadius: 5, marginBottom: 20 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  headingCopy: { flex: 1, paddingRight: 16 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.4, marginBottom: 5 },
  title: { fontFamily: 'serif', fontSize: 27, fontWeight: '700' },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 28, lineHeight: 30 },
  option: { minHeight: 78, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 12 },
  optionIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  optionIconText: { fontSize: 22 },
  optionCopy: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  optionDetail: { fontSize: 12, lineHeight: 17 },
  soon: { fontSize: 9, fontWeight: '900', letterSpacing: .8 },
  chevron: { fontSize: 28 }
});
