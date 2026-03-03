import type { MetricSnapshot, ExecutiveSummary } from '@/lib/types';

export const aiService = {
  async getExecutiveSummary(metrics: MetricSnapshot): Promise<ExecutiveSummary> {
    // This placeholder implementation accepts aggregated metrics
    // and returns a type-safe insights object

    const overallHealthScore = Math.round((1 - metrics.utilizationRatio) * 100);
    const staffingRiskLevel =
      metrics.utilizationRatio > 0.85
        ? 'high'
        : metrics.utilizationRatio > 0.65
          ? 'medium'
          : 'low';

    return {
      timestamp: metrics.timestamp,
      overallHealthScore,
      keyMetrics: {
        capacityUtilization: Math.round(metrics.utilizationRatio * 100),
        avgUserLoadRatio: Math.round(
          (metrics.moduleMetrics.capacityAverageLoadRatio as number) * 100
        ),
        openReqsCount: metrics.openReqs,
        staffingRiskLevel,
      },
      insights: [
        `Platform has ${metrics.userCount} active users across ${metrics.teamCount} teams`,
        `Current capacity utilization: ${Math.round(metrics.utilizationRatio * 100)}%`,
        `${metrics.openReqs} open requisitions with ${metrics.activeAssignments} active assignments`,
      ],
      recommendations: [
        'Monitor team capacity in the coming weeks',
        'Review open requisitions for priority alignment',
        'Consider capacity planning for high-priority reqs',
      ],
    };
  },
};
