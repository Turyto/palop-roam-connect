
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, RefreshCw, Users, Crown, User, Handshake, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const AdminUsersTable = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchUsers(); };

  const getRoleIcon = (role: string) =>
    role === "admin"
      ? <Crown className="h-4 w-4 text-yellow-600" />
      : role === "partner"
        ? <Handshake className="h-4 w-4 text-emerald-600" />
        : <User className="h-4 w-4 text-blue-600" />;

  const getRoleBadge = (role: string) =>
    role === "admin"
      ? <Badge variant="default">Admin</Badge>
      : role === "partner"
        ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Partner</Badge>
        : <Badge variant="secondary">Customer</Badge>;

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Users that can be selected for deletion (not current user, not admins)
  const selectableUsers = filteredUsers.filter(
    (u) => u.id !== currentUser?.id && u.role !== "admin" && u.role !== "partner"
  );

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUserIds(checked
      ? [...selectedUserIds, userId]
      : selectedUserIds.filter((id) => id !== userId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedUserIds(checked ? selectableUsers.map((u) => u.id) : []);
  };

  const callDeleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { success: false, error: "No active session" };

    const { data, error } = await supabase.functions.invoke("delete-user", {
      body: { user_id: userId },
    });

    if (error) return { success: false, error: error.message };
    if (data?.error) return { success: false, error: data.error };
    return { success: true };
  };

  const handleDeleteSingle = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const result = await callDeleteUser(deletingUser.id);
      if (result.success) {
        sonnerToast.success(`"${deletingUser.email}" deleted successfully.`);
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setSelectedUserIds((prev) => prev.filter((id) => id !== deletingUser.id));
      } else {
        sonnerToast.error(result.error ?? "Delete failed.");
      }
    } finally {
      setIsDeleting(false);
      setDeletingUser(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    setIsDeleting(true);

    let deleted = 0;
    let failed = 0;

    for (const userId of selectedUserIds) {
      const result = await callDeleteUser(userId);
      if (result.success) {
        deleted++;
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        failed++;
      }
    }

    setSelectedUserIds([]);
    setIsBulkDeleteOpen(false);
    setIsDeleting(false);

    if (deleted > 0 && failed === 0) {
      sonnerToast.success(`${deleted} user${deleted !== 1 ? "s" : ""} deleted permanently.`);
    } else if (deleted > 0 && failed > 0) {
      sonnerToast.warning(`${deleted} deleted, ${failed} failed. Check console for details.`);
    } else {
      sonnerToast.error("No users were deleted.");
    }
  };

  const isSelectable = (user: Profile) =>
    user.id !== currentUser?.id && user.role !== "admin" && user.role !== "partner";

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-lg">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
              <Badge variant="outline" className="ml-2 text-xs">
                {users.length} total
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedUserIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {selectedUserIds.length} selected
                </Button>
              )}
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {selectedUserIds.length > 0 && (
            <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 flex items-center justify-between">
              <span>{selectedUserIds.length} user{selectedUserIds.length !== 1 ? "s" : ""} selected</span>
              <button
                onClick={() => setSelectedUserIds([])}
                className="text-blue-500 hover:text-blue-700 text-xs underline"
              >
                Clear
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        selectableUsers.length > 0 &&
                        selectableUsers.every((u) => selectedUserIds.includes(u.id))
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const canDelete = isSelectable(user);
                  return (
                    <TableRow
                      key={user.id}
                      className={selectedUserIds.includes(user.id) ? "bg-blue-50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedUserIds.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                          disabled={!canDelete}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {user.full_name || "Not provided"}
                          {user.id === currentUser?.id && (
                            <span className="ml-1 text-xs text-gray-400">(you)</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          {getRoleBadge(user.role)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {canDelete ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingUser(user)}
                            title="Delete user"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span
                            title={user.id === currentUser?.id ? "Cannot delete your own account" : user.role === "partner" ? "Partner accounts cannot be deleted here" : "Admin accounts cannot be deleted here"}
                            className="inline-flex items-center justify-center w-8 h-8"
                          >
                            <Trash2 className="h-4 w-4 text-gray-200" />
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single-user delete confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => { if (!open) setDeletingUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete user?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  This will permanently delete <strong>{deletingUser?.email}</strong> and all their data — orders, eSIM activations, support tickets, and referral records.
                </p>
                <p className="text-red-600 font-medium">This cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingle}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirmation */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={(open) => { if (!open) setIsBulkDeleteOpen(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete {selectedUserIds.length} users?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  This will permanently delete <strong>{selectedUserIds.length} user account{selectedUserIds.length !== 1 ? "s" : ""}</strong> and all associated data — orders, eSIM activations, support tickets, and referral records.
                </p>
                <p className="text-red-600 font-medium">This cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete All {selectedUserIds.length}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminUsersTable;
