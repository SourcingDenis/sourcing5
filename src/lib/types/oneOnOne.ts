// ----------------------------------------------------------------
// OneOnOne — persisted 1:1 meeting record
// ----------------------------------------------------------------
export interface OneOnOne {
  id: string;
  managerId: string;
  reportId: string;
  scheduledAt: string;      // ISO timestamp
  completedAt: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOneOnOneInput {
  managerId: string;
  reportId: string;
  scheduledAt: string;
  summary?: string;
}

export interface UpdateOneOnOneInput {
  scheduledAt?: string;
  completedAt?: string | null;
  summary?: string | null;
}

export interface OneOnOneWithParticipants extends OneOnOne {
  managerName: string;
  reportName: string;
  openActionItemCount: number;
}

// ----------------------------------------------------------------
// ActionItem — persisted action item, linked to a 1:1 (optional)
// ----------------------------------------------------------------
export type ActionItemStatus = 'open' | 'done';

export interface ActionItem {
  id: string;
  oneOnOneId: string | null;
  ownerId: string;
  description: string;
  dueDate: string;          // YYYY-MM-DD
  status: ActionItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActionItemInput {
  oneOnOneId?: string | null;
  ownerId: string;
  description: string;
  dueDate: string;
  status?: ActionItemStatus;
}

export interface UpdateActionItemInput {
  description?: string;
  dueDate?: string;
  status?: ActionItemStatus;
}

// ----------------------------------------------------------------
// Agenda generation types
// ----------------------------------------------------------------
export interface AgendaSection {
  section: 'wins' | 'capacity' | 'funnel' | 'blockers' | 'development';
  label: string;
  bullets: string[];
}

export interface GeneratedAgenda {
  reportId: string;
  reportName: string;
  generatedAt: string;
  sections: AgendaSection[];
  rawData: {
    loadRatio: number;
    funnelAlertCount: number;
    stalledReqCount: number;
    openActionItemCount: number;
  };
}

// ----------------------------------------------------------------
// Manager dashboard stats
// ----------------------------------------------------------------
export interface OneOnOneDashboardStats {
  completionRate30d: number;    // 0–1
  completionRate90d: number;    // 0–1
  totalScheduled30d: number;
  totalCompleted30d: number;
  totalScheduled90d: number;
  totalCompleted90d: number;
  agingActionItems: ActionItem[]; // due_date < today - 14 days, status = 'open'
  agingCount: number;
}
