import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function CapacityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Capacity Management</h1>
        <p className="mt-2 text-slate-600">Manage team capacity and allocations</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Capacity</CardDescription>
            <CardTitle>— hours</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Allocated</CardDescription>
            <CardTitle>— hours</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Available</CardDescription>
            <CardTitle>— hours</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Capacity Overview</CardTitle>
          <CardDescription>Utilization by team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            Capacity data will appear here once teams and assignments are created
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
