import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

type DeleteSupplierAlertDialogProps = {
  deleteSupplierDialogOpen: boolean;
  setDeleteSupplierDialogOpen: (deleteSupplierDialogOpen: boolean) => void;
  getProductCount: (supplierId: string) => number;
  handleDeleteSupplier: () => void;
  supplierToId: string | null;
};

const DeleteSupplierAlertDialog = (props: DeleteSupplierAlertDialogProps) => {
  return (
    <AlertDialog
      open={props.deleteSupplierDialogOpen}
      onOpenChange={props.setDeleteSupplierDialogOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            supplier from your network.
            {props.getProductCount(props.supplierToId ?? "") > 0 && (
              <span className="text-destructive mt-2 block font-medium">
                Note: {props.getProductCount(props.supplierToId ?? "")} products
                are associated with this supplier.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={props.handleDeleteSupplier}
            className="bg-destructive"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSupplierAlertDialog;
