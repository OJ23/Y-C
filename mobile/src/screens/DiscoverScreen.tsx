import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { getFeed } from '../api/client';
import { FeedCard } from '../components/FeedCard';
import { demoFeed } from '../data/demo';
import { useTheme } from '../theme';
import { FeedFilter, FeedItem } from '../types';

const filters: Array<{ key: FeedFilter; label: string }> = [
  { key: 'for-you', label: 'For You' }, { key: 'nearby', label: 'Nearby' }, { key: 'trending', label: 'Trending' },
  { key: 'dish', label: 'Dishes' }, { key: 'restaurant', label: 'Restaurants' }, { key: 'moment', label: 'Moments' },
  { key: 'budget', label: 'Budget' }, { key: 'open', label: 'Open Now' }
];

type Props = { items: FeedItem[]; onItemsChange: (items: FeedItem[]) => void; onBookmark: (item: FeedItem) => void };

export function DiscoverScreen({ items, onItemsChange, onBookmark }: Props) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<FeedFilter>('for-you');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [location, setLocation] = useState('Abuja, Nigeria');

  const loadFirst = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const page = await getFeed({ filter, query });
      onItemsChange(page.items);
      setCursor(page.nextCursor);
      setUsingDemo(false);
    } catch {
      const filtered = demoFeed.filter(item => (filter === 'dish' || filter === 'restaurant' || filter === 'moment') ? item.type === filter : true)
        .filter(item => !query || `${item.title} ${item.subtitle} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
      onItemsChange(filtered);
      setCursor(null);
      setUsingDemo(true);
      setError('Live recommendations are unavailable. Showing saved sample content.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, query, onItemsChange]);

  useEffect(() => { loadFirst(); }, [loadFirst]);

  const loadMore = async () => {
    if (!cursor || loadingMore || usingDemo) return;
    setLoadingMore(true);
    try {
      const page = await getFeed({ cursor, filter, query });
      const known = new Set(items.map(item => `${item.type}:${item.id}`));
      onItemsChange([...items, ...page.items.filter(item => !known.has(`${item.type}:${item.id}`))]);
      setCursor(page.nextCursor);
    } catch {
      setError('Could not load more recommendations. Pull to refresh or try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const header = useMemo(() => (
    <View>
      <View style={[styles.header, { backgroundColor: colors.primaryDark }]}>
        <View style={styles.brandRow}><View><Text style={styles.brand}>Savour</Text><Text style={styles.headerHint}>DISCOVER SOMETHING MEMORABLE</Text></View><View style={styles.avatar}><Text style={{ color: colors.primaryDark, fontWeight: '900' }}>S</Text></View></View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Current location ${location}. Change location`} onPress={() => setLocation(value => value === 'Abuja, Nigeria' ? 'Choose an area' : 'Abuja, Nigeria')} style={styles.location}><Text style={styles.locationIcon}>⌖</Text><View><Text style={styles.locationLabel}>CURRENT AREA</Text><Text style={styles.locationValue}>{location}  ▾</Text></View></Pressable>
        <View style={styles.searchRow}><Text style={styles.searchIcon}>⌕</Text><TextInput value={queryInput} onChangeText={setQueryInput} onSubmitEditing={() => setQuery(queryInput.trim())} returnKeyType="search" accessibilityLabel="Search restaurants, dishes, cuisine, tags, or location" placeholder="Restaurant, dish, cuisine or area" placeholderTextColor="#7d8581" style={styles.searchInput} /><Pressable accessibilityRole="button" accessibilityLabel="Search" onPress={() => setQuery(queryInput.trim())} style={[styles.searchButton, { backgroundColor: colors.accent }]}><Text style={styles.searchButtonText}>Search</Text></Pressable></View>
      </View>
      <FlatList horizontal data={filters} keyExtractor={item => item.key} showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filters, { backgroundColor: colors.background }]} renderItem={({ item }) => {
        const selected = item.key === filter;
        return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setFilter(item.key)} style={[styles.filter, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.surface }]}><Text style={[styles.filterText, { color: selected ? '#fff' : colors.text }]}>{item.label}</Text></Pressable>;
      }} />
      <View style={styles.feedHeading}><View><Text style={[styles.feedEyebrow, { color: colors.accent }]}>RECOMMENDED FOR YOU</Text><Text style={[styles.feedTitle, { color: colors.text }]}>Taste what is nearby.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Refresh recommendations" onPress={() => loadFirst(true)} style={[styles.refreshButton, { borderColor: colors.border }]}><Text style={{ color: colors.primary, fontSize: 18 }}>↻</Text></Pressable></View>
      {error && <View style={[styles.notice, { backgroundColor: `${colors.warm}22` }]}><Text style={[styles.noticeText, { color: colors.text }]}>{error}</Text></View>}
    </View>
  ), [colors, error, filter, location, queryInput, loadFirst]);

  if (loading) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} size="large" /><Text style={{ color: colors.muted }}>Preparing your recommendations…</Text></View>;

  return (
    <FlatList
      data={items}
      keyExtractor={item => `${item.type}:${item.id}`}
      renderItem={({ item }) => <FeedCard item={item} onBookmark={onBookmark} />}
      ListHeaderComponent={header}
      ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyIcon, { color: colors.primary }]}>⌕</Text><Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing matched yet</Text><Text style={[styles.emptyCopy, { color: colors.muted }]}>Try a broader search or choose another filter.</Text><Pressable onPress={() => { setQueryInput(''); setQuery(''); setFilter('for-you'); }} style={[styles.emptyButton, { backgroundColor: colors.primary }]}><Text style={styles.emptyButtonText}>Reset Discover</Text></Pressable></View>}
      ListFooterComponent={<View style={styles.footer}>{loadingMore ? <ActivityIndicator color={colors.primary} /> : !cursor && items.length ? <Text style={{ color: colors.muted }}>You are all caught up.</Text> : null}</View>}
      onEndReached={loadMore}
      onEndReachedThreshold={1}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFirst(true)} tintColor={colors.primary} />}
      contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 106, flexGrow: 1 },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brand: { color: '#fff', fontFamily: 'serif', fontSize: 28, fontWeight: '700' },
  headerHint: { color: '#f5b8a9', fontSize: 8, letterSpacing: 1.1, fontWeight: '900' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  location: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  locationIcon: { color: '#f5b8a9', fontSize: 24 },
  locationLabel: { color: 'rgba(255,255,255,.6)', fontSize: 8, letterSpacing: 1.1, fontWeight: '900' },
  locationValue: { color: '#fff', fontSize: 14, fontWeight: '800' },
  searchRow: { minHeight: 56, paddingLeft: 13, paddingRight: 6, borderRadius: 14, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchIcon: { color: '#26322d', fontSize: 24 },
  searchInput: { flex: 1, minWidth: 0, height: 48, color: '#18201d', fontSize: 13 },
  searchButton: { minWidth: 66, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  searchButtonText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  filters: { gap: 8, paddingHorizontal: 16, paddingVertical: 13 },
  filter: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderRadius: 20 },
  filterText: { fontSize: 11, fontWeight: '800' },
  feedHeading: { padding: 16, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feedEyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  feedTitle: { fontFamily: 'serif', fontSize: 27, fontWeight: '700' },
  refreshButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  notice: { marginHorizontal: 16, marginBottom: 14, padding: 11, borderRadius: 10 },
  noticeText: { fontSize: 11, lineHeight: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  empty: { margin: 16, paddingVertical: 50, alignItems: 'center' },
  emptyIcon: { fontSize: 42 }, emptyTitle: { fontFamily: 'serif', fontSize: 25, fontWeight: '700', marginTop: 8 },
  emptyCopy: { textAlign: 'center', marginTop: 6, marginBottom: 18 },
  emptyButton: { minHeight: 44, borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' }, emptyButtonText: { color: '#fff', fontWeight: '800' },
  footer: { minHeight: 70, alignItems: 'center', justifyContent: 'center' }
});
