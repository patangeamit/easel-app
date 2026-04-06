import {
  getInstallStartDate,
  getLocalArtworks,
  getLocalArtworksUpToDay,
  hasLocalArtworkForDay,
  hasLocalArtworksForDayRange,
  upsertLocalArtworks,
} from './localDatabase';
import { getSupabasePublicUrl, isSupabaseConfigured, supabase, supabaseStorageBucket } from './supabase';

export const FALLBACK_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/0/0a/The_Great_Wave_off_Kanagawa.jpg';
export const DATA_SOURCE = process.env.EXPO_PUBLIC_DATA_SOURCE === 'supabase' ? 'supabase' : 'local';

export async function loadArtworkCatalog() {
  if (DATA_SOURCE === 'local') {
    const installStartDate = await getInstallStartDate();
    const currentDay = getCurrentDayNumber(installStartDate);
    const localRows = await getLocalArtworksUpToDay(currentDay);
    return sortArtworksByDayAsc(localRows.map(normalizeArtwork));
  }

  const installStartDate = await getInstallStartDate();
  const currentDay = getCurrentDayNumber(installStartDate);

  await ensureLocalArtworkWindow(currentDay);

  const localRows = await getLocalArtworksUpToDay(currentDay);
  return sortArtworksByDayAsc(localRows.map(normalizeArtwork));
}

export async function loadArtworksForCurrentDay() {
  const installStartDate = await getInstallStartDate();
  const currentDay = getCurrentDayNumber(installStartDate);

  if (DATA_SOURCE === 'local') {
    const localRows = await getLocalArtworksUpToDay(currentDay);
    const artworks = filterArtworksForDay(localRows.map(normalizeArtwork), currentDay);
    return {
      artworks: sortArtworksByDayAsc(artworks),
      currentDay,
      installStartDate,
    };
  }

  await ensureLocalArtworkWindow(currentDay);

  const localRows = await getLocalArtworksUpToDay(currentDay);
  const artworks = filterArtworksForDay(localRows.map(normalizeArtwork), currentDay);

  return {
    artworks: sortArtworksByDayAsc(artworks),
    currentDay,
    installStartDate,
  };
}

async function ensureLocalArtworkWindow(currentDay) {
  const hasRequiredArtwork = await hasLocalArtworkForDay(currentDay);
  const hasPreviousArtworkHistory = await hasLocalArtworksForDayRange(1, currentDay);

  if ((hasRequiredArtwork && hasPreviousArtworkHistory) || DATA_SOURCE !== 'supabase') {
    return;
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_DATA_SOURCE=local or add Supabase env vars.');
  }

  const syncEndDay = currentDay + 5;
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .gte('day', 1)
    .lte('day', syncEndDay)
    .order('day', { ascending: true });

  if (error) {
    throw error;
  }

  const normalizedArtworks = Array.isArray(data) ? data.map(normalizeArtwork) : [];

  if (normalizedArtworks.length > 0) {
    await upsertLocalArtworks(normalizedArtworks);
  }
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
    day: Number(item.day ?? 0),
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

function filterArtworksForDay(artworks, currentDay) {
  return artworks.filter((artwork) => Number(artwork.day ?? 0) <= currentDay);
}

function sortArtworksByDayAsc(artworks) {
  return [...artworks].sort((left, right) => {
    const dayDelta = Number(left.day ?? 0) - Number(right.day ?? 0);

    if (dayDelta !== 0) {
      return dayDelta;
    }

    return String(left.id).localeCompare(String(right.id));
  });
}

function getCurrentDayNumber(installStartDate) {
  const startDate = parseStoredDate(installStartDate);
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const startUtc = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  );
  const diffInDays = Math.floor((todayUtc - startUtc) / (1000 * 60 * 60 * 24));

  return Math.max(diffInDays + 1, 1);
}

function parseStoredDate(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  const parsed = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));

  if (Number.isNaN(parsed.getTime())) {
    const today = new Date();
    return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  }

  return parsed;
}
