import { EditIcon, PlusSquare, Search, TrashIcon } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import type { NextPageWithLayout } from "~/pages/_app";
import {
  supplierDataSchema,
  type SupplierDataSchema,
} from "../forms/CreateSupplierSchema";
import { useState } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

const SupplierPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [createSupplierDialogOpen, setCreateSupplierDialogOpen] =
    useState(false);
  const [updateSupplierDialogOpen, setUpdateSupplierDialogOpen] =
    useState(false);
  const [deleteSupplierDialogOpen, setDeleteSupplierDialogOpen] =
    useState(false);
  const [supplierToId, setSupplierToId] = useState<string | null>(null);

  const createSupplierForm = useForm<SupplierDataSchema>({
    resolver: zodResolver(supplierDataSchema),
  });

  const updateSupplierForm = useForm<SupplierDataSchema>({
    resolver: zodResolver(supplierDataSchema),
  });

  // ==================== API CALL ====================
  const { mutate: createNewSupplier } = api.supplier.createSupplier.useMutation(
    {
      onSuccess: async () => {
        await apiUtils.supplier.getAllSupplier.invalidate();
        toast.success("Successfully create new supplier");

        setCreateSupplierDialogOpen(false);
      },
      onError: () => {
        toast.error("Something wrong, please try agin later");
      },
    },
  );

  const { data: suppliers } = api.supplier.getAllSupplier.useQuery();

  const { mutate: updateSupplier } = api.supplier.updateSupplier.useMutation({
    onSuccess: async () => {
      await apiUtils.supplier.getAllSupplier.invalidate();

      toast.success("Successfully update data supplier");
      setUpdateSupplierDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const { mutate: deleteSupplier } = api.supplier.deleteSupplier.useMutation({
    onSuccess: async () => {
      await apiUtils.supplier.getAllSupplier.invalidate();

      toast.success("Successfully delete supplier");
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <DashboardHeader>
          <DashboardTitle>Supplier</DashboardTitle>
          <DashboardDescription>
            Manage your supplier network
          </DashboardDescription>
        </DashboardHeader>
        <Button onClick={() => setCreateSupplierDialogOpen(true)}>
          <PlusSquare /> Supplier
        </Button>
      </div>

      <Separator />

      {/* =================== Search =================== */}
      <div className="relative my-4 w-full max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input placeholder="Search supplier..." className="pl-10" />
      </div>

      {/* =================== Contnet =================== */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-start">Create At</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No category found.
                </TableCell>
              </TableRow>
            ) : (
              suppliers?.map((supplier) => {
                return (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contact ?? "-"}</TableCell>
                    <TableCell>{supplier.address ?? "-"} </TableCell>
                    <TableCell>
                      {supplier.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex items-center justify-center">
                      <div className="flex gap-2">
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
                          <EditIcon className="text-primary" />
                        </Button>
                        <Button
                          variant={"ghost"}
                          size={"icon-sm"}
                          onClick={() => handleClickDeleteSupplier(supplier.id)}
                        >
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

      {/* =================== CREATE SUPPLIER =================== */}
      <Dialog
        open={createSupplierDialogOpen}
        onOpenChange={setCreateSupplierDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Enter the supplier details below
            </DialogDescription>
          </DialogHeader>
          <Form {...createSupplierForm}>
            <SupplierCreateForm onSubmit={handleCreateSupplier} />
          </Form>
        </DialogContent>
      </Dialog>

      {/* =================== Update SUPPLIER =================== */}
      <Dialog
        open={updateSupplierDialogOpen}
        onOpenChange={setUpdateSupplierDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Supplier</DialogTitle>
            <DialogDescription>
              Enter the supplier details below
            </DialogDescription>
          </DialogHeader>
          <Form {...updateSupplierForm}>
            <SupplierUpdateForm onSubmit={handleUpdateSupplier} />
          </Form>
        </DialogContent>
      </Dialog>

      {/* =================== DELETE ALERT SUPPLIER =================== */}
      <AlertDialog
        open={deleteSupplierDialogOpen}
        onOpenChange={setDeleteSupplierDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Aru you sure want delete data supplier
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancle</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSupplier}
              className="bg-destructive"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

SupplierPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default SupplierPage;
