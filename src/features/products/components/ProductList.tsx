import { EditIcon, TrashIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { toRupiah } from "~/utils/toRupiah";

type ProductListProps = {
  products: [
    {
      id: string;
      sku: string;
      name: string;
      categoryId?: string;
      supplierId?: string;
      price: number;
      quantity: number;
    },
  ];
};

const ProductList = (props: ProductListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold">SKU</TableHead>
          <TableHead className="font-semibold">Product Name</TableHead>
          <TableHead className="font-semibold">Category</TableHead>
          <TableHead className="font-semibold">Supplier</TableHead>
          <TableHead className="text-center font-semibold">Quantity</TableHead>
          <TableHead className="font-semibold">Price</TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.products?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              No products found.
            </TableCell>
          </TableRow>
        ) : (
          props.products?.map((product) => {
            return (
              <TableRow key={product.id} className="hover:bg-muted/50">
                <TableCell>
                  <code className="bg-muted rounded px-2 py-1 text-xs">
                    {product.sku}
                  </code>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {product.category?.name ?? "-"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  Supplier
                </TableCell>
                <TableCell className="text-center font-mono">
                  {product.quantity}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {toRupiah(product.price)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size={"sm"} variant={"ghost"}>
                      <EditIcon className="text-primary" />
                    </Button>
                    <Button
                      variant={"ghost"}
                      size={"icon-sm"}
                      onClick={() => handleDeleteProduct(product.id)}
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
  );
};
export default ProductList;
