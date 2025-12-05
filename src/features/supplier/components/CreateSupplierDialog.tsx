import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type React from "react";
import type { ReactNode } from "react";

type CreateSupplierDialogProps = {
  createSupplierDialogOpen: boolean;
  setCreateSupplierDialogOpen: (createSupplierDialogOpen: boolean) => void;
  children: ReactNode;
};

const CreateSupplierDialog = (props: CreateSupplierDialogProps) => {
  return (
    <Dialog
      open={props.createSupplierDialogOpen}
      onOpenChange={props.setCreateSupplierDialogOpen}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>
            Enter the supplier details below to create a new supplier
          </DialogDescription>
        </DialogHeader>
        {props.children}
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupplierDialog;
