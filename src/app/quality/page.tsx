import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function QualityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quality Lab</h1>
        <p className="mt-2 text-slate-600">Monitor and improve hire quality metrics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quality Metrics</CardTitle>
          <CardDescription>Hire performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            Quality metrics will appear here once configured
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
