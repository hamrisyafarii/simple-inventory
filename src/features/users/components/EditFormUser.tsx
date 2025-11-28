// components/EditFormUser.tsx
import { useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { UserDataSchema } from "../forms/user.schema";

type EditFormUserProps = {
  onSubmit: (value: UserDataSchema) => void;
};

const USER_ROLES = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  VIEWER: "VIEWER",
} as const;

const EditFormUser = (props: EditFormUserProps) => {
  const form = useFormContext<UserDataSchema>();

  return (
    <form className="space-y-4" onClick={form.handleSubmit(props.onSubmit)}>
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>User Role</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.values(USER_ROLES).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end gap-2">
        <Button type="submit">Update Role</Button>
      </div>
    </form>
  );
};

export default EditFormUser;
