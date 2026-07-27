import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/medito/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Autentificare · Medito" },
      {
        name: "description",
        content:
          "Intră în contul Medito sau creează-ți unul, ca elev sau ca profesor.",
      },
      { property: "og:title", content: "Autentificare · Medito" },
      {
        property: "og:description",
        content: "Contul tău Medito pentru meditații 1 la 1.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState<"student" | "tutor">("student");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);

      toast.error("Autentificarea a eșuat", {
        description: error.message,
      });

      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      toast.error("Profilul nu a fost găsit", {
        description: profileError?.message,
      });

      return;
    }

    toast.success("Te-ai autentificat");

    navigate({
      to:
        profile.role === "tutor"
          ? "/profesor-dashboard"
          : "/dashboard",
    });
  }

  async function signup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role,
        },
      },
    });

    if (error) {
      setLoading(false);

      toast.error("Crearea contului a eșuat", {
        description: error.message,
      });

      return;
    }

    if (!data.user) {
      setLoading(false);

      toast.error("Contul nu a fost creat");

      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        email,
        role,
        full_name: name,
      });

    setLoading(false);

    if (profileError) {
      toast.error("Contul a fost creat, dar profilul nu a fost salvat", {
        description: profileError.message,
      });

      return;
    }

    if (!data.session) {
      toast.success("Cont creat", {
        description: "Verifică emailul pentru confirmarea contului.",
      });

      return;
    }

    toast.success("Cont creat");

    navigate({
      to:
        role === "student"
          ? "/onboarding"
          : "/profesor-onboarding",
    });
  }

  return (
    <AppShell footer={false}>
      <div className="page-narrow py-12">
        <h1 className="text-3xl">Bine ai venit la Medito</h1>

        <p className="mt-2 text-muted-foreground">
          Continuă ca elev sau ca profesor.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {(["student", "tutor"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className={`rounded-xl border p-4 text-left transition-colors ${
                role === r
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <p className="font-semibold">
                {r === "student"
                  ? "Sunt elev / student"
                  : "Sunt profesor"}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {r === "student"
                  ? "Caut meditații pentru un obiectiv"
                  : "Vreau să primesc elevi noi"}
              </p>
            </button>
          ))}
        </div>

        <Tabs defaultValue="login" className="mt-8">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">
              Intră în cont
            </TabsTrigger>

            <TabsTrigger value="signup" className="flex-1">
              Creează cont
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form
              onSubmit={login}
              className="surface-panel mt-4 space-y-4 p-6"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>

                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  placeholder="nume@exemplu.ro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Parolă</Label>

                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Se autentifică..." : "Continuă"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form
              onSubmit={signup}
              className="surface-panel mt-4 space-y-4 p-6"
            >
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nume complet</Label>

                <Input
                  id="signup-name"
                  name="name"
                  required
                  placeholder="Andrei Popescu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>

                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  placeholder="nume@exemplu.ro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Parolă</Label>

                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="minim 8 caractere"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Se creează..." : "Creează contul"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            to="/"
            className="hover:text-foreground hover:underline"
          >
            Înapoi la pagina principală
          </Link>
        </p>
      </div>
    </AppShell>
  );
}