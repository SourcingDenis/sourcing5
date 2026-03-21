'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { GeneratedVariant } from '@/modules/playground/types';

interface ResultsPanelProps {
  variants: GeneratedVariant[];
  isGenerating: boolean;
  onIterate: (content: string) => void;
  error?: string;
}

export function ResultsPanel({ variants, isGenerating, onIterate, error }: ResultsPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleCopy(content: string, index: number) {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            <p className="text-sm text-slate-500">Generating variants...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Generation failed</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variants.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center max-w-sm">
            <p className="text-lg font-medium text-slate-400">No results yet</p>
            <p className="mt-2 text-sm text-slate-400">
              Configure your settings and write a prompt above, then click Generate to create
              outreach content variants.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-500">
        {variants.length} variant{variants.length !== 1 ? 's' : ''} generated
      </h3>
      {variants.map((variant, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{variant.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">
                {variant.content}
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(variant.content, index)}
              >
                {copiedIndex === index ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onIterate(variant.content)}
              >
                Iterate
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
