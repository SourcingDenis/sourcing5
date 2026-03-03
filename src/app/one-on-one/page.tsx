import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function OneOnOnePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">OneOnOne Engine</h1>
        <p className="mt-2 text-slate-600">Manage one-on-one meetings and feedback</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
          <CardDescription>Schedule and track one-on-ones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            Meeting data will appear here once configured
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
