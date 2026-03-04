export const dynamic = 'force-dynamic';

import { getTeamQualitySummary, getWeeklySamplerForAllSourcers, getSourcerQualityHighlights, getTeamQualityCorrelation, getSourcerQualityTrend } from '@/lib/data/quality';
import { usersRepository } from '@/lib/db/repositories/users';
import { reqsRepository } from '@/lib/db/repositories/reqs';
import { getWeekStartDate } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/formatting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AddSampleButton } from '@/components/quality/AddSampleButton';
import { PendingSamplesPanel } from '@/components/quality/PendingSamplesPanel';
import { QualityCorrelationChart } from '@/components/quality/QualityCorrelationChart';
import { QualityTrendChart } from '@/components/quality/QualityTrendChart';
import { SourcerQualityTable } from '@/components/quality/SourcerQualityTable';

// Fallback reviewer ID: use the first lead in the system (00000000-...0001).
// In a production app this would come from the authenticated session.
const FALLBACK_REVIEWER_ID = '00000000-0000-0000-0000-000000000001';

export default async function QualityPage() {
  const weekStr = getWeekStartDate().toISOString().split('T')[0];

  const [teamSummary, pendingSamples, highlights, correlationPoints, users, reqs] =
    await Promise.all([
      getTeamQualitySummary(weekStr),
      getWeeklySamplerForAllSourcers(weekStr),
      getSourcerQualityHighlights(),
      getTeamQualityCorrelation(8),
      usersRepository.listUsers(),
      reqsRepository.listOpenReqs(),
    ]);

  // Fetch per-sourcer trend data for each sourcer with samples
  const sourcerTrends = await Promise.all(
    teamSummary.sourcerSummaries.map(async (s) => ({
      userId: s.userId,
      userName: s.userName,
      trendPoints: await getSourcerQualityTrend(s.userId, 12),
    }))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quality Lab</h1>
          <p className="mt-2 text-slate-600">
            Week of {formatDate(weekStr)} — outreach message quality tracking
          </p>
        </div>
        <AddSampleButton users={users} reqs={reqs} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Samples This Week</CardDescription>
            <CardTitle>{teamSummary.samplesThisWeek}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg Team Score</CardDescription>
            <CardTitle>
              {teamSummary.avgTeamScore !== null
                ? `${teamSummary.avgTeamScore.toFixed(2)} / 5`
                : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="text-green-700">Rising Quality</CardDescription>
            <CardTitle className="text-green-700">{teamSummary.risingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="text-red-600">Declining Quality</CardDescription>
            <CardTitle className="text-red-600">{teamSummary.decliningCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Rising / Declining highlights */}
      {(highlights.rising.length > 0 || highlights.declining.length > 0) && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Rising */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-green-600">↑</span> Rising Quality
              </CardTitle>
              <CardDescription>
                Quality score up ≥ 0.3 points vs prior 4-week average
              </CardDescription>
            </CardHeader>
            <CardContent>
              {highlights.rising.length === 0 ? (
                <p className="text-sm text-slate-400">No sourcers trending up this period.</p>
              ) : (
                <ul className="space-y-2">
                  {highlights.rising.map((s) => (
                    <li key={s.userId} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">{s.userName}</span>
                      <span className="text-sm text-green-700">
                        {s.thisWeekAvg !== null ? `${s.thisWeekAvg.toFixed(2)} this week` : 'No score yet'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Declining */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-red-600">↓</span> Declining Quality
              </CardTitle>
              <CardDescription>
                Quality score down ≥ 0.3 points vs prior 4-week average
              </CardDescription>
            </CardHeader>
            <CardContent>
              {highlights.declining.length === 0 ? (
                <p className="text-sm text-slate-400">No sourcers trending down this period.</p>
              ) : (
                <ul className="space-y-2">
                  {highlights.declining.map((s) => (
                    <li key={s.userId} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">{s.userName}</span>
                      <span className="text-sm text-red-700">
                        {s.thisWeekAvg !== null ? `${s.thisWeekAvg.toFixed(2)} this week` : 'No score yet'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending samples for review */}
      <Card>
        <CardHeader>
          <CardTitle>This Week&apos;s Samples</CardTitle>
          <CardDescription>
            Up to 3 randomly selected messages per sourcer — {pendingSamples.length} pending review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingSamplesPanel samples={pendingSamples} reviewerId={FALLBACK_REVIEWER_ID} />
        </CardContent>
      </Card>

      {/* Quality vs Reply Rate scatter */}
      <Card>
        <CardHeader>
          <CardTitle>Quality vs Reply Rate</CardTitle>
          <CardDescription>
            Each point is a sourcer × week. High quality should correlate with higher reply rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QualityCorrelationChart points={correlationPoints} />
        </CardContent>
      </Card>

      {/* Per-sourcer trend charts */}
      {sourcerTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Trends by Sourcer</CardTitle>
            <CardDescription>Weekly average score per sourcer (last 12 weeks)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {sourcerTrends.map((st) => (
                <div key={st.userId}>
                  <p className="mb-2 text-sm font-medium text-slate-700">{st.userName}</p>
                  <QualityTrendChart
                    trendPoints={st.trendPoints}
                    sourcerName={st.userName}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full sourcer quality table */}
      <Card>
        <CardHeader>
          <CardTitle>Sourcer Quality Overview</CardTitle>
          <CardDescription>
            {teamSummary.sourcerSummaries.length} sourcer(s) with samples this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SourcerQualityTable summaries={teamSummary.sourcerSummaries} />
        </CardContent>
      </Card>
    </div>
  );
}
