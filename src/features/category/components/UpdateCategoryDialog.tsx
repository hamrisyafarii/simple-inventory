import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type UpdateCategoryDialogProps = {
  editCategoryDialogOpen: boolean;
  setEditCategoryDialogOpen: (editCategoryDialogOpen: boolean) => void;
  children: ReactNode;
};

const UpdateCategoryDialog = (props: UpdateCategoryDialogProps) => {
  return (
    <Dialog
      open={props.editCategoryDialogOpen}
      onOpenChange={props.setEditCategoryDialogOpen}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update the category name below</DialogDescription>
        </DialogHeader>
        {props.children}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCategoryDialog;
