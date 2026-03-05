const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!apiUrl) {
  throw new Error('Missing VITE_API_URL');
}

export const API_URL = apiUrl.replace(/\/+$/, '');
