// ----------------------------------------------------------------
// Funnel Metrics — raw DB row shape
// ----------------------------------------------------------------

export interface FunnelMetric {
  id: string;
  userId: string;
  reqId: string;
  weekStartDate: string;       // ISO date string "YYYY-MM-DD"
  outreachSent: number;
  replies: number;
  positiveReplies: number;
  screensBooked: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFunnelMetricInput {
  userId: string;
  reqId: string;
  weekStartDate: string;
  outreachSent: number;
  replies: number;
  positiveReplies: number;
  screensBooked?: number;      // optional — Ashby sync fills this
}

export interface UpdateFunnelMetricInput {
  outreachSent?: number;
  replies?: number;
  positiveReplies?: number;
  screensBooked?: number;
}

// ----------------------------------------------------------------
// Computed rates (derived, never stored)
// ----------------------------------------------------------------

export interface FunnelRates {
  replyRate: number;           // replies / outreach_sent
  positiveRate: number;        // positive_replies / outreach_sent
  screenRate: number;          // screens_booked / outreach_sent
}

// ----------------------------------------------------------------
// Alert types
// ----------------------------------------------------------------

export type AlertSeverity = 'red' | 'warning' | 'flag' | 'ok';

export interface FunnelAlert {
  severity: AlertSeverity;
  message: string;
}

// ----------------------------------------------------------------
// Enriched shapes used by the UI
// ----------------------------------------------------------------

export interface FunnelMetricRow extends FunnelMetric, FunnelRates {
  alerts: FunnelAlert[];
  reqTitle: string;
  userName: string;
}

export interface SourcerFunnelSummary {
  userId: string;
  userName: string;
  totalOutreach: number;
  totalReplies: number;
  totalPositive: number;
  totalScreens: number;
  avgReplyRate: number;
  overallHealth: AlertSeverity;
  metrics: FunnelMetricRow[];
}

export interface TeamFunnelSummary {
  weekStartDate: string;
  totalOutreach: number;
  avgReplyRate: number;
  avgPositiveRate: number;
  avgScreenRate: number;
  sourcerSummaries: SourcerFunnelSummary[];
}

export interface FunnelTrendPoint {
  weekLabel: string;           // "Feb 24"
  weekStartDate: string;       // raw ISO for ordering
  replyRate: number;
  positiveRate: number;
  screenRate: number;
}

export interface SourcerFunnelHealth {
  userId: string;
  health: AlertSeverity;
  worstAlert: FunnelAlert | null;
}

// ----------------------------------------------------------------
// Ashby API types
// ----------------------------------------------------------------

export interface AshbyJobPosting {
  id: string;
  title: string;
  status: 'Open' | 'Closed' | 'Draft' | 'Archived';
  jobId: string;
  isListed: boolean;
  createdAt: string;
  updatedAt: string;
  locationName?: string;
  departmentName?: string;
}

export interface AshbyApplication {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  currentInterviewStageName?: string;
  currentInterviewStageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AshbyListResponse<T> {
  success: true;
  results: T[];
  moreDataAvailable: boolean;
  nextCursor?: string;
}

export interface AshbySyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}

// ----------------------------------------------------------------
// App Settings
// ----------------------------------------------------------------

export interface AppSetting {
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

export interface UpdateSettingInput {
  value: string;
}

export interface AshbyConfig {
  apiKey: string;
  baseUrl: string;
  isConfigured: boolean;
}
