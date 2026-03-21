import { getGeminiClient } from '@/lib/services/gemini/client';
import type {
  GenerateRequest,
  GeneratedVariant,
  ContentType,
  Tone,
  LengthPreference,
  PersonalizationVars,
} from './types';

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  subject_line: 'email subject line',
  email_body: 'outreach email body',
  follow_up: 'follow-up email',
  inmail: 'LinkedIn InMail message',
};

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  formal: 'professional and formal',
  casual: 'casual and conversational',
  friendly: 'warm and friendly',
  witty: 'clever and witty with personality',
  direct: 'concise and straight to the point',
};

const LENGTH_DESCRIPTIONS: Record<LengthPreference, string> = {
  short: '1-2 sentences',
  medium: '3-5 sentences',
  long: '2-3 short paragraphs',
};

function buildPersonalizationSection(vars: PersonalizationVars): string {
  const lines: string[] = [];
  if (vars.candidateName) lines.push(`- Candidate name: ${vars.candidateName}`);
  if (vars.candidateRole) lines.push(`- Candidate's current role: ${vars.candidateRole}`);
  if (vars.candidateCompany) lines.push(`- Candidate's current company: ${vars.candidateCompany}`);
  if (vars.targetRole) lines.push(`- Target role: ${vars.targetRole}`);
  if (vars.targetCompany) lines.push(`- Hiring company: ${vars.targetCompany}`);
  if (vars.customNote) lines.push(`- Additional context: ${vars.customNote}`);

  if (lines.length === 0) return '';

  return `\nUse these details for personalization:\n${lines.join('\n')}\n`;
}

function buildPlaygroundPrompt(req: GenerateRequest): string {
  const contentLabel = CONTENT_TYPE_LABELS[req.contentType];
  const toneDesc = TONE_DESCRIPTIONS[req.tone];
  const lengthDesc = LENGTH_DESCRIPTIONS[req.length];
  const personalization = buildPersonalizationSection(req.personalization);

  const variantCount = req.numberOfVariants;
  const labels = Array.from({ length: variantCount }, (_, i) =>
    `Variant ${String.fromCharCode(65 + i)}`
  );

  let instructionBlock: string;

  if (req.existingContent && req.refinementInstruction) {
    instructionBlock = `Here is the existing content to refine:
---
${req.existingContent}
---

Refinement instruction: ${req.refinementInstruction}`;
  } else {
    instructionBlock = `User's instruction: ${req.prompt}`;
  }

  return `You are an expert sourcing recruiter and copywriter specializing in candidate outreach.

Generate ${variantCount} ${contentLabel} variant(s) with these parameters:
- Tone: ${toneDesc}
- Length: ${lengthDesc} per variant
- Content type: ${contentLabel}
${personalization}
${instructionBlock}

Use the labels: ${labels.map((l) => `"${l}"`).join(', ')}.

Return your answer as a single valid JSON object with this exact shape:
{
  "variants": [
    { "label": "Variant A", "content": "..." }
  ]
}

Do not include any text outside the JSON object. Do not wrap it in markdown code fences.`;
}

export async function generateContent(req: GenerateRequest): Promise<GeneratedVariant[]> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = buildPlaygroundPrompt(req);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Strip markdown code fences if present
  const jsonText = text
    .replace(/^```(?:json)?\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();

  let parsed: { variants: Array<{ label: string; content: string }> };

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`AI returned invalid JSON. Raw response:\n${text}`);
  }

  if (!Array.isArray(parsed.variants)) {
    throw new Error('AI response missing "variants" array.');
  }

  return parsed.variants.map((v) => ({
    label: v.label,
    content: v.content,
  }));
}
