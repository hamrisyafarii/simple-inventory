import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect, type ReactElement } from "react";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "~/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "~/pages/_app";
import LoadingPage from "~/pages/loading";

const DashboardPage: NextPageWithLayout = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // ========== useEffect ===========
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      void router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  if (!isSignedIn) return null;

  return (
    <>
      <DashboardHeader>
        <div className="flex">
          <div>
            <DashboardTitle>Dashboard</DashboardTitle>
            <DashboardDescription>
              Overview of your inventory system
            </DashboardDescription>
          </div>
        </div>
      </DashboardHeader>
      <div>Welcome to dashboard</div>
    </>
  );
};

DashboardPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;
