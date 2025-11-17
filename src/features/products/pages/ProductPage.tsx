import type { ReactElement } from "react";
import { useState } from "react";
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
import type { NextPageWithLayout } from "~/pages/_app";
import { Search, Plus, EditIcon, TrashIcon } from "lucide-react";
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

const ProductPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);

  // ========== useForm ==========
  const createProductForm = useForm<ProductDataSchema>({
    resolver: zodResolver(productDataSchema),
  });

  const updateProductForm = useForm<ProductDataSchema>({
    resolver: zodResolver(productDataSchema),
  });

  // =================== API CALL ===================
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

      toast.success("Succresfully update data product");
      setEditProductDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const { data: products } = api.product.getAllProduct.useQuery();

  const { mutate: deleteProduct } = api.product.deleteProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getAllProduct.invalidate();

      toast.success("Successfully deleted product !");
    },

    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  // =================== Handling ===================
  const handleCreateProduct = (values: ProductDataSchema) => {
    createProduct({
      name: values.name,
      price: values.price,
      quantity: values.quantity,
      categoryId: values.categoryId,
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
    });
  };

  const handleDeleteProduct = () => {
    if (!productId) return;

    deleteProduct({
      productId,
    });
  };

  return (
    <div className="space-y-2">
      {/* =================== Header =================== */}
      <DashboardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <DashboardTitle>Product</DashboardTitle>
            <DashboardDescription>
              Manage your product inventory
            </DashboardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Product</DialogTitle>
              </DialogHeader>

              <Form {...createProductForm}>
                <ProductCreateForm onSubmit={handleCreateProduct} />
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <Separator className="my-4" />
      </DashboardHeader>

      {/* =================== Search =================== */}
      <div className="relative mb-4 w-full max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search products by name, SKU, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* =================== Content =================== */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">SKU</TableHead>
              <TableHead className="font-semibold">Product Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Supplier</TableHead>
              <TableHead className="text-center font-semibold">
                Quantity
              </TableHead>
              <TableHead className="text-center font-semibold">Price</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => {
                return (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell>
                      <code className="bg-muted rounded px-2 py-1 text-xs">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {product.category?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      Supplier
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {product.quantity}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {toRupiah(product.price)}
                    </TableCell>
                    <TableCell className="flex items-center justify-center">
                      <div className="flex gap-2">
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
                              },
                            })
                          }
                        >
                          <EditIcon className="text-primary" />
                        </Button>
                        <Button
                          variant={"ghost"}
                          size={"icon-sm"}
                          onClick={() => handleClickDeleteProduct(product.id)}
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

      {/* =================== Footer =================== */}
      <div className="text-muted-foreground mt-4 text-sm">
        Showing {products?.length} of {products?.length} products
      </div>

      {/* ==================== Update Product Dialog ==================== */}
      <Dialog
        open={editProductDialogOpen}
        onOpenChange={setEditProductDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update product</DialogTitle>
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
            <AlertDialogTitle>
              Are you sure want delete this product?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleDeleteProduct}
            >
              Continue
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
