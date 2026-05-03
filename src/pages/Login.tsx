import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ArrowRight } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Login() {
  const { user, loading, signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [devPassword, setDevPassword] = useState("");
  const [devSubmitting, setDevSubmitting] = useState(false);

  async function handleDevPassword(e: React.FormEvent) {
    e.preventDefault();
    const { supabase } = await import("@/lib/supabase");
    setDevSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: devPassword,
    });
    setDevSubmitting(false);
    if (error) toast.error(error.message);
    else toast.success("Signed in.");
  }

  useEffect(() => {
    document.title = "Sign in · Fogel CFO";
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const { error } = await signInWithEmail(email.trim());
    setSubmitting(false);
    if (error) toast.error(error);
    else {
      setSent(true);
      toast.success("Check your email for the sign-in link.");
    }
  }

  async function handleGoogle() {
    const { error } = await signInWithGoogle();
    if (error) toast.error(error);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-fc-2">
            <span className="font-display text-2xl font-bold text-primary-foreground">F</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Fogel CFO Platform</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your client's finances.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-fc-1">
          {!isSupabaseConfigured && (
            <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
              Supabase env vars are not configured. Set <code>VITE_SUPABASE_URL</code> and{" "}
              <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>, then restart the dev server.
            </div>
          )}

          <Button
            onClick={handleGoogle}
            variant="outline"
            className="w-full"
            disabled={!isSupabaseConfigured}
          >
            <svg className="me-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1A6.99 6.99 0 0 1 5.5 12c0-.74.13-1.45.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            OR
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@yourorg.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting || sent || !isSupabaseConfigured}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={submitting || sent || !isSupabaseConfigured}
            >
              {sent ? (
                <>
                  <Mail className="me-2 h-4 w-4" />
                  Magic link sent
                </>
              ) : (
                <>
                  Send magic link
                  <ArrowRight className="ms-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {sent && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Click the link in your email to finish signing in.
            </p>
          )}

          {import.meta.env.DEV && (
            <form onSubmit={handleDevPassword} className="mt-6 space-y-3 border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground">Dev sign-in (password)</p>
              <div className="space-y-1.5">
                <Label htmlFor="dev-password">Password</Label>
                <Input
                  id="dev-password"
                  type="password"
                  autoComplete="current-password"
                  value={devPassword}
                  onChange={(e) => setDevPassword(e.target.value)}
                  disabled={devSubmitting || !isSupabaseConfigured}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={devSubmitting || !email || !devPassword || !isSupabaseConfigured}
              >
                Sign in
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Trouble signing in? Contact your Fogel CFO admin.
        </p>
      </div>
    </main>
  );
}
