import {
  EditIcon,
  PlusSquare,
  TrashIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Package,
} from "lucide-react";
import { useState, useMemo } from "react";
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
import UpdateTransactionForm from "../components/UpdateTransactionForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import StatsCardTransaction from "../components/StatsCardTransaction";

type SortableValue = string | number;

const TransactionPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [createTransactionDialogOpen, setCreateTransactionDialogOpen] =
    useState(false);
  const [updateTransactionDialogOpen, setUpdateTransactionDialogOpen] =
    useState(false);
  const [deleteTransactionDialogOpen, setDeleteTransactionDialogOpen] =
    useState(false);
  const [getTransactionId, setGetTransactionId] = useState<string | null>(null);
  const [transactionTypeFilter, setTransactionTypeFilter] =
    useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const createTransactionForm = useForm<TransactionDataSchema>({
    resolver: zodResolver(transactionDataSchema),
  });

  const updateTransactionForm = useForm<TransactionDataSchema>({
    resolver: zodResolver(transactionDataSchema),
  });

  //  =================== API CALLS ===================

  const { data: transactions, isLoading } =
    api.transaction.getAllTransaction.useQuery();

  const { data: user } = api.user.getUserData.useQuery();

  const { mutate: createTransactionMutation } =
    api.transaction.createTransaction.useMutation({
      onSuccess: async () => {
        await apiUtils.transaction.getAllTransaction.invalidate();
        toast.success("Successfully recorded transaction");
        createTransactionForm.reset();
        setCreateTransactionDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.shape?.message ?? "Failed to record transaction");
      },
    });

  const { mutate: updateTransactionMutation } =
    api.transaction.updateTransaction.useMutation({
      onSuccess: async () => {
        await apiUtils.transaction.getAllTransaction.invalidate();
        setUpdateTransactionDialogOpen(false);
        toast.success("Successfully updated transaction");
      },
      onError: (error) => {
        toast.error(error.shape?.message ?? "Failed to update transaction");
      },
    });

  const { mutate: deleteTransaction } =
    api.transaction.deleteTransaction.useMutation({
      onSuccess: async () => {
        await apiUtils.transaction.getAllTransaction.invalidate();
        setDeleteTransactionDialogOpen(false);
        toast.success("Successfully deleted transaction");
      },
      onError: (error) => {
        toast.error(error.shape?.message ?? "Failed to delete transaction");
      },
    });

  // Calculate transaction statistics
  const transactionStats = useMemo(() => {
    if (!transactions) return { total: 0, inStock: 0, outStock: 0 };

    const total = transactions.length;
    const inStock = transactions.filter((t) => t.type === "IN").length;
    const outStock = transactions.filter((t) => t.type === "OUT").length;

    return { total, inStock, outStock };
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    let filtered = [...transactions];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((transaction) => {
        const productNames = transaction.products
          .map((p) => p.name)
          .join(" ")
          .toLowerCase();
        const productSkus = transaction.products
          .map((p) => p.sku)
          .join(" ")
          .toLowerCase();
        const userEmails = transaction.user
          .map((u) => u.email)
          .join(" ")
          .toLowerCase();
        const note = (transaction.note ?? "").toLowerCase();

        return (
          productNames.includes(searchQuery.toLowerCase()) ||
          productSkus.includes(searchQuery.toLowerCase()) ||
          userEmails.includes(searchQuery.toLowerCase()) ||
          note.includes(searchQuery.toLowerCase()) ||
          transaction.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Filter by transaction type
    if (transactionTypeFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.type === transactionTypeFilter,
      );
    }

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue: SortableValue;
      let bValue: SortableValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "quantity":
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      // SORT logic
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [transactions, searchQuery, transactionTypeFilter, sortBy, sortOrder]);

  const handleCreateTransaction = (values: TransactionDataSchema) => {
    createTransactionMutation(values);
  };

  const handleClickUpdateTransaction = (transaction: {
    id: string;
    data: TransactionDataSchema;
  }) => {
    setUpdateTransactionDialogOpen(true);
    setGetTransactionId(transaction.id);

    updateTransactionForm.reset({
      productId: transaction.data.productId,
      note: transaction.data.note,
      quantity: transaction.data.quantity,
      typeTransaction: transaction.data.typeTransaction,
    });
  };

  const handleUpdateTransaction = (values: TransactionDataSchema) => {
    if (!getTransactionId) return;

    updateTransactionMutation({
      transactionId: getTransactionId,
      productId: values.productId,
      quantity: values.quantity,
      typeTransaction: values.typeTransaction,
      note: values.note,
    });
  };

  const handleClickDeleteTransaction = (transactionId: string) => {
    setDeleteTransactionDialogOpen(true);
    setGetTransactionId(transactionId);
  };

  const handleDeleteTransaction = () => {
    if (!getTransactionId) return;

    deleteTransaction({
      transactionId: getTransactionId,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getTransactionTypeBadge = (type: string) => {
    if (type === "IN") {
      return (
        <Badge
          variant="default"
          className="gap-1 bg-green-500 hover:bg-green-600"
        >
          <ArrowDownCircle className="h-3 w-3" />
          Stock In
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-red-200 bg-red-50 text-red-600"
        >
          <ArrowUpCircle className="h-3 w-3" />
          Stock Out
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* =================== Header =================== */}
      <DashboardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <DashboardTitle>Stock Transactions</DashboardTitle>
            <DashboardDescription>
              Track all inventory movements and stock changes
            </DashboardDescription>
          </div>
          {user?.role === "ADMIN" || user?.role === "STAFF" ? (
            <Button
              onClick={() => setCreateTransactionDialogOpen(true)}
              className="shadow-sm"
            >
              <PlusSquare className="mr-2 h-4 w-4" />
              Record Transaction
            </Button>
          ) : null}
        </div>
        <Separator className="my-4" />
      </DashboardHeader>

      {/* =================== Stats Cards =================== */}
      <StatsCardTransaction
        inStock={transactionStats.inStock}
        outStock={transactionStats.outStock}
        total={transactionStats.total}
      />

      {/* =================== Search and Filters =================== */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <CardDescription>
            Find transactions by product, user, or notes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search transactions by product, user, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              <Button
                variant={
                  transactionTypeFilter === "all" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setTransactionTypeFilter("all")}
              >
                All Types
              </Button>
              <Button
                variant={transactionTypeFilter === "IN" ? "default" : "outline"}
                size="sm"
                onClick={() => setTransactionTypeFilter("IN")}
              >
                Stock In
              </Button>
              <Button
                variant={
                  transactionTypeFilter === "OUT" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setTransactionTypeFilter("OUT")}
              >
                Stock Out
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Sort by:</span>
              <Button
                variant={sortBy === "date" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("date")}
              >
                Date
              </Button>
              <Button
                variant={sortBy === "type" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("type")}
              >
                Type
              </Button>
              <Button
                variant={sortBy === "quantity" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("quantity")}
              >
                Quantity
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? "A-Z" : "Z-A"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =================== Content =================== */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing {filteredTransactions?.length} of {transactions?.length}{" "}
            transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredTransactions?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">No transactions found</h3>
              <p className="text-muted-foreground mt-2 mb-4 max-w-md">
                {searchQuery || transactionTypeFilter !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by recording your first stock transaction."}
              </p>
              {!searchQuery && transactionTypeFilter === "all" && (
                <Button onClick={() => setCreateTransactionDialogOpen(true)}>
                  <PlusSquare className="mr-2 h-4 w-4" />
                  Record Transaction
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">SKU</TableHead>
                  <TableHead className="font-semibold">Quantity</TableHead>
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Note</TableHead>
                  {user?.role === "ADMIN" || user?.role === "STAFF" ? (
                    <TableHead className="text-center">Actions</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions?.map((trans) => {
                  return (
                    <TableRow
                      key={trans.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        {getTransactionTypeBadge(trans.type)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {trans.products.map((p) => p.name).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted rounded px-2 py-1 text-xs">
                          {trans.products.map((p) => p.sku).join(", ")}
                        </code>
                      </TableCell>
                      <TableCell className="font-mono">
                        {trans.quantity}
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground text-sm">
                          {trans.user.map((u) => u.email).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(trans.createdAt)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {trans.note ?? "-"}
                      </TableCell>
                      {user?.role === "ADMIN" || user?.role === "STAFF" ? (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size={"sm"}
                              variant={"ghost"}
                              onClick={() =>
                                handleClickUpdateTransaction({
                                  id: trans.id,
                                  data: {
                                    productId: trans.products[0]!.id,
                                    quantity: trans.quantity,
                                    typeTransaction: trans.type,
                                    note: trans.note ?? "",
                                  },
                                })
                              }
                            >
                              <EditIcon className="text-primary h-4 w-4" />
                            </Button>
                            <Button
                              variant={"ghost"}
                              size={"sm"}
                              onClick={() =>
                                handleClickDeleteTransaction(trans.id)
                              }
                            >
                              <TrashIcon className="text-destructive h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ================== CREATE DIALOG TRANSACTION ================== */}
      <Dialog
        open={createTransactionDialogOpen}
        onOpenChange={setCreateTransactionDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Stock Transaction</DialogTitle>
            <DialogDescription>
              Add or remove stock from inventory
            </DialogDescription>
          </DialogHeader>
          <Form {...createTransactionForm}>
            <CreateTransactionForm onSubmit={handleCreateTransaction} />
          </Form>
        </DialogContent>
      </Dialog>

      {/* ================== UPDATE DIALOG TRANSACTION ================== */}
      <Dialog
        open={updateTransactionDialogOpen}
        onOpenChange={setUpdateTransactionDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Stock Transaction</DialogTitle>
            <DialogDescription>
              Update the transaction details below
            </DialogDescription>
          </DialogHeader>
          <Form {...updateTransactionForm}>
            <UpdateTransactionForm onSubmit={handleUpdateTransaction} />
          </Form>
        </DialogContent>
      </Dialog>

      {/* ================== DELETE ALERT TRANSACTION ================== */}
      <AlertDialog
        open={deleteTransactionDialogOpen}
        onOpenChange={setDeleteTransactionDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              transaction record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

TransactionPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default TransactionPage;
