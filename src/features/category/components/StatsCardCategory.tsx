import { AlertCircle, CheckCircle, Folder } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type StatsCardCategoryProps = {
  total: number;
  withProducts: number;
  empty: number;
};

const StatsCardCategory = (props: StatsCardCategoryProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Categories
          </CardTitle>
          <Folder className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{props.total}</div>
          <p className="text-muted-foreground text-xs">
            All categories in inventory
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">With Products</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {props.withProducts}
          </div>
          <p className="text-muted-foreground text-xs">
            Categories containing products
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Empty Categories
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{props.empty}</div>
          <p className="text-muted-foreground text-xs">
            Categories without products
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCardCategory;
