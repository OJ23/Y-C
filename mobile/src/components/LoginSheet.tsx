import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { login } from '../api/client';
import { useTheme } from '../theme';

type Props = { visible: boolean; onClose: () => void; onSuccess: () => void };

export function LoginSheet({ visible, onClose, onSuccess }: Props) {
  const { colors } = useTheme(); const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const submit = async () => {
    if (!username.trim() || !password) return setError('Enter your username and password.');
    setBusy(true); setError('');
    try { await login(username.trim(), password); onSuccess(); }
    catch { setError('Sign-in failed. Check your details and server connection.'); }
    finally { setBusy(false); }
  };
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent><View style={styles.root} accessibilityViewIsModal><Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityLabel="Close sign-in" /><View style={[styles.sheet, { backgroundColor: colors.surface }]}><View style={[styles.handle, { backgroundColor: colors.border }]} /><View style={styles.titleRow}><View style={{ flex: 1 }}><Text style={[styles.eyebrow, { color: colors.accent }]}>WELCOME BACK</Text><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Return to your table.</Text></View><Pressable onPress={onClose} accessibilityLabel="Close sign-in" style={[styles.close, { backgroundColor: colors.background }]}><Text style={{ color: colors.text, fontSize: 26 }}>×</Text></Pressable></View>
    <TextInput value={username} onChangeText={setUsername} autoCapitalize="none" autoComplete="username" placeholder="Username" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
    <TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Password" placeholderTextColor={colors.muted} onSubmitEditing={submit} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
    {error ? <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    <Pressable disabled={busy} onPress={submit} style={[styles.button, { backgroundColor: colors.primary }]}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}</Pressable>
  </View></View></Modal>;
}

const styles = StyleSheet.create({ root: { flex: 1, justifyContent: 'flex-end' }, sheet: { padding: 20, paddingBottom: 34, borderTopLeftRadius: 28, borderTopRightRadius: 28 }, handle: { width: 42, height: 5, borderRadius: 5, alignSelf: 'center', marginBottom: 18 }, titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 }, eyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 5 }, title: { fontFamily: 'serif', fontSize: 28, fontWeight: '700' }, close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, input: { minHeight: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, marginBottom: 12 }, error: { fontSize: 11, marginBottom: 10 }, button: { minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#fff', fontWeight: '800' } });
