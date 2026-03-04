import type { GeneratedAgenda, AgendaSection } from '@/lib/types';
import { cn } from '@/lib/utils/helpers';

interface AgendaViewProps {
  agenda: GeneratedAgenda;
}

const SECTION_ICONS: Record<AgendaSection['section'], string> = {
  wins:        '🏆',
  capacity:    '⚡',
  funnel:      '📊',
  blockers:    '🚧',
  development: '🌱',
};

function getBulletStyle(bullet: string): string {
  if (bullet.startsWith('[RED]'))     return 'text-red-700 font-medium';
  if (bullet.startsWith('[WARNING]')) return 'text-amber-700 font-medium';
  if (bullet.startsWith('[FLAG]'))    return 'text-orange-700 font-medium';
  if (bullet.startsWith('[STALLED]')) return 'text-orange-700 font-medium';
  if (bullet.startsWith('[OVERDUE]') || bullet.includes('[OVERDUE]')) return 'text-red-600';
  if (bullet.startsWith('  •'))      return 'text-slate-600 pl-4';
  return 'text-slate-700';
}

export function AgendaView({ agenda }: AgendaViewProps) {
  const generatedDate = new Date(agenda.generatedAt).toLocaleString();

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Generated at {generatedDate} · Live data from capacity, funnel & action items
      </p>

      {agenda.sections.map((section) => (
        <div
          key={section.section}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span>{SECTION_ICONS[section.section]}</span>
            {section.label}
          </h3>
          <ul className="space-y-1.5">
            {section.bullets.map((bullet, i) => (
              <li key={i} className={cn('text-sm', getBulletStyle(bullet))}>
                {bullet.startsWith('  •') ? bullet : `• ${bullet}`}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="grid grid-cols-4 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-center text-xs text-slate-600">
        <div>
          <div className="font-semibold text-slate-900">
            {(agenda.rawData.loadRatio * 100).toFixed(0)}%
          </div>
          <div>Load ratio</div>
        </div>
        <div>
          <div className={cn('font-semibold', agenda.rawData.funnelAlertCount > 0 ? 'text-red-600' : 'text-green-600')}>
            {agenda.rawData.funnelAlertCount}
          </div>
          <div>Funnel alerts</div>
        </div>
        <div>
          <div className={cn('font-semibold', agenda.rawData.stalledReqCount > 0 ? 'text-amber-600' : 'text-green-600')}>
            {agenda.rawData.stalledReqCount}
          </div>
          <div>Stalled reqs</div>
        </div>
        <div>
          <div className={cn('font-semibold', agenda.rawData.openActionItemCount > 0 ? 'text-amber-600' : 'text-green-600')}>
            {agenda.rawData.openActionItemCount}
          </div>
          <div>Open items</div>
        </div>
      </div>
    </div>
  );
}
