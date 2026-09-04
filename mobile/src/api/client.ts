import { API_URL, imageUrl } from '../config';
import { FeedFilter, FeedItem, FeedPage, ProfileSummary } from '../types';
import { clearRefreshToken, readRefreshToken, saveRefreshToken } from '../services/tokenStorage';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

type Envelope<T> = { data: T; error: null; meta: Record<string, unknown> };

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = await readRefreshToken();
    if (!refreshToken) return null;
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) });
    if (!response.ok) { await clearRefreshToken(); accessToken = null; return null; }
    const result = await response.json() as Envelope<{ accessToken: string; refreshToken: string }>;
    accessToken = result.data.accessToken; await saveRefreshToken(result.data.refreshToken); return accessToken;
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

async function authenticatedRequest<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  if (!accessToken) await refreshAccessToken();
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...(init?.headers || {}) } });
  if (response.status === 401 && retry && await refreshAccessToken()) return authenticatedRequest(path, init, false);
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json() as Promise<T>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function getFeed(options: { cursor?: string | null; filter?: FeedFilter; query?: string }): Promise<FeedPage> {
  const params = new URLSearchParams();
  if (options.cursor) params.set('cursor', options.cursor);
  if (options.filter && options.filter !== 'for-you') params.set('filter', options.filter);
  if (options.query) params.set('q', options.query);
  const response = await authenticatedRequest<Envelope<FeedPage>>(`/api/v1/feed?${params}`);
  const page = response.data;
  return { ...page, items: page.items.map(item => ({ ...item, imageUrl: imageUrl(item.imageUrl) })) };
}

export const getProfile = async () => (await authenticatedRequest<Envelope<ProfileSummary>>('/api/v1/auth/me')).data;

export async function login(username: string, password: string) {
  const result = await request<Envelope<{ accessToken: string; refreshToken: string; user: { username: string; role: string } }>>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  accessToken = result.data.accessToken;
  await saveRefreshToken(result.data.refreshToken);
  return result.data.user;
}

export async function logout() {
  const refreshToken = await readRefreshToken();
  if (refreshToken) await fetch(`${API_URL}/api/v1/auth/logout`, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) });
  accessToken = null; await clearRefreshToken();
}

export const setBookmark = (item: FeedItem, bookmarked: boolean) => authenticatedRequest<Envelope<{ bookmarked: boolean }>>(
  bookmarked ? '/api/v1/bookmarks' : `/api/v1/bookmarks/${item.type}/${encodeURIComponent(item.id)}`,
  bookmarked ? { method: 'POST', body: JSON.stringify({ entityType: item.type, entityId: item.id }) } : { method: 'DELETE', body: JSON.stringify({}) }
);

export const createRestaurant = (draft: { name: string; address: string; cuisine: string; description: string; visited: boolean }) =>
  authenticatedRequest<{ id: string; status: string }>('/api/v1/restaurants', { method: 'POST', body: JSON.stringify(draft) });
