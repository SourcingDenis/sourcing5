export type ContentType = 'subject_line' | 'email_body' | 'follow_up' | 'inmail';

export type Tone = 'formal' | 'casual' | 'friendly' | 'witty' | 'direct';

export type LengthPreference = 'short' | 'medium' | 'long';

export interface PersonalizationVars {
  candidateName?: string;
  candidateRole?: string;
  candidateCompany?: string;
  targetRole?: string;
  targetCompany?: string;
  customNote?: string;
}

export interface GenerateRequest {
  contentType: ContentType;
  tone: Tone;
  length: LengthPreference;
  personalization: PersonalizationVars;
  prompt: string;
  existingContent?: string;
  refinementInstruction?: string;
  numberOfVariants: number;
}

export interface GeneratedVariant {
  content: string;
  label: string;
}

export interface GenerateResponse {
  success: boolean;
  variants: GeneratedVariant[];
  error?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  request: GenerateRequest;
  variants: GeneratedVariant[];
  selectedVariant?: number;
}
