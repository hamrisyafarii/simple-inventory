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
import type { CategoryDataSchema } from "../forms/category.schema";

type CreateCategoryFormProps = {
  onSubmit: (values: CategoryDataSchema) => void;
};

const CreateCategoryForm = (props: CreateCategoryFormProps) => {
  const form = useFormContext<CategoryDataSchema>();

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(props.onSubmit)}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end">
        <Button type="submit">Add Category</Button>
      </div>
    </form>
  );
};
export default CreateCategoryForm;
