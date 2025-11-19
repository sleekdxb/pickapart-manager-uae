// Change this one variable to switch environments
type ApiEnv = 'staging' | 'production';
export const API_ENV: ApiEnv = 'production';

const BASE_URLS: Record<ApiEnv, string> = {
  staging: 'https://test-api-magangment-service.pickapart.ae',
  production: 'https://api-magangment-service.pickapart.ae',
};

export const API_BASE_URL = BASE_URLS[API_ENV];

export function buildApiUrl(path: string): string {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}


