import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { FeedCard } from '../components/FeedCard';
import { useTheme } from '../theme';
import { FeedItem, FeedItemType } from '../types';

const tabs: Array<{ key: FeedItemType; label: string; empty: string }> = [
  { key: 'restaurant', label: 'Restaurants', empty: 'Bookmark restaurants for your next outing.' },
  { key: 'dish', label: 'Dishes', empty: 'Save dishes you want to try.' },
  { key: 'moment', label: 'Moments', empty: 'Keep dining moments that inspire you.' }
];

type Props = { items: FeedItem[]; onBookmark: (item: FeedItem) => void; onDiscover: () => void };

export function BookmarkedScreen({ items, onBookmark, onDiscover }: Props) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<FeedItemType>('restaurant');
  const visible = useMemo(() => items.filter(item => item.isBookmarked && item.type === tab), [items, tab]);
  const current = tabs.find(item => item.key === tab) || tabs[0]!;
  return (
    <FlatList data={visible} keyExtractor={item => `${item.type}:${item.id}`} renderItem={({ item }) => <FeedCard item={item} onBookmark={onBookmark} />} contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
      ListHeaderComponent={<View><View style={[styles.header, { backgroundColor: colors.surface }]}><Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR LIBRARY</Text><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Bookmarked</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Everything you want to return to.</Text></View><View style={styles.tabs}>{tabs.map(item => { const selected = item.key === tab; const count = items.filter(saved => saved.isBookmarked && saved.type === item.key).length; return <Pressable key={item.key} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => setTab(item.key)} style={[styles.tab, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.surface }]}><Text style={{ color: selected ? '#fff' : colors.text, fontSize: 11, fontWeight: '800' }}>{item.label}  {count}</Text></Pressable>; })}</View></View>}
      ListEmptyComponent={<View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}16` }]}><Text style={{ color: colors.primary, fontSize: 28 }}>◇</Text></View><Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing saved here yet</Text><Text style={[styles.emptyCopy, { color: colors.muted }]}>{current.empty}</Text><Pressable accessibilityRole="button" onPress={onDiscover} style={[styles.discoverButton, { backgroundColor: colors.primary }]}><Text style={styles.discoverText}>Discover</Text></Pressable></View>}
    />
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1, paddingBottom: 104 },
  header: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 18 },
  eyebrow: { fontSize: 9, letterSpacing: 1.2, fontWeight: '900', marginBottom: 5 },
  title: { fontFamily: 'serif', fontSize: 38, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },
  tabs: { flexDirection: 'row', gap: 7, padding: 14 },
  tab: { minHeight: 40, borderWidth: 1, borderRadius: 20, paddingHorizontal: 11, justifyContent: 'center' },
  empty: { paddingHorizontal: 36, paddingTop: 76, alignItems: 'center' },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'serif', fontSize: 25, fontWeight: '700', marginTop: 17 },
  emptyCopy: { fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 7, marginBottom: 20 },
  discoverButton: { minHeight: 46, borderRadius: 12, paddingHorizontal: 24, justifyContent: 'center' },
  discoverText: { color: '#fff', fontWeight: '800' }
});
