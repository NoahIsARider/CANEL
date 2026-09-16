import { useState } from 'react';
import { X } from 'lucide-react';
import type { CardData, CardType, CardSize } from '../types';
import { CARD_TYPE_LABELS } from '../types';

interface CardConfigModalProps {
  card: CardData;
  onSave: (card: CardData) => void;
  onClose: () => void;
}

export function CardConfigModal({ card, onSave, onClose }: CardConfigModalProps) {
  const [formData, setFormData] = useState<CardData>({ ...card });

  const updateConfig = (key: string, value: string | number | boolean | string[]) => {
    setFormData({
      ...formData,
      config: { ...formData.config, [key]: value },
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const renderConfigFields = () => {
    switch (formData.type) {
      case 'url':
        return (
          <>
            <ConfigField label="URL">
              <input
                type="url"
                value={(formData.config.url as string) || ''}
                onChange={(e) => updateConfig('url', e.target.value)}
                placeholder="https://example.com"
                className="config-input"
              />
            </ConfigField>
          </>
        );

      case 'rss':
        return (
          <>
            <ConfigField label="Feed URL">
              <input
                type="url"
                value={(formData.config.feedUrl as string) || ''}
                onChange={(e) => updateConfig('feedUrl', e.target.value)}
                placeholder="https://example.com/feed.xml"
                className="config-input"
              />
            </ConfigField>
            <ConfigField label="Display Count">
              <input
                type="number"
                value={(formData.config.displayCount as number) || 5}
                onChange={(e) => updateConfig('displayCount', parseInt(e.target.value) || 5)}
                min={1}
                max={20}
                className="config-input"
              />
            </ConfigField>
          </>
        );

      case 'note':
        return (
          <p className="text-caption text-ink-secondary">
            Note content will be stored locally. Click the card to edit.
          </p>
        );

      case 'clock':
        return (
          <p className="text-caption text-ink-secondary">
            Clock displays current time and date automatically.
          </p>
        );

      case 'weather':
        return (
          <ConfigField label="City">
            <input
              type="text"
              value={(formData.config.city as string) || ''}
              onChange={(e) => updateConfig('city', e.target.value)}
              placeholder="Beijing"
              className="config-input"
            />
          </ConfigField>
        );

      case 'todo':
        return (
          <p className="text-caption text-ink-secondary">
            Todo items will be stored locally.
          </p>
        );

      case 'webclip':
        return (
          <>
            <ConfigField label="URL">
              <input
                type="url"
                value={(formData.config.url as string) || ''}
                onChange={(e) => updateConfig('url', e.target.value)}
                placeholder="https://example.com"
                className="config-input"
              />
            </ConfigField>
            <ConfigField label="Title (optional)">
              <input
                type="text"
                value={(formData.config.title as string) || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="Custom title"
                className="config-input"
              />
            </ConfigField>
            <ConfigField label="Description (optional)">
              <textarea
                value={(formData.config.description as string) || ''}
                onChange={(e) => updateConfig('description', e.target.value)}
                placeholder="Brief description"
                rows={3}
                className="config-input"
              />
            </ConfigField>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
      <div
        className="bg-surface border border-line rounded-card p-6 w-[480px] max-h-[80vh] overflow-auto shadow-pop animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-context-title">Configure Card</h2>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type selector */}
          <ConfigField label="Type">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CardType })}
              className="config-input"
            >
              {Object.entries(CARD_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </ConfigField>

          {/* Title */}
          <ConfigField label="Title">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Card title"
              className="config-input"
            />
          </ConfigField>

          {/* Size */}
          <ConfigField label="Size">
            <div className="flex gap-2">
              {(['small', 'medium', 'large', 'wide'] as CardSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFormData({ ...formData, size })}
                  className={`px-3 py-1.5 text-caption rounded-card border transition-colors ${
                    formData.size === size
                      ? 'bg-brand text-white border-brand'
                      : 'bg-surface border-line hover:border-brand-border'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </ConfigField>

          {/* Type-specific config */}
          {renderConfigFields()}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-line">
          <button
            onClick={onClose}
            className="px-4 py-2 text-body border border-line rounded-card hover:bg-canvas transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-body bg-brand text-white rounded-card hover:bg-brand-hover transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <style>{`
        .config-input {
          width: 100%;
          padding: 8px 12px;
          font-size: 13px;
          line-height: 20px;
          background: transparent;
          border: 1px solid var(--border-line);
          border-radius: 6px;
          outline: none;
          transition: border-color 150ms;
        }
        .config-input:focus {
          border-color: var(--accent);
        }
        textarea.config-input {
          resize: vertical;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}

function ConfigField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-card-title mb-2">{label}</label>
      {children}
    </div>
  );
}
