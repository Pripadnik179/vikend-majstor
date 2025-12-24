import { getApiUrl } from './query-client';

export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/objects/')) {
    return `${getApiUrl()}/api${path}`;
  }
  if (path.startsWith('/public-objects/')) {
    return `${getApiUrl()}/api/objects${path.replace('/public-objects/', '/public/')}`;
  }
  return `${getApiUrl()}${path}`;
}
