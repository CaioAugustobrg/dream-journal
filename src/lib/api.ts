import type { Dream, DreamFilters } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export function listDreams(filters: DreamFilters): Promise<Dream[]> {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.qTitle) params.set('qTitle', filters.qTitle);
  if (filters.qContent) params.set('qContent', filters.qContent);
  const query = params.toString();
  return request<Dream[]>(`/api/dreams${query ? `?${query}` : ''}`);
}

export function getDream(id: string): Promise<Dream> {
  return request<Dream>(`/api/dreams/${id}`);
}

export function createDream(payload: { title: string; content: string }): Promise<Dream> {
  return request<Dream>('/api/dreams', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateDream(
  id: string,
  payload: { title?: string; content?: string },
): Promise<Dream> {
  return request<Dream>(`/api/dreams/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
