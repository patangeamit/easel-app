import { ARTWORKS_SEED } from '../data/artworksSeed';
import { getLocalArtworks } from './localDatabase';
import { getSupabasePublicUrl, isSupabaseConfigured, supabase, supabaseStorageBucket } from './supabase';

export const FALLBACK_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/0/0a/The_Great_Wave_off_Kanagawa.jpg';
export const DATA_SOURCE = process.env.EXPO_PUBLIC_DATA_SOURCE === 'supabase' ? 'supabase' : 'local';

export async function loadArtworks() {
  if (DATA_SOURCE === 'local') {
    const localRows = await getLocalArtworks();
    return sortArtworksByDateDesc(localRows.map(normalizeArtwork));
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_DATA_SOURCE=local or add Supabase env vars.');
  }

  const { data, error } = await supabase.from('artworks').select('*');

  if (error) {
    throw error;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return sortArtworksByDateDesc(ARTWORKS_SEED.map(normalizeArtwork));
  }

  return sortArtworksByDateDesc(data.map(normalizeArtwork));
}

export function normalizeArtwork(item) {
  const imagePath = item.image_path ?? item.storage_path ?? coerceStoragePath(item.image);
  const imageSource = imagePath ?? item.image ?? item.image_url ?? null;
  const resolvedImageUrl =
    DATA_SOURCE === 'supabase' && imagePath
      ? getSupabasePublicUrl(imagePath, item.storage_bucket ?? supabaseStorageBucket)
      : isHttpUrl(imageSource)
        ? imageSource
        : null;

  return {
    id: String(item.id ?? item.title ?? Math.random()),
    dateLabel: item.dateLabel ?? item.date_label ?? 'COMING SOON',
    title: item.title ?? 'Untitled artwork',
    medium: item.medium ?? 'Unknown medium',
    artist: item.artist ?? 'Unknown artist',
    year: String(item.year ?? ''),
    image: resolvedImageUrl ?? FALLBACK_IMAGE_URL,
    essay: item.essay ?? item.description ?? 'No description available yet.',
    day: item.day ?? 0,
  };
}

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function coerceStoragePath(value) {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  if (isHttpUrl(value)) {
    return null;
  }

  return value.replace(/^\/+/, '');
}

function sortArtworksByDateDesc(artworks) {
  return [...artworks].sort((left, right) => parseDateLabel(right.dateLabel) - parseDateLabel(left.dateLabel));
}

function parseDateLabel(dateLabel) {
  const parsed = Date.parse(dateLabel);
  return Number.isNaN(parsed) ? 0 : parsed;
}
