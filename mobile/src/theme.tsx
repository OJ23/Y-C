import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

const light = {
  primary: '#174f3b', primaryDark: '#0d3829', accent: '#d7664f', warm: '#e2a63b',
  background: '#f7f8f5', surface: '#ffffff', text: '#18201d', muted: '#68716d',
  border: '#dce1dd', success: '#287a52', danger: '#b53d36', overlay: 'rgba(8,20,15,.48)'
};
const dark = {
  primary: '#72b398', primaryDark: '#071f17', accent: '#ee806a', warm: '#f0bd5c',
  background: '#09140f', surface: '#13231c', text: '#f6faf7', muted: '#aebbb5',
  border: '#2b4036', success: '#65bd8c', danger: '#f18b82', overlay: 'rgba(0,0,0,.7)'
};

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  colors: typeof light;
  setPreference: (value: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'savour:theme';

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName | null>(Appearance.getColorScheme() ?? null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(value => {
      if (value === 'system' || value === 'light' || value === 'dark') setPreferenceState(value);
    }).catch(() => undefined);
    const subscription = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme ?? null));
    return () => subscription.remove();
  }, []);

  const setPreference = (value: ThemePreference) => {
    setPreferenceState(value);
    AsyncStorage.setItem(STORAGE_KEY, value).catch(() => undefined);
  };
  const resolved = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const value = useMemo(() => ({ preference, resolved, colors: resolved === 'dark' ? dark : light, setPreference }), [preference, resolved]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
