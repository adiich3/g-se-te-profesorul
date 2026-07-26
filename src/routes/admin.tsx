import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/medito/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrationNote } from "@/components/medito/IntegrationNote";
import { bookings, payments, subjectById, tutors, userById } from "@/lib/demo-data";
import { formatDay, formatRON } from "@/lib/matching";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administrare · Medito" },
      { name: "description", content: "Interfață internă: profesori, rezervări și plăți." },
      { property: "og:title", content: "Administrare · Medito" },
      { property: "og:description", content: "Interfață internă Medito." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <AppShell nav="app">
      <div className="page-container py-8">
        <h1 className="text-3xl">Administrare</h1>
        <p className="mt-1.5 text-muted-foreground">Interfață internă, date demonstrative.</p>

        <IntegrationNote className="mt-6" title="Acces restricționat">
          Rolurile (elev, profesor, administrator) se vor valida pe server, într-un tabel separat de roluri.
        </IntegrationNote>

        <section className="mt-8">
          <h2 className="text-xl">Profesori ({tutors.length})</h2>
          <div className="surface-panel mt-4 divide-y divide-border">
            {tutors.map((t) => (
              <div key={t.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="font-medium">{userById(t.userId)!.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {t.headline} · {t.city} · {formatRON(t.pricePerSession)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.verified ? "secondary" : "outline"} className="font-normal">
                    {t.verified ? "Verificat" : "Neverificat"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {t.verified ? "Retrage" : "Verifică"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl">Rezervări recente</h2>
          <div className="surface-panel mt-4 divide-y divide-border">
            {bookings.map((b) => {
              const pay = payments.find((p) => p.bookingId === b.id);
              return (
                <div key={b.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="font-medium capitalize">{formatDay(b.start)}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {subjectById(b.subjectId)?.name} · {b.topic}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="outline" className="font-normal">
                      {b.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatRON(b.price)} · {pay?.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
