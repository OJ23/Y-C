export const API_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:5173').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

export const imageUrl = (path?: string) => {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
