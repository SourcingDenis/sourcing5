import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Executive Insights</h1>
        <p className="mt-2 text-slate-600">Intelligent analysis and recommendations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>AI-generated insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            AI insights will appear here once data is available
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
