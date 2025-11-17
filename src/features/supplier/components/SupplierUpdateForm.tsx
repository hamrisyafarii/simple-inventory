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
import type { SupplierDataSchema } from "../forms/CreateSupplierSchema";

type SupplierUpdateFormProps = {
  onSubmit: (values: SupplierDataSchema) => void;
};

const SupplierUpdateForm = (props: SupplierUpdateFormProps) => {
  const form = useFormContext<SupplierDataSchema>();
  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(props.onSubmit)}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Supplier Name</FormLabel>
            <FormControl>
              <Input placeholder="Supplier name..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="contact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit">Add Supplier</Button>
    </form>
  );
};
export default SupplierUpdateForm;
