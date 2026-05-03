/**
 * M1 placeholder pages — empty shells. Real content lands in M3+.
 */
import { useClient } from "@/contexts/ClientContext";
import { useUserRole } from "@/contexts/UserRoleContext";
import { useClientConfig } from "@/hooks/useClientConfig";
import { Button } from "@/components/ui/button";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  client_manager: "Client Manager",
  local_admin: "Local Admin",
  member: "Member",
  income_reporter: "Income Reporter",
};

function StubShell({
  title,
  subtitle,
  milestone,
}: {
  title: string;
  subtitle: string;
  milestone: string;
}) {
  const { currentClient } = useClient();
  const { role } = useUserRole();
  const { isRTL, base_currency, language } = useClientConfig();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-fc-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">
          Coming in {milestone}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Milestone&nbsp;1 ships the foundation only — auth, contexts, role resolution, and the
          app shell. Data and widgets arrive in later milestones.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Client</dt>
            <dd className="mt-1 font-medium">{currentClient?.client_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Role</dt>
            <dd className="mt-1 font-medium">{role ? ROLE_LABELS[role] : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Currency</dt>
            <dd className="mt-1 font-medium">{base_currency}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Direction</dt>
            <dd className="mt-1 font-medium">
              {isRTL ? "RTL" : "LTR"} · {language.toUpperCase()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { clients } = useClient();
  const { role } = useUserRole();

  if (clients.length === 0 && role === "super_admin") {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Config-driven widgets for admins and local admins.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-10 text-center shadow-fc-1">
          <h2 className="font-display text-xl font-semibold">No clients yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first client to get started.
          </p>
          <Button className="mt-6" disabled>
            Create client
          </Button>
        </div>
      </div>
    );
  }

  return (
    <StubShell
      title="Dashboard"
      subtitle="Config-driven widgets for admins and local admins."
      milestone="Milestone 3"
    />
  );
}

export function MyPage() {
  return (
    <StubShell
      title="My Submissions"
      subtitle="Your assigned projects and uploaded documents."
      milestone="Milestone 2"
    />
  );
}

export function ReportPage() {
  return (
    <StubShell
      title="Report Income"
      subtitle="Submit a donation or income entry."
      milestone="Milestone 5"
    />
  );
}

export function GenericStubPage({ title, milestone }: { title: string; milestone: string }) {
  return (
    <StubShell
      title={title}
      subtitle="Placeholder route — content comes later."
      milestone={milestone}
    />
  );
}
