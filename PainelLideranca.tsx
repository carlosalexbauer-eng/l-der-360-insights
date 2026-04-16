import { LeadershipPanel } from '@/components/dashboard/LeadershipPanel';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function PainelLideranca() {
  return (
    <DashboardLayout>
      {({ filtered }) => <LeadershipPanel leaders={filtered} />}
    </DashboardLayout>
  );
}
