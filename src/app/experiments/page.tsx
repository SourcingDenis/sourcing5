export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAllExperimentsWithStats } from '@/modules/experiments/service';
import { usersRepository } from '@/lib/db/repositories/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ExperimentListClient } from '@/components/experiments/ExperimentListClient';

export default async function ExperimentsPage() {
  const [experiments, users] = await Promise.all([
    getAllExperimentsWithStats(),
    usersRepository.listUsers(),
  ]);

  const activeCount    = experiments.filter(e => e.status === 'active').length;
  const completedCount = experiments.filter(e => e.status === 'completed').length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Experiment Hub</h1>
          <p className="mt-2 text-slate-600">Run and analyze A/B tests for outreach strategies</p>
        </div>
        <Link
          href="/quality"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          View Quality Scores →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Experiments</CardDescription>
            <CardTitle>{experiments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-green-700">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Completed</CardDescription>
            <CardTitle>{completedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Experiments</CardTitle>
          <CardDescription>Click an experiment to view variants and compare results</CardDescription>
        </CardHeader>
        <CardContent>
          <ExperimentListClient
            experiments={experiments}
            ownerOptions={users.map(u => ({ id: u.id, name: u.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
