import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dream Journal Platform',
  description: 'Write, review, and share dreams in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <header className="hero">
            <div className="nav">
              <p className="eyebrow">Dream Journal Platform</p>
              <nav>
                <Link href="/">Dreams</Link>
                <Link href="/new">New dream</Link>
              </nav>
            </div>
            <div>
              <h1>Keep your dreams close and easy to share.</h1>
              <p className="subhead">Capture every detail, then let your psychologist read them anytime.</p>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
