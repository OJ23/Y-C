import React, { useCallback, useState } from 'react';
import { SafeAreaView, StatusBar as NativeStatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getProfile, logout, setBookmark } from './src/api/client';
import { BottomNavigation } from './src/components/BottomNavigation';
import { CreateSheet } from './src/components/CreateSheet';
import { LoginSheet } from './src/components/LoginSheet';
import { BookmarkedScreen } from './src/screens/BookmarkedScreen';
import { CreateScreen } from './src/screens/CreateScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ThemeProvider, useTheme } from './src/theme';
import { CreationType, FeedItem, ProfileSummary, RootScreen } from './src/types';

export default function App() {
  return <ThemeProvider><SavourApp /></ThemeProvider>;
}

function SavourApp() {
  const { colors, resolved } = useTheme();
  const [screen, setScreen] = useState<RootScreen>('discover');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [creation, setCreation] = useState<CreationType | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingCreation, setPendingCreation] = useState<CreationType | null>(null);

  React.useEffect(() => { getProfile().then(setProfile).catch(() => setProfile(null)); }, []);

  const updateItems = useCallback((incoming: FeedItem[]) => {
    setItems(previous => incoming.map(item => ({ ...item, isBookmarked: previous.find(old => old.id === item.id && old.type === item.type)?.isBookmarked ?? item.isBookmarked })));
  }, []);
  const showNotice = (message: string) => { setNotice(message); setTimeout(() => setNotice(null), 3200); };
  const toggleBookmark = async (item: FeedItem) => {
    if (!profile) { setLoginOpen(true); showNotice('Log in to save this item.'); return; }
    const bookmarked = !item.isBookmarked;
    setItems(previous => previous.map(candidate => candidate.id === item.id && candidate.type === item.type ? { ...candidate, isBookmarked: bookmarked } : candidate));
    showNotice(bookmarked ? 'Saved to Bookmarked.' : 'Removed from Bookmarked.');
    if (item.id.includes('-demo-')) return;
    try { await setBookmark(item, bookmarked); }
    catch {
      setItems(previous => previous.map(candidate => candidate.id === item.id && candidate.type === item.type ? { ...candidate, isBookmarked: !bookmarked } : candidate));
      showNotice('Bookmark could not be updated. Your previous state was restored.');
    }
  };
  const chooseCreation = (type: CreationType) => { setCreateOpen(false); if (!profile) { setPendingCreation(type); setLoginOpen(true); return; } setCreation(type); };
  const selectScreen = (next: RootScreen) => { if (next === 'bookmarked' && !profile) { setLoginOpen(true); showNotice('Log in to open your bookmarks.'); return; } setScreen(next); };
  const finishLogin = async () => { const nextProfile = await getProfile(); setProfile(nextProfile); setLoginOpen(false); if (pendingCreation) { setCreation(pendingCreation); setPendingCreation(null); } showNotice('Welcome back.'); };
  const signOut = async () => { try { await logout(); } catch {} setProfile(null); setScreen('discover'); showNotice('You are logged out.'); };

  return <SafeAreaView style={[styles.safe, { backgroundColor: screen === 'discover' ? colors.primaryDark : colors.background, paddingTop: NativeStatusBar.currentHeight || 0 }]}>
    <StatusBar style={resolved === 'dark' ? 'light' : screen === 'discover' ? 'light' : 'dark'} />
    <View style={styles.content}>
      {creation ? <CreateScreen type={creation} onClose={() => setCreation(null)} /> : <>
        {screen === 'discover' && <DiscoverScreen items={items} onItemsChange={updateItems} onBookmark={toggleBookmark} />}
        {screen === 'bookmarked' && <BookmarkedScreen items={items} onBookmark={toggleBookmark} onDiscover={() => setScreen('discover')} />}
        {screen === 'profile' && <ProfileScreen items={items} profile={profile} onBookmarked={() => setScreen('bookmarked')} onSignIn={() => setLoginOpen(true)} onLogout={signOut} />}
        <BottomNavigation active={screen} onSelect={selectScreen} onCreate={() => setCreateOpen(true)} />
      </>}
      {notice && <View accessibilityLiveRegion="polite" style={[styles.notice, { backgroundColor: colors.text }]}><Text style={[styles.noticeText, { color: colors.surface }]}>{notice}</Text></View>}
    </View>
    <CreateSheet visible={createOpen} onClose={() => setCreateOpen(false)} onSelect={chooseCreation} />
    <LoginSheet visible={loginOpen} onClose={() => { setLoginOpen(false); setPendingCreation(null); }} onSuccess={() => { finishLogin().catch(() => showNotice('Signed in, but the profile could not be loaded.')); }} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1 }, content: { flex: 1 }, notice: { position: 'absolute', right: 16, bottom: 92, left: 16, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, zIndex: 50 }, noticeText: { fontSize: 12, fontWeight: '700', textAlign: 'center' } });
