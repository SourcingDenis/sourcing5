import type { MetricSnapshot, ExecutiveSummary } from '@/lib/types';

export const aiService = {
  async getExecutiveSummary(metrics: MetricSnapshot): Promise<ExecutiveSummary> {
    const utilizationPct = Math.round(metrics.utilizationRatio * 100);
    const avgLoadRaw = metrics.moduleMetrics.capacityAverageLoadRatio as number | undefined;
    const avgLoadPct = Math.round((avgLoadRaw ?? metrics.utilizationRatio) * 100);

    // Health score: 100 at 0% utilization penalizes excess; 80% utilization is ideal
    const utilizationPenalty = Math.max(0, utilizationPct - 80) * 2;
    const overallHealthScore = Math.max(0, Math.min(100, 100 - utilizationPenalty));

    const staffingRiskLevel: 'low' | 'medium' | 'high' =
      metrics.utilizationRatio > 0.9
        ? 'high'
        : metrics.utilizationRatio > 0.7
          ? 'medium'
          : 'low';

    const insights: string[] = [
      `${metrics.userCount} active sourcer(s) across ${metrics.teamCount} team(s)`,
      `Capacity at ${utilizationPct}% utilization — ${metrics.availableHours} hours available`,
      `${metrics.openReqs} open req(s) with ${metrics.activeAssignments} active assignment(s)`,
    ];

    if (metrics.utilizationRatio > 0.9) {
      insights.push('Team is near or over capacity — sourcer burnout risk is elevated');
    } else if (metrics.utilizationRatio < 0.5) {
      insights.push('Significant spare capacity — good time to take on additional requisitions');
    }

    const recommendations: string[] = [];

    if (staffingRiskLevel === 'high') {
      recommendations.push('Immediately review assignments — team is at high capacity risk');
      recommendations.push('Pause lower-priority requisitions to relieve overloaded sourcers');
    } else if (staffingRiskLevel === 'medium') {
      recommendations.push('Monitor capacity weekly — approaching the utilization ceiling');
      recommendations.push('Pre-plan coverage for upcoming leave or attrition');
    } else {
      recommendations.push('Capacity is healthy — good time to prioritize critical open reqs');
    }

    if (metrics.openReqs > metrics.activeAssignments) {
      recommendations.push(
        `${metrics.openReqs - metrics.activeAssignments} open req(s) have no active sourcer — review coverage`
      );
    }

    return {
      timestamp: metrics.timestamp,
      overallHealthScore,
      keyMetrics: {
        capacityUtilization: utilizationPct,
        avgUserLoadRatio: avgLoadPct,
        openReqsCount: metrics.openReqs,
        staffingRiskLevel,
      },
      insights,
      recommendations,
    };
  },
};
