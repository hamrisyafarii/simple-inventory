import { EditIcon, PlusSquare, TrashIcon } from "lucide-react";
import { useState } from "react";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "~/components/layouts/DashboardLayout";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Form } from "~/components/ui/form";
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
import CreateTransactionForm from "../components/CreateTransactionForm";
import { useForm } from "react-hook-form";
import {
  transactionDataSchema,
  type TransactionDataSchema,
} from "../forms/transaction.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const TransactionPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [createTransactionDialogOpen, setCreateTransactionDialogOpen] =
    useState(false);

  const createTransactionForm = useForm<TransactionDataSchema>({
    resolver: zodResolver(transactionDataSchema),
  });

  //  =================== API CALLS ===================
  const { data: transactions } = api.transaction.getAllTransaction.useQuery();

  const { mutate: createTransactionMutation } =
    api.transaction.createTransaction.useMutation({
      onSuccess: async () => {
        await apiUtils.transaction.getAllTransaction.invalidate();

        setCreateTransactionDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.shape?.message);
        console.error(error);
      },
    });

  const handleCreateTransaction = (values: TransactionDataSchema) => {
    createTransactionMutation(values);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <DashboardHeader>
          <DashboardTitle>Stock Transactions</DashboardTitle>
          <DashboardDescription>
            Track all inventory movements
          </DashboardDescription>
        </DashboardHeader>

        <Button onClick={() => setCreateTransactionDialogOpen(true)}>
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
                    <TableCell>{trans.note?.substring(0, 45)}...</TableCell>
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

      {/* ================== CREATE DIALOG TRANSACTION ================== */}
      <Dialog
        open={createTransactionDialogOpen}
        onOpenChange={setCreateTransactionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Transaction</DialogTitle>
            <DialogDescription>
              Add or remove stock from inventory
            </DialogDescription>
            <Form {...createTransactionForm}>
              <CreateTransactionForm onSubmit={handleCreateTransaction} />
            </Form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

TransactionPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default TransactionPage;
