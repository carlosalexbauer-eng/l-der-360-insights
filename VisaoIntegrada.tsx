import { IntegratedTab } from '@/components/dashboard/IntegratedTab';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function VisaoIntegrada() {
  return (
    <DashboardLayout>
      {({ filtered }) => <IntegratedTab leaders={filtered} />}
    </DashboardLayout>
  );
}
