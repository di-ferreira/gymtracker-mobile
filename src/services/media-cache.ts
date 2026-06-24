import { Paths, File, Directory } from 'expo-file-system';
import { getBaseUrl } from './api';

function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function resolveUrl(url: string, baseUrl: string): string {
  if (isAbsoluteUrl(url)) return url;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

function replaceLocalhost(url: string, baseUrl: string): string {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      urlObj.protocol = baseObj.protocol;
      urlObj.hostname = baseObj.hostname;
      urlObj.port = baseObj.port;
      return urlObj.toString();
    }
  } catch {}
  return url;
}

export async function getCachedMediaUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  const baseUrl = await getBaseUrl();
  const resolved = resolveUrl(url, baseUrl);
  return replaceLocalhost(resolved, baseUrl);
}

function exerciseDirUri(exerciseId: string): string {
  return `${Paths.cache.uri}exercises/${exerciseId}/`;
}

function getExerciseDir(exerciseId: string): Directory {
  return new Directory(Paths.cache, 'exercises', exerciseId);
}

async function downloadFile(url: string, destDir: Directory): Promise<string | null> {
  try {
    const absoluteUrl = await getCachedMediaUrl(url);
    if (!absoluteUrl) return null;
    const file = await File.downloadFileAsync(absoluteUrl, destDir, { idempotent: true });
    return file.uri;
  } catch {
    return null;
  }
}

export async function downloadExerciseMedia(
  exerciseId: string,
  urls: { thumbnail_url?: string | null; image_url?: string | null; gif_url?: string | null; video_url?: string | null },
): Promise<{ thumbnail_path: string | null; image_path: string | null; gif_path: string | null; video_path: string | null }> {
  const dir = getExerciseDir(exerciseId);

  const [thumbnail_path, image_path, gif_path, video_path] = await Promise.all([
    urls.thumbnail_url ? downloadFile(urls.thumbnail_url, dir) : Promise.resolve(null),
    urls.image_url ? downloadFile(urls.image_url, dir) : Promise.resolve(null),
    urls.gif_url ? downloadFile(urls.gif_url, dir) : Promise.resolve(null),
    urls.video_url ? downloadFile(urls.video_url, dir) : Promise.resolve(null),
  ]);

  return { thumbnail_path, image_path, gif_path, video_path };
}

export async function removeExerciseMedia(exerciseId: string): Promise<void> {
  const dir = getExerciseDir(exerciseId);
  try {
    // delete() exists on the native class but is missing from TS types
    (dir as unknown as { delete: () => void }).delete();
  } catch {
    // Directory doesn't exist — nothing to remove
  }
}

export async function clearMediaCache(): Promise<void> {
  const dir = new Directory(Paths.cache, 'exercises');
  try {
    (dir as unknown as { delete: () => void }).delete();
  } catch {
    // Nothing to clear
  }
}

export async function getMediaCacheSize(): Promise<string> {
  const dir = new Directory(Paths.cache, 'exercises');
  try {
    // info() exists on the native class but is missing from TS types
    const info = (dir as unknown as { info: () => { exists: boolean; size?: number } }).info();
    if (info.exists && info.size !== undefined) {
      if (info.size < 1024) return `${info.size} B`;
      if (info.size < 1024 * 1024) return `${(info.size / 1024).toFixed(1)} KB`;
      return `${(info.size / (1024 * 1024)).toFixed(1)} MB`;
    }
  } catch {
    // Directory doesn't exist
  }
  return '0 B';
}
