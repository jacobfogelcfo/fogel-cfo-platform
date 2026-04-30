import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export default function NoAccess() {
  const { user, signOut } = useAuth();
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-fc-1">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <ShieldOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="font-display text-xl font-semibold">Account not set up</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account <span className="font-medium text-foreground">{user?.email}</span> isn't
          set up for any client yet. Contact your Fogel CFO admin to be added.
        </p>
        <Button onClick={signOut} variant="outline" className="mt-6 w-full">
          Sign out
        </Button>
      </div>
    </main>
  );
}
