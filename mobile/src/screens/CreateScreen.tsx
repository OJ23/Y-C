import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { createRestaurant } from '../api/client';
import { useTheme } from '../theme';
import { CreationType } from '../types';

type Props = { type: CreationType; onClose: () => void };
const DRAFT_KEY = 'savour:restaurant-draft';

export function CreateScreen({ type, onClose }: Props) {
  const { colors } = useTheme();
  if (type !== 'restaurant') return <View style={[styles.placeholder, { backgroundColor: colors.background }]}><Text style={[styles.eyebrow, { color: colors.accent }]}>COMING NEXT</Text><Text accessibilityRole="header" style={[styles.placeholderTitle, { color: colors.text }]}>{type === 'moment' ? 'Create Moment' : 'Add Dish'}</Text><Text style={[styles.placeholderCopy, { color: colors.muted }]}>This native flow is prepared in the Create menu, but publishing requires its server model and moderation workflow. Restaurant submission is available first.</Text><Pressable onPress={onClose} style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Text style={styles.primaryText}>Back to Savour</Text></Pressable></View>;
  return <RestaurantForm onClose={onClose} />;
}

function RestaurantForm({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  const [name, setName] = useState(''); const [address, setAddress] = useState(''); const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState(''); const [visited, setVisited] = useState(false); const [submitting, setSubmitting] = useState(false);

  useEffect(() => { AsyncStorage.getItem(DRAFT_KEY).then(value => { if (!value) return; const draft = JSON.parse(value); setName(draft.name || ''); setAddress(draft.address || ''); setCuisine(draft.cuisine || ''); setDescription(draft.description || ''); setVisited(Boolean(draft.visited)); }).catch(() => undefined); }, []);
  const draft = { name, address, cuisine, description, visited };
  const saveDraft = async () => { await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); Alert.alert('Draft saved', 'You can continue this restaurant later.'); };
  const publish = async () => {
    if (!name.trim() || !address.trim() || !cuisine.trim()) return Alert.alert('Complete required fields', 'Restaurant name, address, and cuisine are required.');
    setSubmitting(true);
    try {
      await createRestaurant(draft);
      await AsyncStorage.removeItem(DRAFT_KEY); Alert.alert('Restaurant submitted', 'Your place was submitted successfully.', [{ text: 'Done', onPress: onClose }]);
    } catch {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); Alert.alert('Could not publish', 'Your entries were saved as a draft. Check your connection and sign-in, then try again.');
    } finally { setSubmitting(false); }
  };
  const fieldStyle = [styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }];
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.form, { backgroundColor: colors.background }]}>
    <View style={styles.formHeader}><Pressable accessibilityRole="button" accessibilityLabel="Close creation form" onPress={onClose} style={[styles.close, { borderColor: colors.border }]}><Text style={{ color: colors.text, fontSize: 25 }}>×</Text></Pressable><View style={{ flex: 1 }}><Text style={[styles.eyebrow, { color: colors.accent }]}>ADD RESTAURANT</Text><Text accessibilityRole="header" style={[styles.formTitle, { color: colors.text }]}>Share a place worth knowing.</Text></View></View>
    <Text style={[styles.policy, { color: colors.muted, backgroundColor: colors.surface }]}>Community submissions may be reviewed, corrected, merged, or removed by a Savour administrator.</Text>
    <Field label="Restaurant name *" colors={colors}><TextInput value={name} onChangeText={setName} autoCapitalize="words" placeholder="e.g. Nok by Alara" placeholderTextColor={colors.muted} style={fieldStyle} /></Field>
    <Field label="Address or map location *" colors={colors}><TextInput value={address} onChangeText={setAddress} placeholder="Street, neighbourhood, city" placeholderTextColor={colors.muted} style={fieldStyle} /></Field>
    <Field label="Cuisine or category *" colors={colors}><TextInput value={cuisine} onChangeText={setCuisine} placeholder="e.g. Nigerian, Cafe" placeholderTextColor={colors.muted} style={fieldStyle} /></Field>
    <Field label="Description" colors={colors}><TextInput value={description} onChangeText={setDescription} multiline numberOfLines={4} textAlignVertical="top" placeholder="Food, atmosphere, and what stands out" placeholderTextColor={colors.muted} style={[fieldStyle, styles.textarea]} /></Field>
    <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={{ flex: 1 }}><Text style={[styles.label, { color: colors.text }]}>I have visited this place</Text><Text style={[styles.hint, { color: colors.muted }]}>Add it to your visit history after publishing.</Text></View><Switch value={visited} onValueChange={setVisited} trackColor={{ true: colors.primary }} /></View>
    <View style={styles.actions}><Pressable disabled={submitting} onPress={saveDraft} style={[styles.secondaryButton, { borderColor: colors.primary }]}><Text style={{ color: colors.primary, fontWeight: '800' }}>Save draft</Text></Pressable><Pressable disabled={submitting} onPress={publish} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>{submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Review & submit</Text>}</Pressable></View>
  </ScrollView>;
}

function Field({ label, colors, children }: React.PropsWithChildren<{ label: string; colors: ReturnType<typeof useTheme>['colors'] }>) { return <View style={styles.field}><Text style={[styles.label, { color: colors.text }]}>{label}</Text>{children}</View>; }

const styles = StyleSheet.create({
  placeholder: { flex: 1, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' }, eyebrow: { fontSize: 10, letterSpacing: 1.2, fontWeight: '900', marginBottom: 6 }, placeholderTitle: { fontFamily: 'serif', fontSize: 34, fontWeight: '700' }, placeholderCopy: { textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 12, marginBottom: 22 },
  form: { flexGrow: 1, padding: 18, paddingBottom: 40 }, formHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, marginBottom: 16 }, close: { width: 44, height: 44, borderWidth: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, formTitle: { fontFamily: 'serif', fontSize: 29, fontWeight: '700' }, policy: { padding: 13, borderRadius: 12, fontSize: 11, lineHeight: 17, marginBottom: 20 }, field: { marginBottom: 16 }, label: { fontSize: 12, fontWeight: '800', marginBottom: 7 }, hint: { fontSize: 10 }, input: { minHeight: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, fontSize: 13 }, textarea: { minHeight: 110, paddingTop: 12 }, switchRow: { minHeight: 70, borderWidth: 1, borderRadius: 13, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }, actions: { flexDirection: 'row', gap: 10, marginTop: 24 }, primaryButton: { minHeight: 48, flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, primaryText: { color: '#fff', fontWeight: '800' }, secondaryButton: { minHeight: 48, flex: 1, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }
});
