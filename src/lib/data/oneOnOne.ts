import { supabase } from '@/lib/db/client';
import { oneOnOnesRepository } from '@/lib/db/repositories/oneOnOnes';
import { actionItemsRepository } from '@/lib/db/repositories/actionItems';
import { usersRepository } from '@/lib/db/repositories/users';
import { funnelMetricsRepository } from '@/lib/db/repositories/funnelMetrics';
import { assignmentsRepository } from '@/lib/db/repositories/assignments';
import { getAllUsersLoad } from '@/lib/data/capacity';
import { getTeamFunnelSummary } from '@/lib/data/funnel';
import { getWeekStartDate } from '@/lib/utils/helpers';
import type {
  GeneratedAgenda,
  AgendaSection,
  OneOnOneDashboardStats,
  OneOnOne,
} from '@/lib/types';

// ----------------------------------------------------------------
// Agenda Generation
// Integrates live capacity, funnel, and action item data per report
// ----------------------------------------------------------------

export async function generateAgenda(
  managerId: string,
  reportId: string
): Promise<GeneratedAgenda> {
  const currentWeekStr = getWeekStartDate().toISOString().split('T')[0];

  // Parallel fetch all required data
  const [allUsersLoad, teamFunnelSummary, openActionItems, reportUser, allAssignments] =
    await Promise.all([
      getAllUsersLoad(),
      getTeamFunnelSummary(currentWeekStr),
      actionItemsRepository.listOpenByOwner(reportId),
      usersRepository.getUserById(reportId),
      assignmentsRepository.listUserAssignments(reportId),
    ]);

  // ── CAPACITY ────────────────────────────────────────────────
  const reportLoad = allUsersLoad.find((u) => u.user.id === reportId);
  const loadRatio      = reportLoad?.loadRatio      ?? 0;
  const assignedHours  = reportLoad?.assignedHours  ?? 0;
  const totalCapacity  = reportLoad?.user.weeklyCapacityHours ?? 0;
  const userAssignments = reportLoad?.assignments ?? [];

  // Fetch req titles for capacity assignments
  const assignedReqIds = userAssignments.map((a) => a.reqId);
  let reqTitleMap = new Map<string, string>();
  if (assignedReqIds.length > 0) {
    const { data: reqRows } = await supabase
      .from('reqs')
      .select('id, title')
      .in('id', assignedReqIds);
    reqTitleMap = new Map((reqRows ?? []).map((r) => [r.id, r.title]));
  }

  // ── FUNNEL ALERTS ───────────────────────────────────────────
  const reportFunnelSummary = teamFunnelSummary.sourcerSummaries.find(
    (s) => s.userId === reportId
  );
  const funnelAlerts: Array<{ reqTitle: string; severity: string; message: string }> = [];
  if (reportFunnelSummary) {
    for (const metric of reportFunnelSummary.metrics) {
      for (const alert of metric.alerts) {
        if (alert.severity !== 'ok') {
          funnelAlerts.push({
            reqTitle: metric.reqTitle,
            severity: alert.severity,
            message:  alert.message,
          });
        }
      }
    }
  }

  // ── STALLED REQS (no outreach in > 7 days) ──────────────────
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const activeReqIds = allAssignments
    .filter((a) => a.status === 'active')
    .map((a) => a.reqId);

  const stalledReqs: Array<{ reqId: string; reqTitle: string; daysSince: number }> = [];

  if (activeReqIds.length > 0) {
    const recentMetrics = await funnelMetricsRepository.listByUser(
      reportId,
      4 * Math.max(activeReqIds.length, 1)
    );

    // Build map: reqId → most recent week_start_date with outreach > 0
    const lastOutreachByReq = new Map<string, string>();
    for (const m of recentMetrics) {
      if (m.outreachSent > 0) {
        const existing = lastOutreachByReq.get(m.reqId);
        if (!existing || m.weekStartDate > existing) {
          lastOutreachByReq.set(m.reqId, m.weekStartDate);
        }
      }
    }

    // Fetch req titles for stalled detection
    const { data: stalledReqRows } = await supabase
      .from('reqs')
      .select('id, title')
      .in('id', activeReqIds);
    const stalledReqTitleMap = new Map(
      (stalledReqRows ?? []).map((r) => [r.id, r.title])
    );

    for (const reqId of activeReqIds) {
      const lastWeekStr = lastOutreachByReq.get(reqId);
      if (!lastWeekStr || lastWeekStr < sevenDaysAgoStr) {
        const daysSince = lastWeekStr
          ? Math.floor(
              (Date.now() - new Date(lastWeekStr + 'T00:00:00').getTime()) / 86_400_000
            )
          : 999;
        stalledReqs.push({
          reqId,
          reqTitle: stalledReqTitleMap.get(reqId) ?? reqId,
          daysSince,
        });
      }
    }
  }

  // ── BUILD AGENDA SECTIONS ────────────────────────────────────

  // 1. WINS
  const winsBullets: string[] = [];
  if (reportFunnelSummary) {
    const { totalOutreach, totalScreens, avgReplyRate } = reportFunnelSummary;
    if (totalOutreach > 0) {
      winsBullets.push(`${totalOutreach} outreach messages sent this week`);
    }
    if (avgReplyRate >= 0.2) {
      winsBullets.push(
        `Strong reply rate: ${(avgReplyRate * 100).toFixed(0)}% (above 20% threshold)`
      );
    }
    if (totalScreens > 0) {
      winsBullets.push(`${totalScreens} screen(s) booked across all reqs`);
    }
  }
  if (winsBullets.length === 0) {
    winsBullets.push('No funnel wins captured this week — discuss qualitative progress');
  }

  // 2. CAPACITY REVIEW
  const capacityBullets: string[] = [
    `Load ratio: ${(loadRatio * 100).toFixed(0)}% ` +
      `(${assignedHours}h allocated / ${totalCapacity}h capacity)`,
  ];
  if (loadRatio > 1.0) {
    capacityBullets.push(
      `Over capacity — discuss re-prioritization or req hand-off`
    );
  } else if (loadRatio >= 0.8) {
    capacityBullets.push(
      `Near capacity — monitor closely before adding new assignments`
    );
  } else if (loadRatio < 0.5 && totalCapacity > 0) {
    capacityBullets.push(
      `Under-utilized — consider adding a req or stretch goal`
    );
  }
  for (const a of userAssignments) {
    const title = reqTitleMap.get(a.reqId) ?? a.reqId;
    capacityBullets.push(`  • ${title}: ${a.estimatedHoursPerWeek}h/wk`);
  }

  // 3. FUNNEL HEALTH
  const funnelBullets: string[] = [];
  for (const alert of funnelAlerts) {
    const prefix = alert.severity === 'red' ? '[RED]' :
                   alert.severity === 'warning' ? '[WARNING]' : '[FLAG]';
    funnelBullets.push(`${prefix} ${alert.reqTitle}: ${alert.message}`);
  }
  for (const stalled of stalledReqs) {
    funnelBullets.push(
      `[STALLED] ${stalled.reqTitle} — no outreach in ${stalled.daysSince} days`
    );
  }
  if (funnelBullets.length === 0) {
    funnelBullets.push('All funnels healthy this week');
  }

  // 4. BLOCKERS (open action items)
  const blockerBullets: string[] = [];
  const today = new Date().toISOString().split('T')[0];
  for (const item of openActionItems) {
    const overdue = item.dueDate < today ? ' [OVERDUE]' : '';
    blockerBullets.push(`${item.description} (due ${item.dueDate})${overdue}`);
  }
  if (blockerBullets.length === 0) {
    blockerBullets.push('No open action items');
  }

  // 5. DEVELOPMENT FOCUS
  const devBullets: string[] = [
    'Career goals check-in',
    'Skill development: sourcing techniques, tooling, process improvements',
  ];
  if (loadRatio < 0.7 && totalCapacity > 0) {
    devBullets.push('Bandwidth available — explore stretch project or training');
  }

  const sections: AgendaSection[] = [
    { section: 'wins',        label: 'Wins & Highlights',           bullets: winsBullets },
    { section: 'capacity',    label: 'Capacity Review',             bullets: capacityBullets },
    { section: 'funnel',      label: 'Funnel Health',               bullets: funnelBullets },
    { section: 'blockers',    label: 'Blockers & Open Action Items', bullets: blockerBullets },
    { section: 'development', label: 'Development Focus',           bullets: devBullets },
  ];

  return {
    reportId,
    reportName:  reportUser?.name ?? reportId,
    generatedAt: new Date().toISOString(),
    sections,
    rawData: {
      loadRatio,
      funnelAlertCount:   funnelAlerts.length,
      stalledReqCount:    stalledReqs.length,
      openActionItemCount: openActionItems.length,
    },
  };
}

// ----------------------------------------------------------------
// Manager Dashboard Stats
// ----------------------------------------------------------------

export async function getManagerDashboardStats(
  managerId: string
): Promise<OneOnOneDashboardStats> {
  const now = new Date();

  const since30d = new Date(now);
  since30d.setDate(since30d.getDate() - 30);

  const since90d = new Date(now);
  since90d.setDate(since90d.getDate() - 90);

  // Get report IDs under this manager
  const allUsers = await usersRepository.listUsers();
  const reportIds = allUsers
    .filter((u) => u.managerId === managerId)
    .map((u) => u.id);

  const [ones30d, ones90d, agingItems] = await Promise.all([
    oneOnOnesRepository.listByManagerInWindow(managerId, since30d.toISOString()),
    oneOnOnesRepository.listByManagerInWindow(managerId, since90d.toISOString()),
    actionItemsRepository.listAgingByOwners(reportIds, 14),
  ]);

  function calcRate(ones: OneOnOne[]): number {
    if (ones.length === 0) return 0;
    const onTime = ones.filter((o) => {
      if (!o.completedAt) return false;
      const deadline = new Date(o.scheduledAt);
      deadline.setHours(deadline.getHours() + 24);
      return new Date(o.completedAt) <= deadline;
    });
    return onTime.length / ones.length;
  }

  return {
    completionRate30d:  calcRate(ones30d),
    completionRate90d:  calcRate(ones90d),
    totalScheduled30d:  ones30d.length,
    totalCompleted30d:  ones30d.filter((o) => o.completedAt !== null).length,
    totalScheduled90d:  ones90d.length,
    totalCompleted90d:  ones90d.filter((o) => o.completedAt !== null).length,
    agingActionItems:   agingItems,
    agingCount:         agingItems.length,
  };
}
