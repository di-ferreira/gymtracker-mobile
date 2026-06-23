import { getBaseUrl } from './api';

function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function resolveUrl(url: string, baseUrl: string): string {
  if (isAbsoluteUrl(url)) return url;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

export async function getCachedMediaUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  const baseUrl = await getBaseUrl();
  return resolveUrl(url, baseUrl);
}

export async function clearMediaCache(): Promise<void> {
}

export async function getMediaCacheSize(): Promise<string> {
  return '0 B';
}
