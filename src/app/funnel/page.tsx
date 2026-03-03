import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function FunnelPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Funnel Radar</h1>
        <p className="mt-2 text-slate-600">Monitor recruitment funnel metrics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recruitment Funnel</CardTitle>
          <CardDescription>Pipeline overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            Funnel analytics will appear here once configured
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
