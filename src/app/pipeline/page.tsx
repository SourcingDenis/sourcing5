export const dynamic = 'force-dynamic';

import { getAllPipelineViews, getInterviewSummary } from '@/lib/data/pipeline';
import { interviewsRepository } from '@/lib/db/repositories/interviews';
import { settingsRepository } from '@/lib/db/repositories/settings';
import { AshbySyncButton } from '@/components/funnel/AshbySyncButton';
import { PassthroughTable } from '@/components/pipeline/PassthroughTable';
import { InterviewList } from '@/components/pipeline/InterviewList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default async function PipelinePage() {
  const [pipelineViews, interviewSummary, upcomingInterviews, recentInterviews, apiKeySetting] =
    await Promise.all([
      getAllPipelineViews(),
      getInterviewSummary(),
      interviewsRepository.listUpcoming(10),
      interviewsRepository.listRecent(14),
      settingsRepository.getByKey('ashby_api_key'),
    ]);

  const isAshbyConfigured = Boolean(apiKeySetting?.value?.trim());

  const totalCandidates = pipelineViews.reduce((sum, v) => sum + v.totalCandidates, 0);
  const avgConversion =
    pipelineViews.length > 0
      ? pipelineViews.reduce((sum, v) => sum + v.overallConversion, 0) / pipelineViews.length
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pipeline & Interviews</h1>
          <p className="mt-2 text-slate-600">
            Stage passthrough rates, interview tracking, and candidate sources from Ashby
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAshbyConfigured ? (
            <AshbySyncButton />
          ) : (
            <a
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100"
            >
              Configure Ashby →
            </a>
          )}
        </div>
      </div>

      {/* Ashby not configured banner */}
      {!isAshbyConfigured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Ashby not connected.</strong>{' '}
          <a href="/settings" className="underline hover:text-amber-900">
            Add your Ashby API key in Settings
          </a>{' '}
          to sync pipeline stages, interviews, and candidate sources.
        </div>
      )}

      {/* Top-level metric cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Active Pipelines</CardDescription>
            <CardTitle>{pipelineViews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Candidates</CardDescription>
            <CardTitle>{totalCandidates}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg. Overall Conversion</CardDescription>
            <CardTitle>{(avgConversion * 100).toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Upcoming Interviews</CardDescription>
            <CardTitle>{interviewSummary.upcomingCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Interview summary row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Completed Interviews</CardDescription>
            <CardTitle>{interviewSummary.totalCompleted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cancelled / No Show</CardDescription>
            <CardTitle className="text-slate-500">{interviewSummary.cancelledCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Completion Rate</CardDescription>
            <CardTitle>
              {interviewSummary.completionRate > 0
                ? `${(interviewSummary.completionRate * 100).toFixed(0)}%`
                : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Upcoming interviews */}
      {upcomingInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>Next {upcomingInterviews.length} scheduled interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <InterviewList interviews={upcomingInterviews} />
          </CardContent>
        </Card>
      )}

      {/* Per-req pipeline passthrough tables */}
      {pipelineViews.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Stages</CardTitle>
            <CardDescription>No pipeline data available yet</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {isAshbyConfigured
                ? 'Click "Sync Ashby" above to pull pipeline stage data from your ATS.'
                : 'Connect Ashby to see stage-by-stage passthrough rates.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Passthrough Rates by Req</h2>
          {pipelineViews.map((view) => (
            <Card key={view.reqId}>
              <CardHeader>
                <CardTitle>{view.reqTitle}</CardTitle>
                <CardDescription>
                  {view.stages.length} stages · {view.totalCandidates} total candidates ·{' '}
                  {(view.overallConversion * 100).toFixed(1)}% overall conversion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PassthroughTable view={view} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent interview activity */}
      {recentInterviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Interview Activity</CardTitle>
            <CardDescription>Completed, cancelled, or no-show in the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <InterviewList interviews={recentInterviews} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
