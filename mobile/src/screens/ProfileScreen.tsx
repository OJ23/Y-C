import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemePreference, useTheme } from '../theme';
import { FeedItem, ProfileSummary } from '../types';

type Props = { items: FeedItem[]; profile: ProfileSummary | null; onBookmarked: () => void; onSignIn: () => void; onLogout: () => void };
const settings = ['Edit profile', 'Location and discovery area', 'Taste preferences', 'Notifications', 'Privacy', 'Help and support'];

export function ProfileScreen({ items, profile, onBookmarked, onSignIn, onLogout }: Props) {
  const { colors, preference, setPreference } = useTheme();
  const savedRestaurants = items.filter(item => item.isBookmarked && item.type === 'restaurant').length;
  const savedDishes = items.filter(item => item.isBookmarked && item.type === 'dish').length;
  if (!profile) return <View style={[styles.signedOut, { backgroundColor: colors.background }]}><View style={[styles.avatar, { backgroundColor: colors.surface }]}><Text style={[styles.avatarText, { color: colors.primary }]}>S</Text></View><Text style={[styles.signedOutTitle, { color: colors.text }]}>Make Savour yours.</Text><Text style={[styles.signedOutCopy, { color: colors.muted }]}>Sign in to sync bookmarks, create places, and keep your dining history across devices.</Text><Pressable onPress={onSignIn} style={[styles.signIn, { backgroundColor: colors.primary }]}><Text style={{ color: '#fff', fontWeight: '800' }}>Log in</Text></Pressable></View>;
  return <ScrollView contentContainerStyle={[styles.root, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
    <View style={[styles.hero, { backgroundColor: colors.primaryDark }]}><View style={styles.avatar}><Text style={[styles.avatarText, { color: colors.primaryDark }]}>{profile.displayName.charAt(0).toUpperCase()}</Text></View><Text style={styles.name}>{profile.displayName}</Text><Text style={styles.username}>@{profile.username} · {profile.city}</Text><Text style={styles.bio}>{profile.bio}</Text><View style={styles.tastes}>{profile.tasteTags.map(tag => <Text key={tag} style={styles.taste}>{tag}</Text>)}</View></View>
    <View style={styles.counts}><View><Text style={[styles.count, { color: colors.text }]}>{savedRestaurants}</Text><Text style={[styles.countLabel, { color: colors.muted }]}>Restaurants</Text></View><View><Text style={[styles.count, { color: colors.text }]}>{savedDishes}</Text><Text style={[styles.countLabel, { color: colors.muted }]}>Dishes</Text></View><View><Text style={[styles.count, { color: colors.text }]}>0</Text><Text style={[styles.countLabel, { color: colors.muted }]}>Moments</Text></View></View>
    <Pressable accessibilityRole="button" onPress={onBookmarked} style={[styles.savedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.savedIcon, { backgroundColor: `${colors.accent}18` }]}><Text style={{ color: colors.accent, fontSize: 22 }}>◇</Text></View><View style={{ flex: 1 }}><Text style={[styles.rowTitle, { color: colors.text }]}>Saved</Text><Text style={[styles.rowDetail, { color: colors.muted }]}>{savedRestaurants + savedDishes} bookmarked items</Text></View><Text style={{ color: colors.muted, fontSize: 25 }}>›</Text></Pressable>
    <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text><View style={[styles.themeControl, { backgroundColor: colors.surface, borderColor: colors.border }]}>{(['system', 'light', 'dark'] as ThemePreference[]).map(option => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: preference === option }} onPress={() => setPreference(option)} style={[styles.themeOption, preference === option && { backgroundColor: colors.primary }]}><Text style={{ color: preference === option ? '#fff' : colors.text, fontSize: 11, fontWeight: '800', textTransform: 'capitalize' }}>{option}</Text></Pressable>)}</View></View>
    <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text><View style={[styles.settings, { backgroundColor: colors.surface, borderColor: colors.border }]}>{settings.map(setting => <Pressable key={setting} accessibilityRole="button" style={[styles.setting, { borderBottomColor: colors.border }]}><Text style={[styles.rowTitle, { color: colors.text }]}>{setting}</Text><Text style={{ color: colors.muted, fontSize: 24 }}>›</Text></Pressable>)}</View></View>
    <Pressable accessibilityRole="button" onPress={onLogout} style={[styles.logout, { borderColor: colors.danger }]}><Text style={{ color: colors.danger, fontWeight: '800' }}>Log out</Text></Pressable>
    <Text style={[styles.version, { color: colors.muted }]}>Savour 1.0.0</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({
  root: { paddingBottom: 110 }, hero: { padding: 22, alignItems: 'center' }, signedOut: { flex: 1, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' }, signedOutTitle: { fontFamily: 'serif', fontSize: 30, fontWeight: '700', marginTop: 18 }, signedOutCopy: { textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: 22 }, signIn: { minWidth: 150, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginTop: 8 }, avatarText: { fontFamily: 'serif', fontSize: 36, fontWeight: '700' },
  name: { color: '#fff', fontFamily: 'serif', fontSize: 27, fontWeight: '700', marginTop: 11 }, username: { color: 'rgba(255,255,255,.65)', fontSize: 11, marginTop: 2 }, bio: { color: '#fff', textAlign: 'center', fontSize: 12, marginTop: 10 },
  tastes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 13 }, taste: { color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,.3)', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 4, fontSize: 9, fontWeight: '700' },
  counts: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 18 }, count: { textAlign: 'center', fontSize: 21, fontWeight: '900' }, countLabel: { fontSize: 10, marginTop: 2 },
  savedCard: { minHeight: 76, marginHorizontal: 16, padding: 13, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, savedIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 13, fontWeight: '800' }, rowDetail: { fontSize: 10, marginTop: 3 },
  section: { marginTop: 24, paddingHorizontal: 16 }, sectionTitle: { fontFamily: 'serif', fontSize: 22, fontWeight: '700', marginBottom: 10 },
  themeControl: { padding: 4, borderWidth: 1, borderRadius: 14, flexDirection: 'row' }, themeOption: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settings: { overflow: 'hidden', borderWidth: 1, borderRadius: 16 }, setting: { minHeight: 54, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logout: { minHeight: 48, margin: 16, marginTop: 24, borderWidth: 1, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, version: { textAlign: 'center', fontSize: 10 }
});
