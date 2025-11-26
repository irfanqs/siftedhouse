/**
 * Get the base URL for API calls and redirects
 * Works in both development and production (Vercel)
 */
export function getBaseUrl() {
  // Browser should use relative path
  if (typeof window !== 'undefined') {
    return '';
  }

  // SSR should use Vercel URL or localhost
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Development
  return `http://localhost:${process.env.PORT || 3000}`;
}

/**
 * Get the full app URL (with protocol and domain)
 */
export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}
