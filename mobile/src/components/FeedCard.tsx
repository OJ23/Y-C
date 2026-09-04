import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { API_URL } from '../config';
import { useTheme } from '../theme';
import { FeedItem } from '../types';

type Props = { item: FeedItem; onBookmark: (item: FeedItem) => void };

export function FeedCard({ item, onBookmark }: Props) {
  const { colors } = useTheme();
  const open = () => {
    const path = item.type === 'restaurant' && !item.id.startsWith('restaurant-demo')
      ? `/restaurants/${item.id}`
      : item.type === 'dish' ? `/recipes?q=${encodeURIComponent(item.title)}` : '/restaurants';
    Linking.openURL(`${API_URL}${path}`).catch(() => undefined);
  };
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable accessibilityRole="link" accessibilityLabel={`Open ${item.title}`} onPress={open}>
        <View style={[styles.media, { backgroundColor: colors.primaryDark }]}>
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel={item.title} /> : null}
          <View style={[styles.typePill, { backgroundColor: colors.surface }]}><Text style={[styles.typeText, { color: colors.primary }]}>{item.type.toUpperCase()}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={`${item.isBookmarked ? 'Remove' : 'Save'} ${item.title}`} accessibilityState={{ selected: item.isBookmarked }} hitSlop={8} onPress={() => onBookmark(item)} style={[styles.bookmark, { backgroundColor: item.isBookmarked ? colors.accent : colors.surface }]}>
            <Text style={{ color: item.isBookmarked ? '#fff' : colors.text, fontSize: 19 }}>{item.isBookmarked ? '◆' : '◇'}</Text>
          </Pressable>
        </View>
      </Pressable>
      <View style={styles.body}>
        <Text style={[styles.reason, { color: colors.accent }]}>{item.recommendationReason}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{item.subtitle}</Text>
        <Text numberOfLines={2} style={[styles.description, { color: colors.muted }]}>{item.description}</Text>
        <View style={styles.tags}>{item.tags.slice(0, 3).map(tag => <Text key={tag} style={[styles.tag, { color: colors.text, backgroundColor: colors.background }]}>{tag}</Text>)}</View>
        <View style={styles.meta}>
          <Text style={[styles.metaStrong, { color: colors.text }]}>{item.rating ? `★ ${item.rating}${item.reviewCount ? ` (${item.reviewCount})` : ''}` : 'New'}</Text>
          <Text style={[styles.metaText, { color: colors.muted }]}>{[item.price, item.area].filter(Boolean).join(' · ')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, marginHorizontal: 16, marginBottom: 18 },
  media: { height: 232, position: 'relative' },
  typePill: { position: 'absolute', left: 12, top: 12, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  typeText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  bookmark: { position: 'absolute', right: 12, top: 12, width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 15 },
  reason: { fontSize: 11, fontWeight: '800', marginBottom: 6 },
  title: { fontFamily: 'serif', fontWeight: '700', fontSize: 24, marginBottom: 2 },
  subtitle: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  description: { fontSize: 13, lineHeight: 19 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 14, fontSize: 10, fontWeight: '700' },
  meta: { marginTop: 13, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(120,130,125,.25)', flexDirection: 'row', justifyContent: 'space-between' },
  metaStrong: { fontSize: 12, fontWeight: '800' },
  metaText: { fontSize: 11, fontWeight: '600' }
});
