import { useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { ProductDataSchema } from "../forms/product.schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { api } from "~/utils/api";

type ProductCreateFormProps = {
  onSubmit: (values: ProductDataSchema) => void;
};

const ProductCreateForm = (props: ProductCreateFormProps) => {
  const form = useFormContext<ProductDataSchema>();

  const {
    data: categories,
    isLoading: isLoadingCategory,
    isError: isErrorCategory,
  } = api.category.getAllCategory.useQuery();

  const {
    data: suppliers,
    isLoading,
    isError,
  } = api.supplier.getAllSupplier.useQuery();

  return (
    <form className="space-y-2" onSubmit={form.handleSubmit(props.onSubmit)}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input placeholder="Product name..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 items-center gap-3">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingCategory && (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  )}
                  {isErrorCategory && (
                    <SelectItem value="error" disabled>
                      Failed get category
                    </SelectItem>
                  )}
                  {categories && (
                    <>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoading && (
                      <SelectItem value="loading" disabled>
                        loading...
                      </SelectItem>
                    )}
                    {isError && (
                      <SelectItem value="error" disabled>
                        Failed get Supplier
                      </SelectItem>
                    )}
                    {suppliers && (
                      <>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="flex w-full justify-end">
        <Button type="submit">Add product</Button>
      </div>
    </form>
  );
};
export default ProductCreateForm;
