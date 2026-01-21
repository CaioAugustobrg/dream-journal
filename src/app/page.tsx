'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getDream, listDreams } from '@/lib/api';
import type { Dream, DreamFilters } from '@/lib/types';

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatter.format(date);
}

export default function HomePage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    qTitle: '',
    qContent: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFilters: DreamFilters = useMemo(
    () => ({
      from: filters.from || undefined,
      to: filters.to || undefined,
      qTitle: filters.qTitle || undefined,
      qContent: filters.qContent || undefined,
    }),
    [filters],
  );

  const loadDreams = async (nextFilters: DreamFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listDreams(nextFilters);
      setDreams(data);
      if (data.length === 0) {
        setSelectedId(null);
        setSelectedDream(null);
      } else if (!selectedId || !data.some((dream) => dream.id === selectedId)) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dreams');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDreams(activeFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedDream(null);
      return;
    }
    let cancelled = false;
    const fetchDream = async () => {
      try {
        const data = await getDream(selectedId);
        if (!cancelled) setSelectedDream(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dream');
        }
      }
    };
    void fetchDream();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    void loadDreams(activeFilters);
  };

  const clearFilters = () => {
    const cleared = { from: '', to: '', qTitle: '', qContent: '' };
    setFilters(cleared);
    void loadDreams({});
  };

  return (
    <main className="layout">
      <section className="panel">
        <div className="panel-header">
          <h2>Dreams</h2>
          <form className="filters" onSubmit={applyFilters}>
            <label>
              Title contains
              <input
                type="text"
                name="qTitle"
                value={filters.qTitle}
                onChange={handleFilterChange}
                placeholder="Search title"
              />
            </label>
            <label>
              Content contains
              <input
                type="text"
                name="qContent"
                value={filters.qContent}
                onChange={handleFilterChange}
                placeholder="Search content"
              />
            </label>
            <label>
              From
              <input
                type="date"
                name="from"
                value={filters.from}
                onChange={handleFilterChange}
              />
            </label>
            <label>
              To
              <input
                type="date"
                name="to"
                value={filters.to}
                onChange={handleFilterChange}
              />
            </label>
            <div className="filter-actions">
              <button type="submit">Apply</button>
              <button type="button" className="ghost" onClick={clearFilters}>
                Clear
              </button>
            </div>
          </form>
        </div>

        {error && <p className="error">{error}</p>}
        {isLoading ? (
          <p className="status">Loading dreams…</p>
        ) : dreams.length === 0 ? (
          <p className="status">No dreams yet. Start by writing one.</p>
        ) : (
          <ul className="dream-list">
            {dreams.map((dream) => (
              <li key={dream.id}>
                <button
                  type="button"
                  className={dream.id === selectedId ? 'dream-card selected' : 'dream-card'}
                  onClick={() => setSelectedId(dream.id)}
                >
                  <div>
                    <h3>{dream.title}</h3>
                    <p>{formatDate(dream.createdAt)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel detail">
        <div className="panel-header">
          <h2>Dream details</h2>
          {selectedDream && (
            <div className="detail-actions">
              <Link className="ghost" href={`/edit/${selectedDream.id}`}>
                Edit
              </Link>
            </div>
          )}
        </div>
        {selectedDream ? (
          <article>
            <h3>{selectedDream.title}</h3>
            <p className="muted">{formatDate(selectedDream.createdAt)}</p>
            <div className="content">{selectedDream.content}</div>
          </article>
        ) : (
          <p className="status">Select a dream to read it.</p>
        )}
      </section>
    </main>
  );
}
