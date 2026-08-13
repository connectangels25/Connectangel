import React from "react";
import { User, Trash2, MoreVertical, Mail, Loader2, ArrowRight, Ban, CheckCircle, ShieldCheck, Crown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AdminDeleteModal } from "./AdminDeleteModal";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface AdminUserManagementProps {
  limitLatest?: number;
}

export const AdminUserManagement = ({ limitLatest }: AdminUserManagementProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<{ id: string; name: string | null } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [isResettingPlans, setIsResettingPlans] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error: profileError, count: profileCount } = await supabase
        .from("profiles")
        .select("*", { count: 'exact' })
        .order("created_at", { ascending: false });
      
      if (profileError) throw profileError;

      const { data: events, error: eventError } = await supabase
        .from("events")
        .select("user_id")
        .neq('status', 'draft');

      if (eventError) throw eventError;

      const eventCountMap = (events || []).reduce((acc: any, curr) => {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
        return acc;
      }, {});

      return (profiles || []).map(p => ({
        ...p,
        event_count: eventCountMap[p.id] || 0
      }));
    },
  });

  const displayUsers = limitLatest && users ? users.slice(0, limitLatest) : users;

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  React.useEffect(() => {
    const channel = supabase
      .channel("admin_users_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
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
    setOpenMenuId(null);
    setSelectedUser({ id, name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      const { error: fnError } = await supabase.functions.invoke("delete-user", {
        body: { user_id: selectedUser.id },
      });
      if (fnError) throw fnError;
      const displayName = selectedUser.name || "User";
      toast.success(`${displayName} has been removed from the platform.`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      let msg = err?.message || "Failed to delete user profile";
      try {
        if (err?.context?.text) {
          const body = await err.context.text();
          const parsed = JSON.parse(body);
          if (parsed?.error) msg = parsed.error;
        }
      } catch (_) {}
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBanUnban = async (userId: string, name: string, action: "ban" | "unban") => {
    setActionLoading(userId);
    setOpenMenuId(null);
    try {
      const { error: fnError } = await supabase.functions.invoke("manage-user", {
        body: { user_id: userId, action },
      });
      if (fnError) throw fnError;
      toast.success(`${name || "User"} has been ${action === "ban" ? "banned" : "unbanned"}.`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetAllPlans = async () => {
    if (!window.confirm("Are you sure you want to move all non-admin members to the Free Plan?")) {
      return;
    }
    setIsResettingPlans(true);
    try {
      // 1. Try Direct Database update via Supabase client
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ plan: "free", pro_started_at: null })
        .or("is_admin.is.null,is_admin.eq.false");

      if (dbError) {
        // 2. Fallback to Edge Function if direct update hits RLS limit
        const { error: fnError } = await supabase.functions.invoke("manage-user", {
          body: { action: "reset_all_plans_to_free" },
        });
        if (fnError) throw fnError;
      }

      toast.success("All non-admin members have been moved to the Free Plan!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset member plans. Run the migration SQL in Supabase Dashboard.");
    } finally {
      setIsResettingPlans(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 border border-border mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-foreground text-lg font-semibold">User Management</h3>
          <p className="text-muted-foreground text-xs mt-1">Audit and manage platform participants</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={handleResetAllPlans}
            disabled={isResettingPlans}
            className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs md:text-sm font-semibold transition-colors border border-amber-500/30 flex items-center justify-center gap-1.5"
            title="Move all paid members to free plan (excluding admins)"
          >
            {isResettingPlans && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Reset All to Free Plan
          </button>
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
          <LoadingScreen message="Loading users..." fullScreen={false} />
        ) : error ? (
          <div className="flex items-center justify-center h-[300px] text-destructive text-sm">
            Failed to load users: {error?.message || "Unknown error"}
          </div>
        ) : !users || users.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No users found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                <th className="pb-3 px-4 min-w-[160px] sm:min-w-[200px]">User</th>
                <th className="pb-3 px-4 min-w-[70px] sm:min-w-[90px]">Status</th>
                <th className="pb-3 px-4 min-w-[90px] sm:min-w-[120px]">Method</th>
                <th className="pb-3 px-4 min-w-[70px] sm:min-w-[90px]">Trial</th>
                <th className="pb-3 px-4 min-w-[100px] sm:min-w-[130px]">AI Clicks (F/P)</th>
                <th className="pb-3 px-4 min-w-[70px] sm:min-w-[80px]">Events</th>
                <th className="pb-3 px-4 min-w-[90px] sm:min-w-[120px]">Joined</th>
                {!limitLatest && <th className="pb-3 px-4 text-right w-[100px]">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayUsers.map((user) => {
                const rawMethod = user.signup_method || "email";
                const method = rawMethod.toLowerCase() === "google" ? "Google" : "Email";
                const FREE_DAYS = 26;
                const PRO_DAYS = 30;
                const isBanned = !!(user as any).is_banned;
                const trialStart = (user as any).created_at;
                const proStart = (user as any).pro_started_at;
                const isFreeTrialExpired = !!(trialStart) && Math.floor((Date.now() - new Date(trialStart).getTime()) / (1000 * 60 * 60 * 24)) >= FREE_DAYS;
                const isProExpired = !!(proStart) && Math.floor((Date.now() - new Date(proStart).getTime()) / (1000 * 60 * 60 * 24)) >= PRO_DAYS;

                return (
                  <tr key={user.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${isBanned ? 'opacity-60' : ''}`}>
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
                      {isBanned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                          <Ban className="w-3 h-3" /> Banned
                        </span>
                      ) : (user as any).is_admin ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (user as any).plan === 'pro' && !isProExpired ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                          <Crown className="w-3 h-3" /> Pro Active
                        </span>
                      ) : (user as any).plan === 'pro' && isProExpired ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                          <Ban className="w-3 h-3" /> Pro Expired
                        </span>
                      ) : (user as any).plan === 'free' && !isFreeTrialExpired ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                          <CheckCircle className="w-3 h-3" /> Free Active
                        </span>
                      ) : (user as any).plan === 'free' && isFreeTrialExpired ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          <Ban className="w-3 h-3" /> Free Deactivated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-sm text-foreground">
                        {method === "Google" ? <GoogleIcon /> : <Mail className="w-4 h-4 mr-2 text-muted-foreground" />}
                        {method}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {(user as any).is_admin ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (user as any).plan === 'pro' ? (
                        proStart ? (() => {
                          const elapsed = Math.floor((Date.now() - new Date(proStart).getTime()) / (1000 * 60 * 60 * 24));
                          const remaining = Math.max(0, PRO_DAYS - elapsed);
                          return remaining > 0 ? (
                            <span className={`text-xs font-semibold ${remaining <= 3 ? 'text-amber-500' : 'text-blue-500'}`}>
                              Pro: {remaining}d left
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-red-500">Pro Expired</span>
                          );
                        })() : (
                          <span className="text-xs font-semibold text-blue-500">Pro: Active</span>
                        )
                      ) : trialStart ? (
                        (() => {
                          const elapsed = Math.floor((Date.now() - new Date(trialStart).getTime()) / (1000 * 60 * 60 * 24));
                          const remaining = Math.max(0, FREE_DAYS - elapsed);
                          return remaining > 0 ? (
                            <span className={`text-xs font-semibold ${remaining <= 3 ? 'text-amber-500' : 'text-green-500'}`}>
                              {remaining}d left
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-red-500">Expired</span>
                          );
                        })()
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-xs">
                        <span className="font-bold text-foreground">{(user as any).total_clicks || 0} total</span>
                        <span className="text-muted-foreground text-[10px]">{(user as any).free_clicks_used || 0} free • {(user as any).pro_clicks_used || 0} pro</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="py-1 px-3 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20 inline-block">
                        {(user as any).event_count || 0}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground text-sm">
                      {user.created_at ? format(new Date(user.created_at), "MMM d, yyyy") : "N/A"}
                    </td>
                    {!limitLatest && (
                      <td className="py-3 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDeleteClick(user.id, user.name)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                              title="More actions"
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MoreVertical className="w-4 h-4" />
                              )}
                            </button>
                            {openMenuId === user.id && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden"
                              >
                                {isBanned ? (
                                  <button
                                    onClick={() => handleBanUnban(user.id, user.name, "unban")}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-green-500 hover:bg-green-500/10 transition-colors text-left"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Unban User
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBanUnban(user.id, user.name, "ban")}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors text-left"
                                  >
                                    <Ban className="w-4 h-4" />
                                    Ban User
                                  </button>
                                )}

                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {limitLatest && users && users.length > limitLatest && (
                <tr>
                  <td colSpan={6} className="py-4 px-4">
                    <button
                      onClick={() => navigate("/usermanagement")}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-border hover:bg-secondary/50 hover:border-primary/50 text-muted-foreground hover:text-primary text-sm font-medium transition-all group"
                    >
                      Show all {users.length} users
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AdminDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Profile"
        description="Are you sure you want to delete this user? This will permanently remove their profile and block their email from re-registering."
        itemName={selectedUser?.name}
        loading={isDeleting}
      />
    </div>
  );
};
