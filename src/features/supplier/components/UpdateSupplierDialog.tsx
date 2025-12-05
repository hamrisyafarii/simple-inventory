import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type UpdateSupplierDialogProps = {
  updateSupplierDialogOpen: boolean;
  setUpdateSupplierDialogOpen: (updateSupplierDialogOpen: boolean) => void;
  children: ReactNode;
};

const UpdateSupplierDialog = (props: UpdateSupplierDialogProps) => {
  return (
    <Dialog
      open={props.updateSupplierDialogOpen}
      onOpenChange={props.setUpdateSupplierDialogOpen}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Supplier</DialogTitle>
          <DialogDescription>
            Update the supplier details below
          </DialogDescription>
        </DialogHeader>
        {props.children}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSupplierDialog;
