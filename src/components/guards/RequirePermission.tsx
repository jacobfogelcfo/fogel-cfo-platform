/**
 * Placeholder for M2+: gates routes by client_members.permissions.pages.
 * super_admin and client_manager always pass.
 */
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/contexts/UserRoleContext";

export function RequirePermission({
  page,
  children,
}: {
  page: string;
  children: React.ReactNode;
}) {
  const { hasPage, loading } = useUserRole();
  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!hasPage(page)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
