/**
 * Placeholder for M2+: gates routes by user role.
 */
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/contexts/UserRoleContext";
import type { ResolvedRole } from "@/lib/db-types";

export function RequireRole({
  roles,
  children,
}: {
  roles: ResolvedRole[];
  children: React.ReactNode;
}) {
  const { role, loading } = useUserRole();
  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!role || !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
