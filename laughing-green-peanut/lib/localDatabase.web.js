import { ARTWORKS_SEED } from '../data/artworksSeed';

const INSTALL_DATE_KEY = 'install_start_date';

export async function initializeLocalDatabase() {
  return null;
}

export async function getLocalArtworks() {
  return ARTWORKS_SEED;
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
