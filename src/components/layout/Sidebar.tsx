'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/helpers';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/capacity', label: 'Capacity', icon: '⚙️' },
  { href: '/capacity/weekly', label: 'Weekly View', icon: '📅' },
  { href: '/funnel', label: 'Funnel', icon: '🔍' },
  { href: '/one-on-one', label: 'OneOnOne', icon: '👥' },
  { href: '/quality', label: 'Quality', icon: '✓' },
  { href: '/experiments', label: 'Experiments', icon: '🧪' },
  { href: '/insights', label: 'Insights', icon: '💡' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white">
      <div className="p-6">
        <h1 className="text-lg font-bold text-slate-900">Sourcer OS</h1>
      </div>
      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === '/capacity'
              ? pathname === '/capacity' || pathname === '/capacity/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
