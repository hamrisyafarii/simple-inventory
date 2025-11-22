import {
  EditIcon,
  PlusSquare,
  Search,
  TrashIcon,
  Folder,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useState, type ReactElement, useMemo } from "react";
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

type SortValue = string | Date | undefined;

const CategoryPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryCreateDialog, setCategoryCreateDialog] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] =
    useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const categoryForm = useForm<CategoryDataSchema>({
    resolver: zodResolver(categoryDataSchema),
  });

  const editCategoryForm = useForm<CategoryDataSchema>({
    resolver: zodResolver(categoryDataSchema),
  });

  // =============== API CALL ===============
  const { data: user } = api.user.getUserData.useQuery();

  const { mutate: createCategory } = api.category.createCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getAllCategory.invalidate();
      toast.success("Successfully created new category!");

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

  const { data: categories, isLoading } =
    api.category.getAllCategory.useQuery();

  const { data: products } = api.product.getAllProduct.useQuery();

  const { mutate: deleteCategory } = api.category.deleteCategory.useMutation({
    onSuccess: async () => {
      await apiUtils.category.getAllCategory.invalidate();
      toast.success("Successfully deleted category!");
      setDeleteCategoryDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const categoryStats = useMemo(() => {
    if (!categories) return { total: 0, withProducts: 0, empty: 0 };

    const total = categories.length;
    const withProducts = categories.filter((cat) => {
      return products?.some((product) => product.categoryId === cat.id);
    }).length;
    const empty = total - withProducts;

    return { total, withProducts, empty };
  }, [categories, products]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    let filtered = [...categories];

    if (searchQuery) {
      filtered = filtered.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const aDate = new Date(aValue);
      const bDate = new Date(bValue);

      return sortOrder === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    });

    return filtered;
  }, [categories, searchQuery, sortBy, sortOrder]);

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

  const getProductCount = (categoryId: string) => {
    return (
      products?.filter((product) => product.categoryId === categoryId).length ??
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
            <DashboardTitle>Category Management</DashboardTitle>
            <DashboardDescription>
              Organize your products by creating and managing categories
            </DashboardDescription>
          </div>
          {user?.role === "ADMIN" || user?.role === "STAFF" ? (
            <Button
              onClick={() => setCategoryCreateDialog(true)}
              className="shadow-sm"
            >
              <PlusSquare className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          ) : null}
        </div>
        <Separator className="my-4" />
      </DashboardHeader>

      {/* =================== Stats Cards =================== */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
            <Folder className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.total}</div>
            <p className="text-muted-foreground text-xs">
              All categories in inventory
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Products</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {categoryStats.withProducts}
            </div>
            <p className="text-muted-foreground text-xs">
              Categories containing products
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empty Categories
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {categoryStats.empty}
            </div>
            <p className="text-muted-foreground text-xs">
              Categories without products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* =================== Search and Filters =================== */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Sort
          </CardTitle>
          <CardDescription>
            Find categories by name or sort them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search categories by name..."
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
              Date Created
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
          <CardTitle>Category Inventory</CardTitle>
          <CardDescription>
            Showing {filteredCategories?.length} of {categories?.length}{" "}
            categories
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
          ) : filteredCategories?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Folder className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">No categories found</h3>
              <p className="text-muted-foreground mt-2 mb-4 max-w-md">
                {searchQuery
                  ? "Try adjusting your search to find what you're looking for."
                  : "Get started by adding your first category."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setCategoryCreateDialog(true)}>
                  <PlusSquare className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Products</TableHead>
                  <TableHead className="font-semibold">Created At</TableHead>
                  {user?.role === "ADMIN" || user?.role === "STAFF" ? (
                    <TableHead className="text-center">Actions</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories?.map((cat) => {
                  const productCount = getProductCount(cat.id);
                  return (
                    <TableRow
                      key={cat.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Folder className="text-muted-foreground h-4 w-4" />
                          {cat.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={productCount > 0 ? "default" : "secondary"}
                        >
                          {productCount} products
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(cat.createdAt)}</TableCell>
                      {user?.role === "ADMIN" || user?.role === "STAFF" ? (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
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
                              <EditIcon className="text-primary h-4 w-4" />
                            </Button>
                            <Button
                              variant={"ghost"}
                              size={"sm"}
                              onClick={() => handleClickDeleteCategory(cat.id)}
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

      {/* =============== DIALOG CREATE CATEGORY =============== */}
      <Dialog
        open={categoryCreateDialog}
        onOpenChange={setCategoryCreateDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Enter the category name below to create a new category
            </DialogDescription>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category name below
            </DialogDescription>
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category from your inventory.
              {getProductCount(categoryToEdit ?? "") > 0 && (
                <span className="text-destructive font-medium">
                  {" "}
                  Note: {getProductCount(categoryToEdit ?? "")} products are
                  associated with this category.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleDeleteCategory}
            >
              Delete
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
