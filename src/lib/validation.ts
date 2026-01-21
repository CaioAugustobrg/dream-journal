import { z } from 'zod';
import { isDateInput, parseDateBound } from './dates';

export const createDreamSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140, 'Max 140 characters'),
  content: z.string().trim().min(1, 'Content is required'),
});

export const updateDreamSchema = createDreamSchema
  .partial()
  .refine((data) => Boolean(data.title) || Boolean(data.content), {
    message: 'At least one field (title or content) must be provided',
  });

export const queryDreamSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
    qTitle: z.string().optional(),
    qContent: z.string().optional(),
  })
  .refine(
    (data) =>
      (!data.from || isDateInput(data.from)) &&
      (!data.to || isDateInput(data.to)),
    {
      message: 'from/to must be valid ISO date strings',
      path: ['date'],
    },
  );

export function buildDateRange(from?: string, to?: string) {
  if (!from && !to) return undefined;
  const range: { gte?: Date; lte?: Date } = {};
  if (from) range.gte = parseDateBound(from, 'start');
  if (to) range.lte = parseDateBound(to, 'end');
  return range;
}
