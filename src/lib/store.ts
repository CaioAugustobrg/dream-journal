import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Dream, DreamFilters } from './types';
import { buildDateRange } from './validation';
import seedData from '../../data/dreams.json';

const DATA_PATH =
  process.env.DATA_FILE ||
  (process.env.NODE_ENV === 'production'
    ? '/tmp/dreams.json' // writable on serverless, but ephemeral
    : path.join(process.cwd(), 'data', 'dreams.json'));

async function readDreams(): Promise<Dream[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Dream[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const fallback = Array.isArray(seedData) ? (seedData as Dream[]) : [];
      if (fallback.length > 0) {
        await writeDreams(fallback);
        return fallback;
      }
      return [];
    }
    throw error;
  }
}

async function writeDreams(dreams: Dream[]): Promise<void> {
  const payload = JSON.stringify(dreams, null, 2);
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, payload, 'utf-8');
}

export async function listDreams(filters: DreamFilters): Promise<Dream[]> {
  const dreams = await readDreams();
  const range = buildDateRange(filters.from, filters.to);

  return dreams
    .filter((dream) => {
      const createdAt = new Date(dream.createdAt);
      if (Number.isNaN(createdAt.getTime())) return false;
      if (range?.gte && createdAt < range.gte) return false;
      if (range?.lte && createdAt > range.lte) return false;
      if (filters.qTitle && !dream.title.toLowerCase().includes(filters.qTitle.toLowerCase()))
        return false;
      if (filters.qContent && !dream.content.toLowerCase().includes(filters.qContent.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

export async function getDream(id: string): Promise<Dream | null> {
  const dreams = await readDreams();
  return dreams.find((dream) => dream.id === id) ?? null;
}

export async function createDream(data: { title: string; content: string }): Promise<Dream> {
  const dreams = await readDreams();
  const newDream: Dream = {
    id: randomUUID(),
    title: data.title,
    content: data.content,
    createdAt: new Date().toISOString(),
  };
  await writeDreams([newDream, ...dreams]);
  return newDream;
}

export async function updateDream(
  id: string,
  data: { title?: string; content?: string },
): Promise<Dream | null> {
  const dreams = await readDreams();
  const idx = dreams.findIndex((dream) => dream.id === id);
  if (idx === -1) return null;

  const updated: Dream = {
    ...dreams[idx],
    ...(data.title ? { title: data.title } : {}),
    ...(data.content ? { content: data.content } : {}),
  };

  dreams[idx] = updated;
  await writeDreams(dreams);
  return updated;
}
