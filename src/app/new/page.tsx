'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDream } from '@/lib/api';

const emptyForm = { title: '', content: '' };

export default function NewDreamPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitDream = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createDream({
        title: form.title.trim(),
        content: form.content.trim(),
      });
      setForm(emptyForm);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dream');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="layout single">
      <section className="panel">
        <h2>New dream</h2>
        <form className="form" onSubmit={submitDream}>
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
          <button type="submit" className="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save dream'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </section>
    </main>
  );
}
