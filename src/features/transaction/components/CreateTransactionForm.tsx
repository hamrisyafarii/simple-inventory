import { useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/utils/api";
import type { TransactionDataSchema } from "../forms/transaction.schema";

type CreateTransactionFormProps = {
  onSubmit: (values: TransactionDataSchema) => void;
};

const TRANSACTION_TYPES = {
  IN: "IN",
  OUT: "OUT",
} as const;

const CreateTransactionForm = (props: CreateTransactionFormProps) => {
  const form = useFormContext<TransactionDataSchema>();

  // ================= API CALL =================
  const { data: products } = api.product.getAllProduct.useQuery();

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(props.onSubmit)}>
      {/* Transaction Type Field */}
      <FormField
        control={form.control}
        name="typeTransaction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Transaction Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={TRANSACTION_TYPES.IN}>
                  IN (Stock In)
                </SelectItem>
                <SelectItem value={TRANSACTION_TYPES.OUT}>
                  OUT (Stock Out)
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Product Selection Field */}
      <FormField
        control={form.control}
        name="productId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} (SKU: {product.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Quantity Field */}
      <FormField
        control={form.control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                placeholder="Enter quantity"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Note Field */}
      <FormField
        control={form.control}
        name="note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Note (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add any additional notes"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" className="w-full">
        Record Transaction
      </Button>
    </form>
  );
};

export default CreateTransactionForm;
