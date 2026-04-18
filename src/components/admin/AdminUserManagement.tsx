import React from "react";
import { User, Trash2, MoreVertical, Mail, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { AdminDeleteModal } from "./AdminDeleteModal";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const AdminUserManagement = () => {
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  React.useEffect(() => {
    const channel = supabase
      .channel("admin_users_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          console.log("Realtime user change detected:", payload);
          queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedUser({ id, name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", selectedUser.id);
      
      if (error) throw error;
      
      toast.success(`${selectedUser.name} has been removed from the platform.`);
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user profile");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 border border-border mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-foreground text-lg font-semibold">User Management</h3>
          <p className="text-muted-foreground text-xs mt-1">Audit and manage platform participants</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-foreground text-xs md:text-sm font-medium transition-colors border border-border">
            Filters
          </button>
          <button className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-foreground text-xs md:text-sm font-medium transition-colors border border-border">
            Bulk Actions
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p className="text-sm">Loading users...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px] text-destructive text-sm">
            Failed to load users: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : !users || users.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No users found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                <th className="pb-3 px-4 min-w-[200px]">User</th>
                <th className="pb-3 px-4 min-w-[120px]">Method</th>
                <th className="pb-3 px-4 min-w-[120px]">Joined</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const rawMethod = user.signup_method || "email";
                const method = rawMethod.toLowerCase() === "google" ? "Google" : "Email";

                return (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden shrink-0 flex items-center justify-center text-xs text-foreground border border-border">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name || "User"} className="w-full h-full object-cover" />
                          ) : (
                            user.name ? user.name.charAt(0).toUpperCase() : "U"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {user.name || "Anonymous User"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {user.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-sm text-foreground">
                        {method === "Google" ? <GoogleIcon /> : <Mail className="w-4 h-4 mr-2 text-muted-foreground" />}
                        {method}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground text-sm">
                      {user.created_at ? format(new Date(user.created_at), "MMM d, yyyy") : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-right flex justify-end gap-3">
                      <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="View Profile"><User className="w-4 h-4" /></button>
                      <button 
                        onClick={() => handleDeleteClick(user.id, user.name)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AdminDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Profile"
        description="Are you sure you want to delete this user? This will remove their profile and access to the platform."
        itemName={selectedUser?.name}
        loading={isDeleting}
      />
    </div>
  );
};
