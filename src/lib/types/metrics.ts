import type { User } from './user';
import type { Assignment } from './assignment';

export interface UserLoad {
  user: User;
  assignedHours: number;
  loadRatio: number;
  assignments: Assignment[];
}

export interface CapacitySnapshot {
  id: string;
  userId: string;
  weekStart: string;
  totalCapacityHours: number;
  allocatedHours: number;
  loadRatio: number;
  createdAt: string;
}

export interface MetricSnapshot {
  timestamp: string;
  totalCapacityHours: number;
  allocatedHours: number;
  availableHours: number;
  utilizationRatio: number;
  userCount: number;
  teamCount: number;
  openReqs: number;
  activeAssignments: number;
  moduleMetrics: Record<string, unknown>;
}

export interface ExecutiveSummary {
  timestamp: string;
  overallHealthScore: number;
  keyMetrics: {
    capacityUtilization: number;
    avgUserLoadRatio: number;
    openReqsCount: number;
    staffingRiskLevel: 'low' | 'medium' | 'high';
  };
  insights: string[];
  recommendations: string[];
}

export interface CapacityMetrics {
  userId: string;
  allocatedHours: number;
  availableHours: number;
  loadRatio: number;
}

export interface TeamCapacityMetrics {
  teamId: string;
  totalCapacity: number;
  allocatedHours: number;
  utilizationRatio: number;
}

// ----------------------------------------------------------------
// AI Executive Insights Dashboard
// ----------------------------------------------------------------

export type ModuleHealthStatus = 'healthy' | 'warning' | 'critical' | 'no_data';

export interface ModuleHealth {
  status: ModuleHealthStatus;
  score: number; // 0-100
  headline: string;
  details: string[];
  link: string;
}

export interface InsightAlert {
  level: 'critical' | 'warning' | 'info';
  module: string;
  message: string;
}

export interface InsightsDashboard {
  timestamp: string;
  overallHealthScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  modules: {
    capacity: ModuleHealth;
    funnel: ModuleHealth;
    quality: ModuleHealth;
    experiments: ModuleHealth;
  };
  insights: string[];
  recommendations: string[];
  alerts: InsightAlert[];
}
