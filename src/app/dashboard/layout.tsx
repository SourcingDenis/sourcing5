import { DashboardLayoutComponent } from '@/components/layout/DashboardLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
