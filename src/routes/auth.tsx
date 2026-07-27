import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/medito/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationNote } from "@/components/medito/IntegrationNote";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Autentificare · Medito" },
      {
        name: "description",
        content: "Intră în contul Medito sau creează-ți unul, ca elev sau ca profesor.",
      },
      { property: "og:title", content: "Autentificare · Medito" },
      { property: "og:description", content: "Contul tău Medito pentru meditații 1 la 1." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "tutor">("student");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Cont demo activ", {
      description: "Autentificarea reală se activează odată cu backendul.",
    });
    navigate({ to: role === "student" ? "/onboarding" : "/profesor-onboarding" });
  }

  return (
    <AppShell footer={false}>
      <div className="page-narrow py-12">
        <h1 className="text-3xl">Bine ai venit la Medito</h1>
        <p className="mt-2 text-muted-foreground">Continuă ca elev sau ca profesor.</p>

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
                {r === "student" ? "Sunt elev / student" : "Sunt profesor"}
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
            <form onSubmit={submit} className="surface-panel mt-4 space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="nume@exemplu.ro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass">Parolă</Label>
                <Input id="pass" type="password" required minLength={8} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Continuă
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={submit} className="surface-panel mt-4 space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nume complet</Label>
                <Input id="name" required placeholder="Andrei Popescu" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email2">Email</Label>
                <Input id="email2" type="email" required placeholder="nume@exemplu.ro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass2">Parolă</Label>
                <Input
                  id="pass2"
                  type="password"
                  required
                  minLength={8}
                  placeholder="minim 8 caractere"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Creează contul
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <IntegrationNote className="mt-6" title="Autentificare demonstrativă">
          Conturile, sesiunile și rolurile (elev, profesor, administrator, ulterior părinte) se vor
          conecta la Lovable Cloud. Până atunci poți parcurge tot fluxul cu date demo.
        </IntegrationNote>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground hover:underline">
            Înapoi la pagina principală
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
