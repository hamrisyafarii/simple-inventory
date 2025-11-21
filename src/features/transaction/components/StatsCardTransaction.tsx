import { Package, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type StatsCardTransactionProps = {
  total: number;
  inStock: number;
  outStock: number;
};

const StatsCardTransaction = (props: StatsCardTransactionProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Transactions
          </CardTitle>
          <Package className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{props.total}</div>
          <p className="text-muted-foreground text-xs">All stock movements</p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock In</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {props.inStock}
          </div>
          <p className="text-muted-foreground text-xs">
            Items added to inventory
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {props.outStock}
          </div>
          <p className="text-muted-foreground text-xs">
            Items removed from inventory
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
export default StatsCardTransaction;
