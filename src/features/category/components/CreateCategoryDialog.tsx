import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type CreateCategoryDialogProps = {
  categoryCreateDialog: boolean;
  setCategoryCreateDialog: (CreateCategoryDialog: boolean) => void;
  children: ReactNode;
};

const CreateCategoryDialog = (props: CreateCategoryDialogProps) => {
  return (
    <Dialog
      open={props.categoryCreateDialog}
      onOpenChange={props.setCategoryCreateDialog}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Enter the category name below to create a new category
          </DialogDescription>
        </DialogHeader>
        {props.children}
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
