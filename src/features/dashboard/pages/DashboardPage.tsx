import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect, useMemo, type ReactElement } from "react";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "~/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "~/pages/_app";
import LoadingPage from "~/pages/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  ArrowLeftRight,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { api } from "~/utils/api";
import { Separator } from "~/components/ui/separator";
import KPICrad from "../components/KPICard";
import LowStockAlerts from "../components/LowStockAlerts";
import LoadingState from "../components/LoadingState";

const DashboardPage: NextPageWithLayout = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      void router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // =================== API CALLS ===================
  const { data: products, isLoading: isLoadingProducts } =
    api.product.getAllProduct.useQuery();
  const { data: categories, isLoading: isLoadingCategories } =
    api.category.getAllCategory.useQuery();
  const { data: suppliers, isLoading: isLoadingSuppliers } =
    api.supplier.getAllSupplier.useQuery();
  const { data: transactions, isLoading: isLoadingTransactions } =
    api.transaction.getAllTransaction.useQuery();

  const isLoading =
    isLoadingProducts ||
    isLoadingCategories ||
    isLoadingSuppliers ||
    isLoadingTransactions;

  const stats = useMemo(() => {
    if (!products || !categories || !suppliers || !transactions) {
      return {
        totalProducts: 0,
        lowStockProducts: 0,
        totalCategories: 0,
        totalSuppliers: 0,
        totalTransactions: 0,
        stockInTransactions: 0,
        stockOutTransactions: 0,
      };
    }

    const totalProducts = products.length;
    const lowStockProducts = products.filter(
      (p) => p.quantity > 0 && p.quantity <= 10,
    ).length;
    const totalCategories = categories.length;
    const totalSuppliers = suppliers.length;
    const totalTransactions = transactions.length;
    const stockInTransactions = transactions.filter(
      (t) => t.type === "IN",
    ).length;
    const stockOutTransactions = transactions.filter(
      (t) => t.type === "OUT",
    ).length;

    return {
      totalProducts,
      lowStockProducts,
      totalCategories,
      totalSuppliers,
      totalTransactions,
      stockInTransactions,
      stockOutTransactions,
    };
  }, [products, categories, suppliers, transactions]);

  const lowStockItems = useMemo(() => {
    if (!products) return [];
    return products
      .filter((p) => p.quantity > 0 && p.quantity <= 10)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);
  }, [products]);

  const recentTransactions = useMemo(() => {
    if (!transactions) return [];
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [transactions]);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  if (!isSignedIn) return null;

  return (
    <div className="space-y-6">
      {/* =================== Header =================== */}
      <DashboardHeader>
        <div>
          <DashboardTitle>Dashboard</DashboardTitle>
          <DashboardDescription>
            Overview of your inventory system and key metrics
          </DashboardDescription>
        </div>
      </DashboardHeader>

      {isLoading ? (
        // =================== Loading State ===================
        <LoadingState />
      ) : (
        // =================== Content ===================
        <>
          {/* =================== KPI Cards =================== */}
          <KPICrad
            lowStockProducts={stats.lowStockProducts}
            totalCategories={stats.totalCategories}
            totalProducts={stats.totalProducts}
            totalSuppliers={stats.totalSuppliers}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* =================== Low Stock Alerts =================== */}
            <LowStockAlerts lowStockItemsprops={lowStockItems} />

            {/* =================== Recent Transactions =================== */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  The latest stock movements in your inventory.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No transactions recorded yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((trans) => (
                        <TableRow key={trans.id}>
                          <TableCell>
                            <Badge
                              variant={
                                trans.type === "IN" ? "default" : "secondary"
                              }
                              className="gap-1"
                            >
                              {trans.type === "IN" ? (
                                <ArrowDownCircle className="h-3 w-3" />
                              ) : (
                                <ArrowUpCircle className="h-3 w-3" />
                              )}
                              {trans.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium capitalize">
                            {trans.products[0]?.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {trans.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <Separator className="my-4" />
                <Button asChild variant="outline" className="w-full">
                  <Link href="/transaction">
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    View All Transactions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

DashboardPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;
