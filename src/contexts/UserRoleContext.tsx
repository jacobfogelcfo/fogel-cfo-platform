/**
 * UserRoleContext — resolves the signed-in user's role for the currently selected client.
 *
 * Resolution precedence (per spec §4):
 *   1. user.email === SUPER_ADMIN_EMAIL                                  → 'super_admin'
 *   2. client_managers row matching (currentClientId, manager_email)     → 'client_manager'
 *   3. client_members  row matching (currentClientId, user_email)        → role from row
 *   4. otherwise                                                          → null  (no access)
 *
 * Auth resolution queries (eyeball-review per Milestone 1 plan):
 *
 *   -- 1. Manager check:
 *   SELECT id FROM client_managers
 *   WHERE client_id     = $currentClientId
 *     AND manager_email = $userEmail        -- NOTE: manager_email, not user_email
 *     AND is_active     = true
 *     AND deleted_at IS NULL
 *   LIMIT 1;
 *
 *   -- 2. Member check:
 *   SELECT role, permissions FROM client_members
 *   WHERE client_id  = $currentClientId
 *     AND user_email = $userEmail            -- NOTE: user_email, not member_email
 *     AND is_active  = true
 *     AND deleted_at IS NULL
 *   LIMIT 1;
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SUPER_ADMIN_EMAIL } from "@/lib/constants";
import type { ResolvedRole } from "@/lib/db-types";
import { useAuth } from "@/contexts/AuthContext";
import { useClient } from "@/contexts/ClientContext";

type RoleResolution = {
  role: ResolvedRole | null;
  permissions: { pages?: string[] } | null;
};

async function resolveRole(userEmail: string, clientId: string): Promise<RoleResolution> {
  if (userEmail === SUPER_ADMIN_EMAIL) {
    return { role: "super_admin", permissions: null };
  }

  const { data: mgr, error: mgrErr } = await supabase
    .from("client_managers")
    .select("id")
    .eq("client_id", clientId)
    .eq("manager_email", userEmail)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (mgrErr) throw mgrErr;
  if (mgr) return { role: "client_manager", permissions: null };

  const { data: mem, error: memErr } = await supabase
    .from("client_members")
    .select("role, permissions")
    .eq("client_id", clientId)
    .eq("user_email", userEmail)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (memErr) throw memErr;
  if (mem) {
    const role = mem.role as ResolvedRole;
    return {
      role: ["local_admin", "member", "income_reporter"].includes(role) ? role : null,
      permissions: (mem.permissions as { pages?: string[] } | null) ?? null,
    };
  }

  return { role: null, permissions: null };
}

type UserRoleContextValue = {
  role: ResolvedRole | null;
  permissions: { pages?: string[] } | null;
  loading: boolean;
  hasRole: (...roles: ResolvedRole[]) => boolean;
  hasPage: (page: string) => boolean;
};

const UserRoleContext = createContext<UserRoleContextValue | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentClientId } = useClient();
  const userEmail = user?.email ?? null;

  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL;
  // Super admins resolve regardless of currentClientId; everyone else needs one.
  const enabled = !!userEmail && (isSuperAdmin || !!currentClientId);

  const { data, isLoading } = useQuery({
    queryKey: ["user-role", userEmail, currentClientId],
    queryFn: () => resolveRole(userEmail!, currentClientId ?? ""),
    enabled,
  });

  const value = useMemo<UserRoleContextValue>(() => {
    const role = data?.role ?? null;
    const permissions = data?.permissions ?? null;
    return {
      role,
      permissions,
      loading: enabled ? isLoading : false,
      hasRole: (...roles: ResolvedRole[]) => !!role && roles.includes(role),
      hasPage: (page: string) => {
        if (!role) return false;
        // super_admin and client_manager bypass per-page permissions.
        if (role === "super_admin" || role === "client_manager") return true;
        const pages = permissions?.pages;
        if (!pages) return true; // null = no restriction set
        return pages.includes(page);
      },
    };
  }, [data, isLoading, enabled]);

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  const ctx = useContext(UserRoleContext);
  if (!ctx) throw new Error("useUserRole must be used within UserRoleProvider");
  return ctx;
}
