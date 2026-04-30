/**
 * Placeholder for M2+: gates routes by client config feature flag.
 * Wired up now so route definitions don't need to change later.
 */
import { Navigate } from "react-router-dom";
import { useClientConfig } from "@/hooks/useClientConfig";
import type { ClientConfigFeatures } from "@/lib/db-types";

export function RequireFeature({
  feature,
  children,
}: {
  feature: keyof ClientConfigFeatures;
  children: React.ReactNode;
}) {
  const { has } = useClientConfig();
  if (!has(feature)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
