import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'savour.refreshToken';
export const saveRefreshToken = (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
export const readRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
export const clearRefreshToken = () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
