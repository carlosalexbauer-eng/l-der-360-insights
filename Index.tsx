import { SuccessionTab } from '@/components/dashboard/SuccessionTab';
import { DashboardLayout } from '@/components/DashboardLayout';

const Index = () => {
  return (
    <DashboardLayout>
      {({ filtered, allDbLeaders, filters }) => <SuccessionTab leaders={filtered} allDbLeaders={allDbLeaders} filters={filters} />}
    </DashboardLayout>
  );
};

export default Index;
