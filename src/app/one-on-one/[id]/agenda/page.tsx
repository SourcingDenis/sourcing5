export const dynamic = 'force-dynamic';

import { oneOnOnesRepository } from '@/lib/db/repositories/oneOnOnes';
import { actionItemsRepository } from '@/lib/db/repositories/actionItems';
import { usersRepository } from '@/lib/db/repositories/users';
import { generateAgenda } from '@/lib/data/oneOnOne';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AgendaView } from '@/components/one-on-one/AgendaView';
import { ActionItemList } from '@/components/one-on-one/ActionItemList';
import { AddActionItemButton } from '@/components/one-on-one/AddActionItemButton';
import { CompleteOneOnOneButton } from '@/components/one-on-one/CompleteOneOnOneButton';
import { formatDate } from '@/lib/utils/formatting';

interface PageProps {
  params: { id: string };
}

export default async function AgendaPage({ params }: PageProps) {
  const one = await oneOnOnesRepository.getById(params.id);

  if (!one) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">1:1 Not Found</h1>
        <p className="text-slate-600">This 1:1 session does not exist or has been deleted.</p>
      </div>
    );
  }

  // Parallel fetch agenda + action items + user names
  const [agenda, actionItems, allUsers] = await Promise.all([
    generateAgenda(one.managerId, one.reportId),
    actionItemsRepository.listByOneOnOne(one.id),
    usersRepository.listUsers(),
  ]);

  const userNameMap: Record<string, string> = {};
  allUsers.forEach((u) => { userNameMap[u.id] = u.name; });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <a
          href="/one-on-one"
          className="mb-2 inline-block text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to 1:1s
        </a>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              1:1 with {agenda.reportName}
            </h1>
            <p className="mt-1 text-slate-600">
              Scheduled: {formatDate(one.scheduledAt)}
              {one.completedAt && (
                <span className="ml-3 text-green-600">
                  · Completed {formatDate(one.completedAt)}
                </span>
              )}
            </p>
          </div>
          <CompleteOneOnOneButton
            oneOnOneId={one.id}
            isCompleted={one.completedAt !== null}
          />
        </div>
      </div>

      {/* Summary (if set) */}
      {one.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{one.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Auto-generated agenda */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Agenda</CardTitle>
          <CardDescription>
            Auto-generated from live capacity, funnel health, and open action items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgendaView agenda={agenda} />
        </CardContent>
      </Card>

      {/* Action items for this 1:1 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>
              {actionItems.filter((i) => i.status === 'open').length} open ·{' '}
              {actionItems.filter((i) => i.status === 'done').length} done
            </CardDescription>
          </div>
          <AddActionItemButton ownerId={one.reportId} oneOnOneId={one.id} />
        </CardHeader>
        <CardContent>
          <ActionItemList items={actionItems} ownerNames={userNameMap} />
        </CardContent>
      </Card>
    </div>
  );
}
