'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { funnelRoutes } from '@/modules/funnel';
import { cn } from '@/lib/utils/helpers';

interface AshbySettingsFormProps {
  isConfigured: boolean;       // true if API key already set in DB
  baseUrl: string;
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export function AshbySettingsForm({ isConfigured, baseUrl }: AshbySettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const apiKey  = (fd.get('apiKey') as string).trim();
    const baseUrlVal = (fd.get('baseUrl') as string).trim();

    try {
      // Save API key and base URL in parallel
      const [keyRes, urlRes] = await Promise.all([
        fetch(funnelRoutes.api.settingKey('ashby_api_key'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: apiKey }),
        }),
        fetch(funnelRoutes.api.settingKey('ashby_base_url'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: baseUrlVal }),
        }),
      ]);

      if (!keyRes.ok) {
        const d = await keyRes.json();
        setError(d.error ?? 'Failed to save API key');
        return;
      }

      if (!urlRes.ok) {
        const d = await urlRes.json();
        setError(d.error ?? 'Failed to save base URL');
        return;
      }

      setSuccess(true);
      // Reset the API key field for security — the user entered it, now it's saved
      (e.target as HTMLFormElement).reset();
    } catch {
      setError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              isConfigured ? 'bg-green-500' : 'bg-slate-300'
            )}
          />
          <span className="text-sm text-slate-600">
            {isConfigured
              ? 'API key is configured — enter a new key below to rotate it'
              : 'No API key configured yet'}
          </span>
        </div>

        <label className={labelClass}>
          Ashby API Key
          <span className="ml-1 text-slate-400 font-normal">(kept in database, never in code)</span>
        </label>
        <div className="relative">
          <input
            name="apiKey"
            type={showKey ? 'text' : 'password'}
            placeholder={isConfigured ? 'Enter new key to rotate…' : 'sk-ashby-…'}
            className={cn(inputClass, 'pr-20')}
            autoComplete="off"
            required={!isConfigured}
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Find your API key in Ashby → Settings → API Keys. The key is stored encrypted
          in your database and used only for server-side sync requests.
        </p>
      </div>

      <div>
        <label className={labelClass}>Ashby Base URL</label>
        <input
          name="baseUrl"
          type="url"
          className={inputClass}
          defaultValue={baseUrl || 'https://api.ashbyhq.com'}
        />
        <p className="mt-1 text-xs text-slate-400">
          Leave as default unless you use a custom Ashby instance.
        </p>
      </div>

      {error   && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          Settings saved. You can now use the Sync Ashby button on the Funnel Radar page.
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save Ashby Settings'}
      </Button>
    </form>
  );
}
