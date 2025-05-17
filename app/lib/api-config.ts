export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const buildApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`;
};