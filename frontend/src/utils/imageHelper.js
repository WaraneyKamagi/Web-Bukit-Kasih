import ibadahImg from '../assets/ibadah.png';
import salibImg from '../assets/salib.png';
import reliefImg from '../assets/relief.png';
import belerangImg from '../assets/belerang.png';
import heroBg from '../assets/hero_bukit_kasih.png';

/**
 * Normalizes and resolves image URLs across development and production environments.
 * 1. Strips localhost:8080 from development database entries.
 * 2. Maps hardcoded /src/assets/ pathnames to bundled production image assets.
 * 3. Provides clean fallbacks if an image URL is empty or broken.
 */
export function resolveImageUrl(src) {
  if (!src || typeof src !== 'string') {
    return heroBg;
  }

  // Handle local development uploaded images
  if (src.includes('localhost:8080')) {
    return src.replace('http://localhost:8080', '');
  }

  // Handle default assets from seed database
  const lower = src.toLowerCase();
  if (lower.includes('ibadah')) return ibadahImg;
  if (lower.includes('salib')) return salibImg;
  if (lower.includes('relief')) return reliefImg;
  if (lower.includes('belerang')) return belerangImg;
  if (lower.includes('hero')) return heroBg;

  return src;
}
