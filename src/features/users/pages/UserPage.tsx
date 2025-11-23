import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "~/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "~/pages/_app";

const UserPage: NextPageWithLayout = () => {
  return (
    <div className="space-y-4">
      <DashboardHeader>
        <DashboardTitle>Users</DashboardTitle>
        <DashboardDescription>Admin controll for users</DashboardDescription>
      </DashboardHeader>
      This users page with admin controll
    </div>
  );
};

UserPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default UserPage;
