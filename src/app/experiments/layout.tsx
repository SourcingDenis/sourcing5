import { DashboardLayoutComponent } from '@/components/layout/DashboardLayout';

export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
