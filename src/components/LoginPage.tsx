import { useState } from 'react';
import { useStore } from '../store';
import { Github } from 'lucide-react';
import { uid } from '../utils';

export function LoginPage() {
  const { dispatch } = useStore();
  const [email, setEmail] = useState('');

  const handleLogin = (method: 'github' | 'google' | 'email') => {
    // DEMO ONLY: there is no backend, no OAuth, and no token. Any input "signs you in"
    // and everything is persisted in your browser's localStorage. See README > Limitations.
    const user = {
      id: uid('user'),
      name: method === 'email' ? email.split('@')[0] : 'User',
      email: method === 'email' ? email : `${method}@example.com`,
    };
    dispatch({ type: 'SET_USER', payload: user });
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-page-title mb-2">CANEL</h1>
          <p className="text-body text-ink-secondary">Connect · Assemble · Navigate</p>
        </div>

        <div className="bg-surface border border-line rounded-card p-6 shadow-card">
          <div className="mb-4 rounded-card border border-brand-border bg-brand-soft px-3 py-2 text-caption text-ink-secondary">
            Demo sign-in — no account, no server. Anything you type unlocks the dashboard and
            your data stays in this browser.
          </div>
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleLogin('github')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-line rounded-card hover:bg-canvas transition-colors"
            >
              <Github size={16} />
              <span className="text-body">Continue with GitHub</span>
            </button>
            <button
              onClick={() => handleLogin('google')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-line rounded-card hover:bg-canvas transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-body">Continue with Google</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-caption">
              <span className="px-2 bg-surface text-ink-tertiary">or</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-2.5 text-body border-b border-line focus:border-brand bg-transparent outline-none transition-colors"
            />
            <button
              onClick={() => handleLogin('email')}
              disabled={!email.trim()}
              className="w-full px-4 py-2.5 text-body bg-brand text-white rounded-card hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>

        <p className="text-center text-caption text-ink-tertiary mt-6">
          Your browser, in context.
        </p>
      </div>
    </div>
  );
}
