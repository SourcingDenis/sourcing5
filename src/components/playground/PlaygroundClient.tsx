'use client';

import { useState, useCallback } from 'react';
import { ControlPanel } from './ControlPanel';
import { ResultsPanel } from './ResultsPanel';
import { HistoryPanel } from './HistoryPanel';
import { playgroundRoutes } from '@/modules/playground/routes';
import type {
  GenerateRequest,
  GeneratedVariant,
  HistoryEntry,
} from '@/modules/playground/types';

export function PlaygroundClient() {
  const [variants, setVariants] = useState<GeneratedVariant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [existingContent, setExistingContent] = useState<string | undefined>();

  const handleGenerate = useCallback(async (request: GenerateRequest) => {
    setIsGenerating(true);
    setError(undefined);
    setVariants([]);

    try {
      const res = await fetch(playgroundRoutes.api.generate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? 'Generation failed');
        return;
      }

      const newVariants: GeneratedVariant[] = data.variants;
      setVariants(newVariants);

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        request,
        variants: newVariants,
      };

      setHistory((prev) => [entry, ...prev]);
      setActiveEntryId(entry.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleIterate = useCallback((content: string) => {
    setExistingContent(content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearRefinement = useCallback(() => {
    setExistingContent(undefined);
  }, []);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setVariants(entry.variants);
    setActiveEntryId(entry.id);
    setError(undefined);
  }, []);

  const handleHistoryClear = useCallback(() => {
    setHistory([]);
    setActiveEntryId(null);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Prompt Playground</h1>
        <p className="mt-2 text-slate-600">
          Experiment with AI-generated outreach content — subject lines, emails, follow-ups, and
          InMail
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — workspace */}
        <div className="lg:col-span-2 space-y-6">
          <ControlPanel
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            existingContent={existingContent}
            onClearRefinement={handleClearRefinement}
          />
          <ResultsPanel
            variants={variants}
            isGenerating={isGenerating}
            onIterate={handleIterate}
            error={error}
          />
        </div>

        {/* Right column — history */}
        <div>
          <HistoryPanel
            entries={history}
            activeEntryId={activeEntryId}
            onSelect={handleHistorySelect}
            onClear={handleHistoryClear}
          />
        </div>
      </div>
    </div>
  );
}
