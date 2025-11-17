import { EditIcon, PlusSquare, TrashIcon } from "lucide-react";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "~/components/layouts/DashboardLayout";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { NextPageWithLayout } from "~/pages/_app";
import { api } from "~/utils/api";

const TransactionPage: NextPageWithLayout = () => {
  //  =================== API CALLS ===================
  const { data: transactions } = api.transaction.getAllTransaction.useQuery();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <DashboardHeader>
          <DashboardTitle>Stock Transactions</DashboardTitle>
          <DashboardDescription>
            Track all inventory movements
          </DashboardDescription>
        </DashboardHeader>

        <Button>
          <PlusSquare /> Record Transaction
        </Button>
      </div>

      <Separator />

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions?.map((trans) => {
                return (
                  <TableRow key={trans.id}>
                    <TableCell>{trans.type}</TableCell>
                    <TableCell>
                      {trans.products.map((p) => p.name).join(", ")}
                    </TableCell>

                    <TableCell>
                      {trans.products.map((p) => p.sku).join(", ")}
                    </TableCell>
                    <TableCell>{trans.quantity}</TableCell>
                    <TableCell>
                      {trans.user.map((u) => u.email).join(", ")}
                    </TableCell>
                    <TableCell>t{trans.note?.substring(0, 45)}...</TableCell>
                    <TableCell className="flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button size={"sm"} variant={"ghost"}>
                          <EditIcon className="text-primary" />
                        </Button>
                        <Button variant={"ghost"} size={"icon-sm"}>
                          <TrashIcon className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

TransactionPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default TransactionPage;
