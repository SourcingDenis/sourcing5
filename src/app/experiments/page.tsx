import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ExperimentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Experiment Hub</h1>
        <p className="mt-2 text-slate-600">Run and analyze recruitment experiments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Experiments</CardTitle>
          <CardDescription>Track and measure A/B tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            Experiment data will appear here once configured
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
