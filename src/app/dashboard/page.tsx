import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome to Sourcer OS</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Users</CardDescription>
            <CardTitle>—</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Active Teams</CardDescription>
            <CardTitle>—</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Open Requisitions</CardDescription>
            <CardTitle>—</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Active Assignments</CardDescription>
            <CardTitle>—</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Capacity Utilization</CardTitle>
            <CardDescription>Average load across teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600">
              Metrics will appear here once data is populated
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>Latest staffing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600">
              Assignments will appear here once data is populated
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
