/**
 * RoleHomeRedirect — used at "/" to send the user to the right home for their role.
 *
 *   super_admin / client_manager / local_admin → /dashboard
 *   member                                     → /my
 *   income_reporter                            → /report
 *   no role                                    → /no-access
 */
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/contexts/UserRoleContext";
import { useClient } from "@/contexts/ClientContext";

export function RoleHomeRedirect() {
  const { role, loading: roleLoading } = useUserRole();
  const { loading: clientLoading, clients } = useClient();

  if (roleLoading || clientLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!role) return <Navigate to="/no-access" replace />;

  switch (role) {
    case "member":
      return <Navigate to="/my" replace />;
    case "income_reporter":
      return <Navigate to="/report" replace />;
    case "super_admin":
    case "client_manager":
    case "local_admin":
    default:
      return <Navigate to="/dashboard" replace />;
  }
}
