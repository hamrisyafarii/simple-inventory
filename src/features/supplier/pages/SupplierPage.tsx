import {
  EditIcon,
  PlusSquare,
  Search,
  TrashIcon,
  Building,
  Phone,
  MapPin,
} from "lucide-react";
import { useForm } from "react-hook-form";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "~/components/layouts/DashboardLayout";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import type { NextPageWithLayout } from "~/pages/_app";
import {
  supplierDataSchema,
  type SupplierDataSchema,
} from "../forms/CreateSupplierSchema";
import { useState, useMemo } from "react";
import SupplierCreateForm from "../components/SupplierCreateForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import SupplierUpdateForm from "../components/SupplierUpdateForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import StatsCardSupplier from "../components/StatsCardSupplier";
import CreateSupplierDialog from "../components/CreateSupplierDialog";
import UpdateSupplierDialog from "../components/UpdateSupplierDialog";
import DeleteSupplierAlertDialog from "../components/DeleteSupplierAlertDialog";

type SortValue = string | Date | undefined;

const SupplierPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [createSupplierDialogOpen, setCreateSupplierDialogOpen] =
    useState(false);
  const [updateSupplierDialogOpen, setUpdateSupplierDialogOpen] =
    useState(false);
  const [deleteSupplierDialogOpen, setDeleteSupplierDialogOpen] =
    useState(false);
  const [supplierToId, setSupplierToId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const createSupplierForm = useForm<SupplierDataSchema>({
    resolver: zodResolver(supplierDataSchema),
  });

  const updateSupplierForm = useForm<SupplierDataSchema>({
    resolver: zodResolver(supplierDataSchema),
  });

  // ==================== API CALLS ====================
  const { data: user } = api.user.getUserData.useQuery();

  const { mutate: createNewSupplier } = api.supplier.createSupplier.useMutation(
    {
      onSuccess: async () => {
        await apiUtils.supplier.getAllSupplier.invalidate();
        toast.success("Successfully created new supplier");

        createSupplierForm.reset();
        setCreateSupplierDialogOpen(false);
      },
      onError: (error) => {
        toast.error(
          error.shape?.message ??
            "Something went wrong, please try again later",
        );
      },
    },
  );

  const { data: suppliers, isLoading } = api.supplier.getAllSupplier.useQuery();

  const { data: products } = api.product.getAllProduct.useQuery();

  const { mutate: updateSupplier } = api.supplier.updateSupplier.useMutation({
    onSuccess: async () => {
      await apiUtils.supplier.getAllSupplier.invalidate();

      toast.success("Successfully updated supplier data");
      setUpdateSupplierDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const { mutate: deleteSupplier } = api.supplier.deleteSupplier.useMutation({
    onSuccess: async () => {
      await apiUtils.supplier.getAllSupplier.invalidate();

      toast.success("Successfully deleted supplier");
      setDeleteSupplierDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const supplierStats = useMemo(() => {
    if (!suppliers) return { total: 0, withProducts: 0, withoutProducts: 0 };

    const total = suppliers.length;
    const withProducts = suppliers.filter((supplier) => {
      return products?.some((product) => product.supplierId === supplier.id);
    }).length;
    const withoutProducts = total - withProducts;

    return { total, withProducts, withoutProducts };
  }, [suppliers, products]);

  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];

    let filtered = [...suppliers];

    if (searchQuery) {
      filtered = filtered.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ??
          supplier.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          supplier.address?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      let aValue: SortValue;
      let bValue: SortValue;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "date":
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (!aValue) return 1;
      if (!bValue) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(aValue)
          : bValue.localeCompare(bValue);
      }

      const aDate = new Date(aValue);
      const bDate = new Date(bValue);

      return sortOrder === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    });

    return filtered;
  }, [suppliers, searchQuery, sortBy, sortOrder]);

  // ==================== Handling ====================
  const handleCreateSupplier = (values: SupplierDataSchema) => {
    createNewSupplier({
      name: values.name,
      address: values.address,
      contact: values.contact,
    });
  };

  const handleClickUpdateSupplier = (supplier: {
    id: string;
    data: SupplierDataSchema;
  }) => {
    setUpdateSupplierDialogOpen(true);
    setSupplierToId(supplier.id);

    updateSupplierForm.reset({
      name: supplier.data.name,
      address: supplier.data.address,
      contact: supplier.data.contact,
    });
  };

  const handleUpdateSupplier = (values: SupplierDataSchema) => {
    if (!supplierToId) return;

    updateSupplier({
      supplierId: supplierToId,
      name: values.name,
      address: values.address,
      contact: values.contact,
    });
  };

  const handleClickDeleteSupplier = (supplierId: string) => {
    setDeleteSupplierDialogOpen(true);
    setSupplierToId(supplierId);
  };

  const handleDeleteSupplier = () => {
    if (!supplierToId) return;

    deleteSupplier({
      supplierId: supplierToId,
    });
  };

  const getProductCount = (supplierId: string) => {
    return (
      products?.filter((product) => product.supplierId === supplierId).length ??
      0
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* =================== Header =================== */}
      <DashboardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <DashboardTitle>Supplier Management</DashboardTitle>
            <DashboardDescription>
              Manage your supplier network and contact information
            </DashboardDescription>
          </div>
          {user?.role === "ADMIN" || user?.role === "STAFF" ? (
            <Button
              onClick={() => setCreateSupplierDialogOpen(true)}
              className="shadow-sm"
            >
              <PlusSquare className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          ) : null}
        </div>
        <Separator className="my-4" />
      </DashboardHeader>

      {/* =================== Stats Cards =================== */}
      <StatsCardSupplier
        total={supplierStats.total}
        withProducts={supplierStats.withProducts}
        withoutProducts={supplierStats.withoutProducts}
      />

      {/* =================== Search and Filters =================== */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Sort
          </CardTitle>
          <CardDescription>
            Find suppliers by name, contact, or address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search suppliers by name, contact, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Sort by:</span>
            <Button
              variant={sortBy === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("name")}
            >
              Name
            </Button>
            <Button
              variant={sortBy === "date" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("date")}
            >
              Date Added
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* =================== Content =================== */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription>
            Showing {filteredSuppliers?.length} of {suppliers?.length} suppliers
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
          ) : filteredSuppliers?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">No suppliers found</h3>
              <p className="text-muted-foreground mt-2 mb-4 max-w-md">
                {searchQuery
                  ? "Try adjusting your search to find what you're looking for."
                  : "Get started by adding your first supplier."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setCreateSupplierDialogOpen(true)}>
                  <PlusSquare className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Address</TableHead>
                  <TableHead className="font-semibold">Products</TableHead>
                  <TableHead className="font-semibold">Added On</TableHead>
                  {user?.role === "ADMIN" || user?.role === "STAFF" ? (
                    <TableHead className="text-center">Actions</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers?.map((supplier) => {
                  const productCount = getProductCount(supplier.id);
                  return (
                    <TableRow
                      key={supplier.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 capitalize">
                          <Building className="text-muted-foreground h-4 w-4" />
                          {supplier.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplier.contact ? (
                          <div className="flex items-center gap-1">
                            <Phone className="text-muted-foreground h-3 w-3" />
                            {supplier.contact}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {supplier.address ? (
                          <div className="flex items-start gap-1 capitalize">
                            <MapPin className="text-muted-foreground mt-0.5 h-3 w-3" />
                            <span className="line-clamp-2">
                              {supplier.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={productCount > 0 ? "default" : "secondary"}
                        >
                          {productCount} products
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(supplier.createdAt)}</TableCell>
                      {user?.role === "ADMIN" || user?.role === "STAFF" ? (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size={"sm"}
                              variant={"ghost"}
                              onClick={() =>
                                handleClickUpdateSupplier({
                                  id: supplier.id,
                                  data: {
                                    name: supplier.name,
                                    address: supplier.address ?? "",
                                    contact: supplier.contact ?? "",
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
                                handleClickDeleteSupplier(supplier.id)
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

      {/* =================== CREATE SUPPLIER =================== */}
      <CreateSupplierDialog
        createSupplierDialogOpen={createSupplierDialogOpen}
        setCreateSupplierDialogOpen={setCreateSupplierDialogOpen}
      >
        <Form {...createSupplierForm}>
          <SupplierCreateForm onSubmit={handleCreateSupplier} />
        </Form>
      </CreateSupplierDialog>

      {/* =================== UPDATE SUPPLIER =================== */}
      <UpdateSupplierDialog
        updateSupplierDialogOpen={updateSupplierDialogOpen}
        setUpdateSupplierDialogOpen={setUpdateSupplierDialogOpen}
      >
        <Form {...updateSupplierForm}>
          <SupplierUpdateForm onSubmit={handleUpdateSupplier} />
        </Form>
      </UpdateSupplierDialog>

      {/* =================== DELETE ALERT SUPPLIER =================== */}
      <DeleteSupplierAlertDialog
        deleteSupplierDialogOpen={deleteSupplierDialogOpen}
        setDeleteSupplierDialogOpen={setDeleteSupplierDialogOpen}
        handleDeleteSupplier={handleDeleteSupplier}
        getProductCount={getProductCount}
        supplierToId={supplierToId}
      />
    </div>
  );
};

SupplierPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default SupplierPage;
