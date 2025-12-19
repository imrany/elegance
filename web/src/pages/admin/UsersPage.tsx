import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Order, type User as UserType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search,
  UserCog,
  Shield,
  Trash2,
  User,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Package,
  Loader2,
  Info,
  ShoppingCart,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { formatShortDate, statusColors } from "@/lib/utils";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const { user: owner } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState("all");

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await api.getAllUsers();
      return response;
    },
  });

  // Fetch orders for selected user
  const [userOrders, setUserOrders] = useState<Order[] | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const ordersMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) => api.getUserOrders(userId),
    onSuccess: (orders) => {
      setUserOrders(orders);
      setIsLoadingOrders(false);
    },
    onError: (error) => {
      console.error("Error fetching user orders:", error);
      setIsLoadingOrders(false);
    },
  });

  useEffect(() => {
    if (selectedUser) {
      ordersMutation.mutate({ userId: selectedUser.id });
    } else {
      setUserOrders([]);
      setIsLoadingOrders(false);
    }
  }, [selectedUser]);

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated successfully");
      setIsDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      if (selectedTab === "user") {
        setSelectedTab("all");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  // Filter users based on search
  const filteredUsers = users?.filter(
    (user: UserType) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRoleChange = (role: string) => {
    if (selectedUser) {
      updateRoleMutation.mutate({ userId: selectedUser.id, role });
      setSelectedTab("all");
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
      setSelectedTab("all");
    }
  };

  const handleViewUserDetails = (user: UserType) => {
    setSelectedUser(user);
    setSelectedTab("user");
  };

  return (
    <div className="space-y-8">
      {selectedTab === "all" && (
        <>
          <div>
            <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
              User Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users?.filter((u) => u.role === "admin").length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Regular Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users?.filter((u) => u.role === "user").length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage all registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading users...
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className="cursor-pointer"
                          onDoubleClick={() => handleViewUserDetails(user)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                                {user.role === "admin" ? (
                                  <Shield className="h-4 w-4 text-accent" />
                                ) : (
                                  <User className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <span className="font-mono text-xs text-muted-foreground">
                                {user.id.substring(0, 8)}...
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : "secondary"
                              }
                            >
                              {user.role === "admin" ? (
                                <>
                                  <Shield className="mr-1 h-3 w-3" />
                                  Admin
                                </>
                              ) : (
                                <>
                                  <User className="mr-1 h-3 w-3" />
                                  User
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDistanceToNow(new Date(user.created_at), {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewUserDetails(user)}
                              >
                                <UserCog className="h-4 w-4 mr-1" />
                                Manage
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {selectedTab === "user" && selectedUser && (
        <>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTab("all");
                setSelectedUser(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </div>

          <div>
            <h2 className="font-serif text-xl font-light text-foreground md:text-2xl">
              User Details
            </h2>
            <p className="mt-1 text-muted-foreground">{selectedUser.email}</p>
          </div>

          <Tabs defaultValue="info" className="space-y-6">
            <TabsList>
              <TabsTrigger value="info">
                <Info className="h-4 w-4 mr-2" />
                Information
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
            </TabsList>

            {/* Information Tab */}
            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  {selectedUser.phone_number && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">
                          {selectedUser.phone_number}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        Member Since
                      </p>
                      <p className="text-sm font-medium">
                        {formatShortDate(selectedUser.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      User ID
                    </span>
                    <span className="text-sm font-mono">
                      {selectedUser.id?.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <Badge
                      variant={
                        selectedUser.role === "admin" ? "default" : "secondary"
                      }
                    >
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Last Updated
                    </span>
                    <span className="text-sm">
                      {formatShortDate(selectedUser.updated_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {owner.id !== selectedUser.id && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(true);
                    }}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Change Role
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              {isLoadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : !userOrders || userOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 font-medium text-foreground">
                      No orders yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This user hasn't placed any orders
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Order Stats */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-2xl font-bold">
                              {userOrders?.length}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total Orders
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-2xl font-bold">
                              {userOrders?.filter(
                                (order) => order.status === "delivered",
                              ).length || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Completed Orders
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Orders List */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Order History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/5 transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                Order #{order.id?.substring(0, 8)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatShortDate(order.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                className={`capitalize ${statusColors[order.status] || ""}`}
                                variant="secondary"
                              >
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Role</label>
              <div className="p-3 bg-muted rounded-md">
                <Badge
                  variant={
                    selectedUser?.role === "admin" ? "default" : "secondary"
                  }
                >
                  {selectedUser?.role}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Change To</label>
              <Select
                defaultValue={selectedUser?.role}
                onValueChange={handleRoleChange}
                disabled={updateRoleMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>User</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                <strong>Note:</strong> Admins have full access to manage
                products, orders, settings, and users.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={updateRoleMutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm">
                <strong>Email:</strong> {selectedUser?.email}
              </p>
              <p className="text-sm mt-2">
                All orders and data associated with this user will remain in the
                system.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
