import { AlertCircle, Building, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type StatsCardProductsProps = {
  total: number;
  withProducts: number;
  withoutProducts: number;
};

const StatsCardSupplier = (props: StatsCardProductsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
          <Building className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{props.total}</div>
          <p className="text-muted-foreground text-xs">
            All suppliers in network
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Suppliers
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {props.withProducts}
          </div>
          <p className="text-muted-foreground text-xs">
            Suppliers with products
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inactive Suppliers
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            {props.withoutProducts}
          </div>
          <p className="text-muted-foreground text-xs">
            Suppliers without products
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCardSupplier;
