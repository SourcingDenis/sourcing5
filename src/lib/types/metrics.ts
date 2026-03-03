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
