export function parseDateBound(value: string, bound: 'start' | 'end') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if (bound === 'end') {
      date.setUTCHours(23, 59, 59, 999);
    } else {
      date.setUTCHours(0, 0, 0, 0);
    }
  }

  return date;
}

export function isDateInput(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}
