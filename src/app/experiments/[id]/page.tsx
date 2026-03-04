export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getExperimentWithStats } from '@/modules/experiments/service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ExperimentStatusBadge } from '@/components/experiments/ExperimentStatusBadge';
import { ExperimentDetailClient } from '@/components/experiments/ExperimentDetailClient';

interface Props {
  params: { id: string };
}

export default async function ExperimentDetailPage({ params }: Props) {
  const maybeExperiment = await getExperimentWithStats(params.id);
  if (!maybeExperiment) notFound();
  // notFound() throws, so this assertion is always safe
  const experiment = maybeExperiment!;

  const completedCount = experiment.variants.filter(
    v => !v.isControl && v.replyRateSignificance === 'meaningful'
  ).length;

  return (
    <div className="space-y-8">
      {/* Breadcrumb + header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/experiments" className="hover:text-slate-700">
            Experiment Hub
          </Link>
          <span>/</span>
          <span className="text-slate-800">{experiment.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{experiment.name}</h1>
              <ExperimentStatusBadge status={experiment.status} />
            </div>
          </div>
          <Link
            href="/quality"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            View Quality Scores →
          </Link>
        </div>
      </div>

      {/* Hypothesis callout */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">Hypothesis</p>
        <p className="text-sm text-blue-900">{experiment.hypothesis}</p>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Owner</CardDescription>
            <CardTitle className="text-base">{experiment.ownerName}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Start Date</CardDescription>
            <CardTitle className="text-base">{experiment.startDate}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>End Date</CardDescription>
            <CardTitle className="text-base">
              {experiment.endDate ?? 'Ongoing'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Meaningful Results</CardDescription>
            <CardTitle className={completedCount > 0 ? 'text-green-700' : 'text-base'}>
              {completedCount} variant{completedCount !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Variant comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Results</CardTitle>
          <CardDescription>
            The first variant added is the control arm. Lift and significance are calculated vs control.
            A result is &ldquo;Meaningful&rdquo; when ≥30 outreach sent and the absolute rate difference is ≥5 percentage points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExperimentDetailClient experiment={experiment} />
        </CardContent>
      </Card>
    </div>
  );
}
