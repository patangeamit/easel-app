const INSTALL_DATE_KEY = 'install_start_date';
const ARTWORK_REACTIONS_KEY = 'artwork_reactions';
const LOCAL_ARTWORKS_KEY = 'local_artworks';

export async function initializeLocalDatabase() {
  return null;
}

export async function getLocalArtworks() {
  const storedValue = globalThis?.localStorage?.getItem(LOCAL_ARTWORKS_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getLocalArtworksUpToDay(day) {
  const artworks = await getLocalArtworks();
  return artworks.filter((artwork) => Number(artwork?.day ?? 0) <= Number(day ?? 0));
}

export async function hasLocalArtworkForDay(day) {
  const artworks = await getLocalArtworks();
  return artworks.some((artwork) => Number(artwork?.day ?? 0) === Number(day ?? 0));
}

export async function hasLocalArtworksForDayRange(startDay, endDay) {
  const artworks = await getLocalArtworks();
  const normalizedStartDay = Number(startDay ?? 0);
  const normalizedEndDay = Number(endDay ?? 0);

  if (normalizedEndDay < normalizedStartDay) {
    return true;
  }

  const availableDays = new Set(artworks.map((artwork) => Number(artwork?.day ?? 0)));

  for (let day = normalizedStartDay; day <= normalizedEndDay; day += 1) {
    if (!availableDays.has(day)) {
      return false;
    }
  }

  return true;
}

export async function upsertLocalArtworks(artworks) {
  if (!Array.isArray(artworks) || artworks.length === 0) {
    return;
  }

  const existingArtworks = await getLocalArtworks();
  const artworksById = new Map(existingArtworks.map((artwork) => [String(artwork.id), artwork]));

  artworks.forEach((artwork) => {
    artworksById.set(String(artwork.id), artwork);
  });

  globalThis?.localStorage?.setItem(
    LOCAL_ARTWORKS_KEY,
    JSON.stringify(Array.from(artworksById.values()))
  );
}

export async function getInstallStartDate() {
  const existingValue = globalThis?.localStorage?.getItem(INSTALL_DATE_KEY);

  if (existingValue) {
    return existingValue;
  }

  const today = new Date().toISOString().slice(0, 10);
  globalThis?.localStorage?.setItem(INSTALL_DATE_KEY, today);
  return today;
}

export async function getArtworkReactions() {
  const storedValue = globalThis?.localStorage?.getItem(ARTWORK_REACTIONS_KEY);

  if (!storedValue) {
    return {};
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    return {};
  }
}

export async function setArtworkReaction(artworkId, reaction) {
  const reactions = await getArtworkReactions();

  if (!reaction) {
    delete reactions[artworkId];
  } else {
    reactions[artworkId] = reaction;
  }

  globalThis?.localStorage?.setItem(ARTWORK_REACTIONS_KEY, JSON.stringify(reactions));
}
