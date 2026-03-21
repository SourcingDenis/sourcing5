'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type {
  ContentType,
  Tone,
  LengthPreference,
  PersonalizationVars,
  GenerateRequest,
} from '@/modules/playground/types';
import { cn } from '@/lib/utils/helpers';

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'subject_line', label: 'Subject Line' },
  { value: 'email_body', label: 'Email Body' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'inmail', label: 'InMail' },
];

const TONES: { value: Tone; label: string }[] = [
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'witty', label: 'Witty' },
  { value: 'direct', label: 'Direct' },
];

const LENGTHS: { value: LengthPreference; label: string }[] = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
];

const PROMPT_PLACEHOLDERS: Record<ContentType, string> = {
  subject_line:
    'e.g. Write a subject line for a senior engineer at a FAANG company about a startup opportunity...',
  email_body:
    'e.g. Write a cold outreach email for a backend engineer, highlighting our remote culture and equity package...',
  follow_up:
    'e.g. Write a friendly follow-up to someone who opened my first email but didn\'t reply...',
  inmail:
    'e.g. Write a LinkedIn InMail for a data scientist, mentioning their recent publication on transformers...',
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

interface ControlPanelProps {
  onGenerate: (request: GenerateRequest) => void;
  isGenerating: boolean;
  existingContent?: string;
  onClearRefinement: () => void;
}

export function ControlPanel({
  onGenerate,
  isGenerating,
  existingContent,
  onClearRefinement,
}: ControlPanelProps) {
  const [contentType, setContentType] = useState<ContentType>('subject_line');
  const [tone, setTone] = useState<Tone>('friendly');
  const [length, setLength] = useState<LengthPreference>('medium');
  const [numberOfVariants, setNumberOfVariants] = useState(3);
  const [prompt, setPrompt] = useState('');
  const [refinementInstruction, setRefinementInstruction] = useState('');
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [personalization, setPersonalization] = useState<PersonalizationVars>({});

  function handleSubmit() {
    if (!prompt.trim() && !refinementInstruction.trim()) return;

    onGenerate({
      contentType,
      tone,
      length,
      personalization,
      prompt: prompt.trim(),
      existingContent,
      refinementInstruction: refinementInstruction.trim() || undefined,
      numberOfVariants,
    });
  }

  function handleClear() {
    setPrompt('');
    setRefinementInstruction('');
    setPersonalization({});
    onClearRefinement();
  }

  function updatePersonalization(key: keyof PersonalizationVars, value: string) {
    setPersonalization((prev) => ({ ...prev, [key]: value || undefined }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Generation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Content Type Selector */}
        <div>
          <label className={labelClass}>Content Type</label>
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            {CONTENT_TYPES.map((ct) => (
              <button
                key={ct.value}
                type="button"
                onClick={() => setContentType(ct.value)}
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium transition-colors border-r last:border-r-0 border-slate-300',
                  contentType === ct.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tone + Length + Variants Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Tone</label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    tone === t.value
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Length</label>
            <div className="flex gap-1.5">
              {LENGTHS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLength(l.value)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    length === l.value
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Variants</label>
            <input
              type="number"
              min={1}
              max={5}
              value={numberOfVariants}
              onChange={(e) =>
                setNumberOfVariants(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))
              }
              className={cn(inputClass, 'w-20')}
            />
          </div>
        </div>

        {/* Personalization (Collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowPersonalization(!showPersonalization)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <span className="text-xs">{showPersonalization ? '▼' : '▶'}</span>
            Personalization Variables
          </button>
          {showPersonalization && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Candidate Name</label>
                <input
                  type="text"
                  value={personalization.candidateName ?? ''}
                  onChange={(e) => updatePersonalization('candidateName', e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Candidate Role</label>
                <input
                  type="text"
                  value={personalization.candidateRole ?? ''}
                  onChange={(e) => updatePersonalization('candidateRole', e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Candidate Company</label>
                <input
                  type="text"
                  value={personalization.candidateCompany ?? ''}
                  onChange={(e) => updatePersonalization('candidateCompany', e.target.value)}
                  placeholder="e.g. Google"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Target Role</label>
                <input
                  type="text"
                  value={personalization.targetRole ?? ''}
                  onChange={(e) => updatePersonalization('targetRole', e.target.value)}
                  placeholder="e.g. Staff Engineer"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Target Company</label>
                <input
                  type="text"
                  value={personalization.targetCompany ?? ''}
                  onChange={(e) => updatePersonalization('targetCompany', e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Custom Note</label>
                <input
                  type="text"
                  value={personalization.customNote ?? ''}
                  onChange={(e) => updatePersonalization('customNote', e.target.value)}
                  placeholder="e.g. They spoke at ReactConf 2025"
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>

        {/* Refinement indicator */}
        {existingContent && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-800">Refining existing content</span>
              <button
                type="button"
                onClick={onClearRefinement}
                className="text-xs text-amber-600 hover:text-amber-800 underline"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-amber-700 line-clamp-3 whitespace-pre-wrap">
              {existingContent}
            </p>
            <div className="mt-3">
              <label className={labelClass}>Refinement Instruction</label>
              <textarea
                value={refinementInstruction}
                onChange={(e) => setRefinementInstruction(e.target.value)}
                placeholder="e.g. Make it shorter and add a question at the end..."
                rows={2}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Main Prompt */}
        <div>
          <label className={labelClass}>
            {existingContent ? 'Original Prompt (for context)' : 'Your Prompt'}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={PROMPT_PLACEHOLDERS[contentType]}
            rows={4}
            maxLength={2000}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-400">{prompt.length}/2000</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isGenerating || (!prompt.trim() && !refinementInstruction.trim())}
            className="flex-1"
          >
            {isGenerating ? 'Generating...' : existingContent ? 'Refine' : 'Generate'}
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={isGenerating}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
