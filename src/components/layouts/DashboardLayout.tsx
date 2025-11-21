import {
  ArrowLeftRight,
  Boxes,
  ChartBarStacked,
  Grid3X3,
  LogOut,
  Package,
  Truck,
} from "lucide-react";
import React, { type ReactNode } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarInset,
} from "~/components/ui/sidebar";
import { useRouter } from "next/router";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// Dashboard header component
interface DashboardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const DashboardHeader = ({
  children,
  className = "",
}: DashboardHeaderProps) => {
  return <header className={`mb-6 space-y-2 ${className}`}>{children}</header>;
};

// Dashboard title component
interface DashboardTitleProps {
  children: ReactNode;
  className?: string;
}

export const DashboardTitle = ({
  children,
  className = "",
}: DashboardTitleProps) => {
  return (
    <h1 className={`text-2xl font-bold tracking-tight ${className}`}>
      {children}
    </h1>
  );
};

// Dashboard description component
interface DashboardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const DashboardDescription = ({
  children,
  className = "",
}: DashboardDescriptionProps) => {
  return <p className={`text-muted-foreground ${className}`}>{children}</p>;
};

// Main dashboard layout component
interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: Grid3X3,
      href: "/dashboard",
    },
    {
      title: "Products",
      icon: Boxes,
      href: "/products",
    },
    {
      title: "Categories",
      icon: ChartBarStacked,
      href: "/category",
    },
    {
      title: "Suppliers",
      icon: Truck,
      href: "/supplier",
    },
    {
      title: "Transactions",
      icon: ArrowLeftRight,
      href: "/transaction",
    },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="bg-sidebar border-r">
        <SidebarHeader className="bg-sidebar-primary/10 p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">StockFlow</span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-3 py-2">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={
                    router.pathname === item.href ||
                    router.pathname.startsWith(`${item.href}/`)
                  }
                  className="h-10"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <SidebarSeparator className="my-3" />
        </SidebarContent>

        <SidebarFooter className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-10">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt={user?.username ?? "User"}
                      />
                      <AvatarFallback>
                        {user?.username?.charAt(0).toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user?.username ?? "User"}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {user?.emailAddresses[0]?.emailAddress ??
                          "user@example.com"}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-2 font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {user?.username ?? "User"}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {user?.emailAddresses[0]?.emailAddress ??
                          "user@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator /> */}
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="flex w-full items-center">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure you want to log out?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            You will be redirected to the login page.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleSignOut}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Log out
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};
