import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { RootScreen } from '../types';
import { useTheme } from '../theme';

const tabs: Array<{ key: RootScreen; label: string; icon: string }> = [
  { key: 'discover', label: 'Discover', icon: '⌖' },
  { key: 'bookmarked', label: 'Bookmarked', icon: '♧' },
  { key: 'profile', label: 'Profile', icon: '●' }
];

type Props = { active: RootScreen; onSelect: (screen: RootScreen) => void; onCreate: () => void };

export function BottomNavigation({ active, onSelect, onCreate }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.shell, { backgroundColor: colors.surface, borderTopColor: colors.border }]} accessibilityRole="tablist">
      {tabs.map((tab, index) => (
        <React.Fragment key={tab.key}>
          {index === 2 && <View style={styles.createSpace} />}
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active === tab.key }}
            accessibilityLabel={tab.label}
            onPress={() => onSelect(tab.key)}
            style={({ pressed }) => [styles.item, active === tab.key && { backgroundColor: `${colors.primary}18` }, pressed && styles.pressed]}
          >
            <Text style={[styles.icon, { color: active === tab.key ? colors.primary : colors.muted }]}>{tab.icon}</Text>
            <Text style={[styles.label, { color: active === tab.key ? colors.primary : colors.muted }, active === tab.key && styles.activeLabel]}>{tab.label}</Text>
            {active === tab.key && <View style={[styles.indicator, { backgroundColor: colors.accent }]} />}
          </Pressable>
        </React.Fragment>
      ))}
      <Pressable accessibilityRole="button" accessibilityLabel="Create new" onPress={onCreate} style={({ pressed }) => [styles.create, { backgroundColor: colors.primary, borderColor: colors.surface }, pressed && styles.createPressed]}>
        <Text style={styles.plus}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { position: 'absolute', right: 0, bottom: 0, left: 0, minHeight: 72, paddingBottom: Platform.OS === 'ios' ? 18 : 7, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'flex-end', shadowColor: '#000', shadowOpacity: .1, shadowRadius: 18, elevation: 14, zIndex: 30 },
  item: { width: '25%', minHeight: 62, alignItems: 'center', justifyContent: 'center', gap: 1, borderRadius: 18 },
  createSpace: { width: '25%' },
  icon: { fontSize: 20, lineHeight: 22 },
  label: { fontSize: 10, fontWeight: '600' },
  activeLabel: { fontWeight: '800' },
  indicator: { position: 'absolute', top: 4, width: 18, height: 3, borderRadius: 3 },
  pressed: { opacity: .65 },
  create: { position: 'absolute', top: -24, left: '50%', width: 62, height: 62, marginLeft: -31, borderRadius: 31, borderWidth: 5, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: .2, shadowRadius: 10, elevation: 18 },
  createPressed: { transform: [{ scale: .95 }] },
  plus: { color: '#fff', fontSize: 34, fontWeight: '300', lineHeight: 36 }
});
