import { supabase } from '@/lib/db/client';
import { getWeekStartDate } from '@/lib/utils/helpers';

export interface AgendaItem {
  topic: string;
  notes: string;
  priority: 'high' | 'medium' | 'low';
}

export interface GeneratedAgenda {
  weekOf: string;
  managerId: string;
  reportId: string;
  items: AgendaItem[];
}

export async function generateAgenda(
  managerId: string,
  reportId: string
): Promise<GeneratedAgenda> {
  const currentWeekStr = getWeekStartDate().toISOString().split('T')[0];

  const { data: assignments } = await supabase
    .from('assignments')
    .select('req_id, priority, status')
    .eq('user_id', reportId)
    .eq('status', 'active');

  const items: AgendaItem[] = [];

  if (assignments && assignments.length > 0) {
    const highPriority = assignments.filter((a: { priority: string }) => a.priority === 'critical' || a.priority === 'high');
    if (highPriority.length > 0) {
      items.push({
        topic: 'High-priority requisitions update',
        notes: `Review status of ${highPriority.length} high-priority active req(s).`,
        priority: 'high',
      });
    }

    items.push({
      topic: 'Overall workload check-in',
      notes: `Currently ${assignments.length} active assignment(s). Discuss capacity and blockers.`,
      priority: 'medium',
    });
  } else {
    items.push({
      topic: 'Pipeline review',
      notes: 'No active assignments. Discuss upcoming requisitions or pipeline health.',
      priority: 'medium',
    });
  }

  items.push({
    topic: 'Career development & feedback',
    notes: 'Discuss growth goals, recent wins, and areas for improvement.',
    priority: 'low',
  });

  return {
    weekOf: currentWeekStr,
    managerId,
    reportId,
    items,
  };
}
