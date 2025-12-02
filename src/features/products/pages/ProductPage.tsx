import type { ReactElement } from "react";
import { useState, useMemo } from "react";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "~/components/layouts/DashboardLayout";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { NextPageWithLayout } from "~/pages/_app";
import {
  Search,
  Plus,
  EditIcon,
  TrashIcon,
  Filter,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toRupiah } from "~/utils/toRupiah";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/utils/api";
import ProductCreateForm from "../components/ProductCreateForm";
import { useForm } from "react-hook-form";
import {
  productDataSchema,
  type ProductDataSchema,
  type UpdateDataProduct,
} from "../forms/product.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "~/components/ui/form";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import ProductEditForm from "../components/ProductEditForm";
import { Skeleton } from "~/components/ui/skeleton";
import StatsCardProducts from "../components/StatsCardProducts";

type SortableValue = string | number | undefined;

const ProductPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // ========== useForm ==========
  const createProductForm = useForm<ProductDataSchema>({
    resolver: zodResolver(productDataSchema),
  });

  const updateProductForm = useForm<ProductDataSchema>({
    resolver: zodResolver(productDataSchema),
  });

  // =================== API CALLS ===================
  const { mutate: createProduct } = api.product.createProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getAllProduct.invalidate();
      toast.success("Success create new Product");

      createProductForm.reset();

      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const { mutate: updateProduct } = api.product.updateProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getAllProduct.invalidate();

      toast.success("Successfully update data product");
      setEditProductDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const { data: products, isLoading } = api.product.getAllProduct.useQuery();

  const { data: categories } = api.category.getAllCategory.useQuery();

  const { data: suppliers } = api.supplier.getAllSupplier.useQuery();

  const { mutate: deleteProduct } = api.product.deleteProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getAllProduct.invalidate();

      toast.success("Successfully deleted product !");
      setDeleteProductDialogOpen(false);
    },

    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const { data: user } = api.user.getUserData.useQuery();

  console.log("Data user", user);

  // =================== Filtering and Sorting Logic ===================
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category?.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ??
          product.supplier?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.categoryId === categoryFilter,
      );
    }

    // Filter by supplier
    if (supplierFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.supplierId === supplierFilter,
      );
    }

    // Filter by stock status
    if (stockStatusFilter !== "all") {
      filtered = filtered.filter((product) => {
        if (stockStatusFilter === "in-stock") return product.quantity > 10;
        if (stockStatusFilter === "low-stock")
          return product.quantity > 0 && product.quantity <= 10;
        if (stockStatusFilter === "out-of-stock") return product.quantity === 0;
        return true;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      let aValue: SortableValue;
      let bValue: SortableValue;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "quantity":
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case "category":
          aValue = a.category?.name;
          bValue = b.category?.name;
          break;
        case "supplier":
          aValue = a.supplier?.name;
          bValue = b.supplier?.name;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (aValue == null) return 1;
      if (bValue == null) return -1;

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
  }, [
    products,
    searchQuery,
    categoryFilter,
    supplierFilter,
    stockStatusFilter,
    sortBy,
    sortOrder,
  ]);

  // Get unique categories and suppliers for filters
  const uniqueCategories = useMemo(() => {
    if (!products) return [];
    const categoryIds = [
      ...new Set(products.map((p) => p.categoryId).filter(Boolean)),
    ];
    return categoryIds
      .map((id) => categories?.find((c) => c.id === id))
      .filter(Boolean);
  }, [products, categories]);

  const uniqueSuppliers = useMemo(() => {
    if (!products) return [];
    const supplierIds = [
      ...new Set(products.map((p) => p.supplierId).filter(Boolean)),
    ];
    return supplierIds
      .map((id) => suppliers?.find((s) => s.id === id))
      .filter(Boolean);
  }, [products, suppliers]);

  // Calculate stock statistics
  const stockStats = useMemo(() => {
    if (!products) return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 };

    const total = products.length;
    const inStock = products.filter((p) => p.quantity > 10).length;
    const lowStock = products.filter(
      (p) => p.quantity > 0 && p.quantity <= 10,
    ).length;
    const outOfStock = products.filter((p) => p.quantity === 0).length;

    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  // =================== Handling ===================
  const handleCreateProduct = (values: ProductDataSchema) => {
    createProduct({
      name: values.name,
      price: values.price,
      quantity: values.quantity,
      categoryId: values.categoryId,
      supplierId: values.supplierId,
    });
  };

  const handleClickEditProduct = (product: {
    id: string;
    data: UpdateDataProduct;
  }) => {
    setEditProductDialogOpen(true);
    setProductId(product.id);

    updateProductForm.reset({
      name: product.data.name,
      categoryId: product.data.categoryId,
      price: product.data.price,
      quantity: product.data.quantity,
      supplierId: product.data.supplierId,
    });
  };

  const handleClickDeleteProduct = (productId: string) => {
    setDeleteProductDialogOpen(true);
    setProductId(productId);
  };

  const handleSubmitUpdateProduct = (values: UpdateDataProduct) => {
    if (!productId) return;

    updateProduct({
      productId: productId,
      name: values.name,
      price: values.price,
      quantity: values.quantity,
      categoryId: values.categoryId,
      supplierId: values.supplierId,
    });
  };

  const handleDeleteProduct = () => {
    if (!productId) return;

    deleteProduct({
      productId,
    });
  };

  const getStockStatusBadge = (quantity: number) => {
    if (quantity === 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Out of Stock
        </Badge>
      );
    } else if (quantity <= 10) {
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-200 bg-amber-50 text-amber-600"
        >
          <Clock className="h-3 w-3" />
          Low Stock
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="default"
          className="gap-1 bg-green-500 hover:bg-green-600"
        >
          <CheckCircle className="h-3 w-3" />
          In Stock
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* =================== Header =================== */}
      <DashboardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              Manage your product inventory, track stock levels, and update
              product information
            </DashboardDescription>
          </div>

          {user?.role === "ADMIN" || user?.role === "STAFF" ? (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                </DialogHeader>

                <Form {...createProductForm}>
                  <ProductCreateForm onSubmit={handleCreateProduct} />
                </Form>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
        <Separator className="my-4" />
      </DashboardHeader>

      {/* =================== Stats Cards =================== */}
      <StatsCardProducts
        inStock={stockStats.inStock}
        lowStock={stockStats.lowStock}
        outOfStock={stockStats.outOfStock}
        total={stockStats.total}
      />

      {/* =================== Search and Filters =================== */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <CardDescription>
            Find products by name, SKU, or apply filters to narrow down results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search products by name, SKU, category, or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category?.id} value={category?.id ?? ""}>
                      {category?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {uniqueSuppliers.map((supplier) => (
                    <SelectItem key={supplier?.id} value={supplier?.id ?? ""}>
                      {supplier?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={stockStatusFilter}
                onValueChange={setStockStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="quantity">Quantity</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
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
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Showing {filteredProducts?.length} of {products?.length} products
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
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground mt-2 mb-4 max-w-md">
                {searchQuery ||
                categoryFilter !== "all" ||
                supplierFilter !== "all" ||
                stockStatusFilter !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by adding your first product to the inventory."}
              </p>
              {!searchQuery &&
                categoryFilter === "all" &&
                supplierFilter === "all" &&
                stockStatusFilter === "all" && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">SKU</TableHead>
                  <TableHead className="font-semibold">Product Name</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Supplier</TableHead>
                  <TableHead className="text-center font-semibold">
                    Stock Status
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Quantity
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    Price
                  </TableHead>
                  {user?.role === "ADMIN" || user?.role === "STAFF" ? (
                    <TableHead className="text-center">Actions</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product) => {
                  return (
                    <TableRow
                      key={product.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <code className="bg-muted rounded px-2 py-1 text-xs">
                          {product.sku}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium capitalize">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {product.category?.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {product.supplier?.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStockStatusBadge(product.quantity)}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {product.quantity}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {toRupiah(product.price)}
                      </TableCell>
                      {user?.role === "STAFF" || user?.role === "ADMIN" ? (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size={"sm"}
                              variant={"ghost"}
                              onClick={() =>
                                handleClickEditProduct({
                                  id: product.id,
                                  data: {
                                    name: product.name,
                                    price: product.price,
                                    quantity: product.quantity,
                                    categoryId: product.categoryId ?? "",
                                    supplierId: product.supplierId ?? "",
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
                                handleClickDeleteProduct(product.id)
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

      {/* ==================== Update Product Dialog ==================== */}
      <Dialog
        open={editProductDialogOpen}
        onOpenChange={setEditProductDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Product</DialogTitle>
          </DialogHeader>
          <Form {...updateProductForm}>
            <ProductEditForm onSubmit={handleSubmitUpdateProduct} />
          </Form>
        </DialogContent>
      </Dialog>

      {/* ==================== Delete Product Dialog ==================== */}
      <AlertDialog
        open={deleteProductDialogOpen}
        onOpenChange={setDeleteProductDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4">
            <p>
              This action cannot be undone. This will permanently delete the
              product from your inventory.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleDeleteProduct}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

ProductPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductPage;
