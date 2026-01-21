'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDream, updateDream } from '@/lib/api';

const emptyForm = { title: '', content: '' };

export default function EditDreamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!params?.id) {
        setError('Missing dream id');
        setIsLoading(false);
        return;
      }
      try {
        const dream = await getDream(params.id);
        if (!cancelled) {
          setForm({ title: dream.title, content: dream.content });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dream');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!params?.id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateDream(params.id, {
        title: form.title.trim(),
        content: form.content.trim(),
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dream');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="layout single">
        <section className="panel">
          <p className="status">Loading dream…</p>
        </section>
      </main>
    );
  }

  return (
    <main className="layout single">
      <section className="panel">
        <h2>Edit dream</h2>
        <form className="form" onSubmit={submit}>
          <label className="field">
            <span>Title</span>
            <input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              maxLength={140}
              placeholder="Short and descriptive"
              required
            />
          </label>
          <label className="field">
            <span>Dream content</span>
            <textarea
              name="content"
              value={form.content}
              onChange={handleFormChange}
              placeholder="Write every detail you remember"
              rows={8}
              required
            />
          </label>
          <div className="filter-actions">
            <button type="submit" className="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="ghost" onClick={() => router.push('/')}>
              Cancel
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </main>
  );
}
