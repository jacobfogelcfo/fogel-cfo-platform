/**
 * ClientContext — loads every `clients` row the signed-in user can access.
 *
 * Access set = union of:
 *   - super-admin email match → ALL clients
 *   - client_managers WHERE manager_email = user.email AND is_active = true AND deleted_at IS NULL
 *   - client_members  WHERE user_email   = user.email AND is_active = true AND deleted_at IS NULL
 *
 * Auth resolution queries (eyeball-review per Milestone 1 plan):
 *
 *   -- 1. Super-admin path:
 *   SELECT * FROM clients WHERE deleted_at IS NULL AND is_active = true ORDER BY client_name;
 *
 *   -- 2. Manager-accessible client_ids:
 *   SELECT client_id FROM client_managers
 *   WHERE manager_email = $userEmail AND is_active = true AND deleted_at IS NULL;
 *
 *   -- 3. Member-accessible client_ids:
 *   SELECT client_id FROM client_members
 *   WHERE user_email = $userEmail AND is_active = true AND deleted_at IS NULL;
 *
 *   -- Then, for non-super-admins:
 *   SELECT * FROM clients WHERE id IN (union of 2+3) AND deleted_at IS NULL AND is_active = true;
 *
 * Schema notes (verified against SCHEMA_LIVE.md):
 *   - client_managers matches on `manager_email` (NOT `user_email`).
 *   - client_members  matches on `user_email`   (NOT `member_email`).
 *   - Both tables have `deleted_at` — must filter for soft-deletes.
 *   - clients.client_name is the human-readable name (NOT `name` or `display_name`).
 *   - base_currency / language / direction are top-level columns, NOT inside config JSONB.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CLIENT_ID_STORAGE_KEY, SUPER_ADMIN_EMAILS } from "@/lib/constants";
import type { ClientRow } from "@/lib/db-types";
import { useAuth } from "@/contexts/AuthContext";

const CLIENT_COLUMNS =
  "id, slug, client_name, template_id, config, base_currency, language, direction, is_active, timezone, deleted_at";

async function fetchAccessibleClients(userEmail: string): Promise<ClientRow[]> {
  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail);

  if (isSuperAdmin) {
    const { data, error } = await supabase
      .from("clients")
      .select(CLIENT_COLUMNS)
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("client_name");
    if (error) throw error;
    return (data ?? []) as ClientRow[];
  }

  const [managerRes, memberRes] = await Promise.all([
    supabase
      .from("client_managers")
      .select("client_id")
      .eq("manager_email", userEmail)
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("client_members")
      .select("client_id")
      .eq("user_email", userEmail)
      .eq("is_active", true)
      .is("deleted_at", null),
  ]);

  if (managerRes.error) throw managerRes.error;
  if (memberRes.error) throw memberRes.error;

  const ids = Array.from(
    new Set<string>([
      ...(managerRes.data ?? []).map((r) => r.client_id as string),
      ...(memberRes.data ?? []).map((r) => r.client_id as string),
    ]),
  );

  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("clients")
    .select(CLIENT_COLUMNS)
    .in("id", ids)
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("client_name");
  if (error) throw error;
  return (data ?? []) as ClientRow[];
}

type ClientContextValue = {
  clients: ClientRow[];
  currentClient: ClientRow | null;
  currentClientId: string | null;
  setCurrentClientId: (id: string) => void;
  loading: boolean;
  error: Error | null;
};

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userEmail = user?.email ?? null;

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ["accessible-clients", userEmail],
    queryFn: () => fetchAccessibleClients(userEmail!),
    enabled: !!userEmail,
  });

  const [currentClientId, setCurrentClientIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  // Reconcile the stored id against what the user actually has access to.
  useEffect(() => {
    if (isLoading || clients.length === 0) {
      if (clients.length === 0 && userEmail) setCurrentClientIdState(null);
      return;
    }
    const stillValid = currentClientId && clients.some((c) => c.id === currentClientId);
    if (!stillValid) {
      const first = clients[0].id;
      setCurrentClientIdState(first);
      try {
        localStorage.setItem(CLIENT_ID_STORAGE_KEY, first);
      } catch {
        /* ignore */
      }
    }
  }, [clients, currentClientId, isLoading, userEmail]);

  const setCurrentClientId = useCallback((id: string) => {
    setCurrentClientIdState(id);
    try {
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const currentClient = useMemo(
    () => clients.find((c) => c.id === currentClientId) ?? null,
    [clients, currentClientId],
  );

  // Drive document direction off the active client.
  useEffect(() => {
    const dir = currentClient?.direction === "rtl" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", currentClient?.language ?? "en");
  }, [currentClient]);

  return (
    <ClientContext.Provider
      value={{
        clients,
        currentClient,
        currentClientId,
        setCurrentClientId,
        loading: isLoading,
        error: (error as Error) ?? null,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClient must be used within ClientProvider");
  return ctx;
}
