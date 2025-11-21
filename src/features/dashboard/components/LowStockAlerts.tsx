import { AlertTriangle, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

type lowStockItems = {
  id: string;
  name: string;
  quantity: number;
};

type LowStockAlerts = {
  lowStockItemsprops: lowStockItems[];
};

const LowStockAlerts = (props: LowStockAlerts) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Low Stock Alerts
        </CardTitle>
        <CardDescription>
          Products that are running low and need to be restocked soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {props.lowStockItemsprops.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            All products are well stocked.
          </p>
        ) : (
          <div className="space-y-3">
            {props.lowStockItemsprops.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <Link
                  href={`/products`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-50 text-amber-600"
                >
                  {item.quantity} left
                </Badge>
              </div>
            ))}
          </div>
        )}
        <Separator className="my-4" />
        <Button asChild className="w-full">
          <Link href="/products">
            <Eye className="mr-2 h-4 w-4" />
            View All Products
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
export default LowStockAlerts;
