import { EditIcon, PlusSquare, Search, TrashIcon } from "lucide-react";
import { useState, type ReactElement } from "react";
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
import {
  categoryDataSchema,
  type CategoryDataSchema,
} from "../forms/category.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import CreateCategoryForm from "../components/CreateCategoryForm";
import { Form } from "~/components/ui/form";
import { api } from "~/utils/api";
import { toast } from "sonner";
import EditCategoryForm from "../components/EditCategoryForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";

const CategoryPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [categoryCreateDialog, setCategoryCreateDialog] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] =
    useState(false);

  const categoryForm = useForm<CategoryDataSchema>({
    resolver: zodResolver(categoryDataSchema),
  });

  const editCategoryForm = useForm<CategoryDataSchema>({
    resolver: zodResolver(categoryDataSchema),
  });

  // =============== API CALL ===============
  const { mutate: createCategory } = api.category.createCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getAllCategory.invalidate();
      toast.success("Successfully create new category !");

      categoryForm.reset();
      setCategoryCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const { mutate: updateCategory } = api.category.updateCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getAllCategory.invalidate();
      toast.success("Successfully updated category");
      setEditCategoryDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const { data: categories } = api.category.getAllCategory.useQuery();

  const { mutate: deleteCategory } = api.category.deleteCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getAllCategory.invalidate();
      toast.success("Successfully deleted category !");
      setDeleteCategoryDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  // =============== handling ===============
  const handleCreateCategory = (values: CategoryDataSchema) => {
    createCategory({
      name: values.name,
    });
  };

  const handleClickEditCategory = (category: { id: string; name: string }) => {
    setEditCategoryDialogOpen(true);
    setCategoryToEdit(category.id);

    editCategoryForm.reset({
      name: category.name,
    });
  };

  const handleSubmitEditCategory = (values: CategoryDataSchema) => {
    if (!categoryToEdit) return;

    updateCategory({
      categoryId: categoryToEdit,
      name: values.name,
    });
  };

  const handleClickDeleteCategory = (categoryId: string) => {
    setDeleteCategoryDialogOpen(true);
    setCategoryToEdit(categoryId);
  };

  const handleDeleteCategory = () => {
    if (!categoryToEdit) return;

    deleteCategory({
      categoryId: categoryToEdit,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <DashboardHeader>
          <DashboardTitle>Categories</DashboardTitle>
          <DashboardDescription>
            Organize products by category
          </DashboardDescription>
        </DashboardHeader>
        <div>
          <Button onClick={() => setCategoryCreateDialog(true)}>
            <PlusSquare /> Add Category
          </Button>
        </div>
      </div>

      <Separator />

      {/* =================== Search =================== */}
      <div className="relative my-4 w-full max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input placeholder="Search category..." className="pl-10" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="text-start">CreatedAt</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No category found.
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((cat) => {
                return (
                  <TableRow key={cat.id} className="hover:bg-muted/50">
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.createAt.toLocaleDateString()}</TableCell>
                    <TableCell className="flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button
                          size={"sm"}
                          variant={"ghost"}
                          onClick={() =>
                            handleClickEditCategory({
                              id: cat.id,
                              name: cat.name,
                            })
                          }
                        >
                          <EditIcon className="text-primary" />
                        </Button>
                        <Button
                          variant={"ghost"}
                          size={"icon-sm"}
                          onClick={() => handleClickDeleteCategory(cat.id)}
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

      {/* =============== DIALOG CREATE CATEGORY =============== */}
      <Dialog
        open={categoryCreateDialog}
        onOpenChange={setCategoryCreateDialog}
      >
        <DialogContent>
          <DialogHeader className="mb-4">
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Enter the category name below</DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <CreateCategoryForm onSubmit={handleCreateCategory} />
          </Form>
        </DialogContent>
      </Dialog>

      {/* ================ DIALOG EDIT CATEGORY ================ */}
      <Dialog
        open={editCategoryDialogOpen}
        onOpenChange={setEditCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Enter the category name below</DialogDescription>
          </DialogHeader>
          <Form {...editCategoryForm}>
            <EditCategoryForm onSubmit={handleSubmitEditCategory} />
          </Form>
        </DialogContent>
      </Dialog>

      {/* ================ DIALOG DELETE CATEGORY ================ */}
      <AlertDialog
        open={deleteCategoryDialogOpen}
        onOpenChange={setDeleteCategoryDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure wont delete this category?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleDeleteCategory}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

CategoryPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
export default CategoryPage;
