/**
 * useClientConfig — single accessor for everything driven by the active client's settings.
 *
 * Surface (per spec §3):
 *   { features, base_currency, language, direction, dashboard,
 *     has(flag), isRTL, projectLabel, invoiceTypes, refNumberPrefix }
 */
import { useMemo } from "react";
import { useClient } from "@/contexts/ClientContext";
import type { ClientConfigFeatures } from "@/lib/db-types";

export function useClientConfig() {
  const { currentClient } = useClient();

  return useMemo(() => {
    const config = currentClient?.config ?? {};
    const features = (config.features ?? {}) as ClientConfigFeatures;
    const direction = currentClient?.direction === "rtl" ? "rtl" : "ltr";

    return {
      client: currentClient,
      features,
      base_currency: currentClient?.base_currency ?? "USD",
      language: currentClient?.language ?? "en",
      direction,
      isRTL: direction === "rtl",
      dashboard: config.dashboard,
      localAdminDashboard: config.local_admin_dashboard,
      projectLabel: config.project_label ?? "Project",
      invoiceTypes: config.invoice_types ?? [],
      refNumberPrefix: config.ref_number_prefix ?? "INV",
      has: (flag: keyof ClientConfigFeatures) => Boolean(features[flag]),
    };
  }, [currentClient]);
}
