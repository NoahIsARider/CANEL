import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: Array<(msg: ToastMessage) => void> = [];

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'info') {
  const msg: ToastMessage = { id: Date.now().toString(), text, type };
  toastListeners.forEach((fn) => fn(msg));
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 3000);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 bg-surface border border-line rounded-card shadow-pop animate-pop-in ${
            toast.type === 'error' ? 'border-red-500/30' : ''
          }`}
        >
          <span className="text-body">{toast.text}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-ink-tertiary hover:text-ink transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
