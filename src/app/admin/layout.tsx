import { DashboardLayoutComponent } from '@/components/layout/DashboardLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
