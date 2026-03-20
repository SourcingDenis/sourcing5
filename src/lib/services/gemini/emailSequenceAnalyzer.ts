import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AshbyEmailSequence, AshbyEmailSequenceStep } from '@/lib/services/ashby/types';

export interface StepAnalysis {
  stepId: string;
  stepOrder: number;
  originalSubject?: string;
  originalBody?: string;
  suggestedSubject?: string;
  suggestedBody?: string;
  reasoning: string;
}

export interface SequenceAnalysis {
  sequenceId: string;
  sequenceName: string;
  overallAssessment: string;
  steps: StepAnalysis[];
  generalRecommendations: string[];
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenerativeAI(apiKey);
}

function buildPrompt(sequence: AshbyEmailSequence): string {
  const stepsText = (sequence.steps ?? [])
    .filter((s) => s.type === 'Email')
    .map(
      (s) => `
--- Step ${s.stepOrder} (ID: ${s.id}, delay: ${s.delayDays} day(s)) ---
Subject: ${s.subject ?? '(no subject)'}
Body:
${s.body ?? '(no body)'}
`
    )
    .join('\n');

  return `You are an expert recruiter and copywriter. Analyse the following email outreach sequence named "${sequence.name}" and improve it for higher response rates.

For each email step, provide:
1. A revised subject line (concise, personalised, no spam triggers)
2. A revised body (conversational, value-first, clear call-to-action, max 3 short paragraphs)
3. Your reasoning for the changes

Return your answer as a single valid JSON object with this exact shape:
{
  "overallAssessment": "<2-3 sentence assessment of the full sequence>",
  "generalRecommendations": ["<tip>", "<tip>"],
  "steps": [
    {
      "stepId": "<step id>",
      "suggestedSubject": "<new subject>",
      "suggestedBody": "<new body>",
      "reasoning": "<why you changed it>"
    }
  ]
}

Only include steps of type Email. Do not include any text outside the JSON object.

Here are the sequence steps:
${stepsText}`;
}

export async function analyzeEmailSequence(
  sequence: AshbyEmailSequence
): Promise<SequenceAnalysis> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const emailSteps = (sequence.steps ?? []).filter((s) => s.type === 'Email');

  if (emailSteps.length === 0) {
    return {
      sequenceId: sequence.id,
      sequenceName: sequence.name,
      overallAssessment: 'No email steps found in this sequence.',
      steps: [],
      generalRecommendations: [],
    };
  }

  const prompt = buildPrompt(sequence);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Strip markdown code fences if present
  const jsonText = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

  let parsed: {
    overallAssessment: string;
    generalRecommendations: string[];
    steps: Array<{
      stepId: string;
      suggestedSubject?: string;
      suggestedBody?: string;
      reasoning: string;
    }>;
  };

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`Gemini returned invalid JSON. Raw response:\n${text}`);
  }

  // Map parsed suggestions back to original step data
  const stepMap = new Map<string, AshbyEmailSequenceStep>(emailSteps.map((s) => [s.id, s]));

  const steps: StepAnalysis[] = parsed.steps.map((suggestion) => {
    const original = stepMap.get(suggestion.stepId);
    return {
      stepId: suggestion.stepId,
      stepOrder: original?.stepOrder ?? 0,
      originalSubject: original?.subject,
      originalBody: original?.body,
      suggestedSubject: suggestion.suggestedSubject,
      suggestedBody: suggestion.suggestedBody,
      reasoning: suggestion.reasoning,
    };
  });

  return {
    sequenceId: sequence.id,
    sequenceName: sequence.name,
    overallAssessment: parsed.overallAssessment,
    steps,
    generalRecommendations: parsed.generalRecommendations ?? [],
  };
}
