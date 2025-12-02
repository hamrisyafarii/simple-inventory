import {
  EditIcon,
  Search,
  TrashIcon,
  Users,
  Shield,
  UserCheck,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "~/components/layouts/DashboardLayout";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { NextPageWithLayout } from "~/pages/_app";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { Form } from "~/components/ui/form";
import EditFormUser from "../components/EditFormUser";
import { userDataSchema, type UserDataSchema } from "../forms/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Role } from "@prisma/client";
import { toast } from "sonner";

const UserPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [getUserId, setGetUserId] = useState<string | null>(null);

  // ========== useForm ==========
  const editUserForm = useForm<UserDataSchema>({
    resolver: zodResolver(userDataSchema),
  });

  // =================== API CALLS ===================
  const { data: users, isLoading } = api.user.getAllUsers.useQuery();

  const { data: currentUser } = api.user.getUserData.useQuery();

  const { mutate: updateUser } = api.user.updateDataUser.useMutation({
    onSuccess: async () => {
      await apiUtils.user.getAllUsers.invalidate();
      setEditDialogOpen(false);

      toast.success("Successfully update role user");
    },
    onError: (error) => {
      toast.error(error.shape?.message);
    },
  });

  const { mutate: deleteUser } = api.user.deleteUserByAdmin.useMutation({
    onSuccess: async () => {
      await apiUtils.user.getAllUsers.invalidate();

      toast.success("Successfully delete data user");
    },
    onError: (err) => {
      toast.error(err.shape?.message);
    },
  });

  // =================== Handling ====================
  const handleUpdateClickUser = (user: { role: Role; id: string }) => {
    setGetUserId(user.id);
    setEditDialogOpen(true);

    editUserForm.reset({
      role: user.role,
    });
  };

  const handleSubmitUser = (value: UserDataSchema) => {
    if (!getUserId) return;

    updateUser({
      userId: getUserId,
      role: value.role,
    });
  };

  const handleClickDeleteUser = (userId: string) => {
    setGetUserId(userId);
    setDeleteDialogOpen(true);
  };

  const handleActionDelete = () => {
    if (!getUserId) return;
    deleteUser({
      userId: getUserId,
    });
  };

  // =================== Filtering Logic ===================
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user) =>
        user.email!.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  const userStats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, staffs: 0, viewers: 0 };
    const total = users.length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const staffs = users.filter((u) => u.role === "STAFF").length;
    const viewers = users.filter((u) => u.role === "VIEWER").length;
    return { total, admins, staffs, viewers };
  }, [users]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return (
        <Badge variant="default" className="gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    } else if (role === "STAFF") {
      return (
        <Badge variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" />
          Staff
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1">
          <UserCheck className="h-3 w-3" />
          Viewer
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* =================== Header =================== */}
      <DashboardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <DashboardTitle>User Management</DashboardTitle>
            <DashboardDescription>
              Manage application users and their roles
            </DashboardDescription>
          </div>
        </div>
      </DashboardHeader>

      {/* =================== Stats Cards =================== */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
            <p className="text-muted-foreground text-xs">
              All registered users
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {userStats.admins}
            </div>
            <p className="text-muted-foreground text-xs">
              Users with admin access
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staffs</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {userStats.staffs}
            </div>
            <p className="text-muted-foreground text-xs">
              Users with staff access
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viewers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {userStats.viewers}
            </div>
            <p className="text-muted-foreground text-xs">Standard users</p>
          </CardContent>
        </Card>
      </div>

      {/* =================== Search and Filters =================== */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </CardTitle>
          <CardDescription>Find users by their email or role.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* =================== Content =================== */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>
            A list of all users in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground mt-2 mb-4 max-w-md">
                {searchQuery
                  ? "Try adjusting your search to find what you're looking for."
                  : "Get started by adding your first user."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Joined On</TableHead>
                  {currentUser?.role === "ADMIN" && (
                    <TableHead className="text-center">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-muted-foreground text-sm">
                          ID: {user.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    {currentUser?.role === "ADMIN" && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size={"sm"}
                            variant={"ghost"}
                            onClick={() =>
                              handleUpdateClickUser({
                                id: user.id,
                                role: user.role,
                              })
                            }
                          >
                            <EditIcon className="text-primary h-4 w-4" />
                          </Button>
                          <Button
                            variant={"ghost"}
                            size={"sm"}
                            onClick={() => handleClickDeleteUser(user.id)}
                          >
                            <TrashIcon className="text-destructive h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ==================== Edit User Dialog ==================== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Update the role for this user. Changing their email is not
              recommended.
            </DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <EditFormUser onSubmit={handleSubmitUser} />
          </Form>
        </DialogContent>
      </Dialog>

      {/* ==================== Delete User Dialog ==================== */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove their access to the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={handleActionDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

UserPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default UserPage;
