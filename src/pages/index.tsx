import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import LoadingPage from "./loading";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Package,
  BarChart3,
  Truck,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      void router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <LoadingPage />;
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>StockFlow - Inventory Management System</title>
        <meta
          name="description"
          content="Effortlessly manage your inventory with StockFlow. Track products, suppliers, and transactions in one powerful dashboard."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-background flex min-h-screen flex-col">
        {/* =================== Background =================== */}
        <div className="bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-muted flex-1">
          <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
            {/* =================== Navigation Bar =================== */}
            <nav className="absolute top-0 right-0 left-0 flex items-center justify-between p-6 md:p-8">
              <div className="flex items-center gap-2 text-lg font-bold">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
                  <Package className="h-5 w-5" />
                </div>
                StockFlow
              </div>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
            </nav>

            <div className="z-10 mx-auto w-full max-w-5xl space-y-8 lg:grid lg:grid-cols-2 lg:gap-12 lg:space-y-0">
              {/* Left Content */}
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <div className="space-y-4">
                  <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                    Streamline Your Inventory.
                  </h1>
                  <p className="text-muted-foreground text-lg sm:text-xl">
                    Effortlessly manage products, suppliers, and transactions in
                    one powerful dashboard.
                  </p>
                </div>

                <div className="mx-auto grid w-full max-w-sm gap-4 lg:mx-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-primary h-5 w-5" />
                    <span>Real-time stock tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-primary h-5 w-5" />
                    <span>Simple supplier management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-primary h-5 w-5" />
                    <span>Detailed transaction logs</span>
                  </div>
                </div>
              </div>

              <Card className="bg-background/70 relative z-20 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-center text-2xl">
                    Get Started Today
                  </CardTitle>
                  <CardDescription className="text-center">
                    Create an account to start managing your inventory.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <SignUpButton forceRedirectUrl="/dashboard">
                      <Button className="w-full" size="lg">
                        Sign Up for Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </SignUpButton>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background text-muted-foreground px-2">
                          Already have an account?
                        </span>
                      </div>
                    </div>
                    <SignInButton forceRedirectUrl="/dashboard">
                      <Button variant="outline" className="w-full" size="lg">
                        Sign In
                      </Button>
                    </SignInButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* =================== Highlights Section =================== */}
        <div className="bg-background border-t px-4 py-24 md:px-8">
          <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Product Management</h3>
              <p className="text-muted-foreground">
                Keep track of all your products, their quantities, and
                categories in one organized place.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-lg">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Supplier Network</h3>
              <p className="text-muted-foreground">
                Manage your supplier information and see which products come
                from where.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Real-time Insights</h3>
              <p className="text-muted-foreground">
                Get an instant overview of your inventory with our intuitive
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
