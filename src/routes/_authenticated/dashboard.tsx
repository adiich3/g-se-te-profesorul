import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, MessageCircle, Video } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/medito/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { getOrCreateConversation } from "@/lib/conversations";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Panoul meu · Medito" },
      {
        name: "description",
        content: "Ședințele și rezervările tale.",
      },
    ],
  }),
  component: StudentDashboard,
});

type StudentBooking = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  subject: string | null;
  notes: string | null;
  status: string;
  tutor_id: string;
  tutor_name: string;
};

function StudentDashboard() {
  const { user, profile } = useAuth();

  const [bookings, setBookings] = useState<StudentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        subject,
        notes,
        status,
        tutor_id
      `)
      .eq("student_id", user.id)
      .order("scheduled_at", { ascending: true });

    if (error) {
      console.error("Student bookings error:", error);
      toast.error("Nu am putut încărca rezervările.");
      setLoading(false);
      return;
    }

    const tutorIds = [...new Set((data ?? []).map((booking) => booking.tutor_id))];

    const { data: tutors, error: tutorsError } = tutorIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", tutorIds)
      : { data: [], error: null };

    if (tutorsError) {
      console.error("Tutor profiles error:", tutorsError);
    }

    const tutorNames = new Map(
      (tutors ?? []).map((tutor) => [
        tutor.id,
        tutor.full_name ?? "Profesor",
      ]),
    );

    setBookings(
      (data ?? []).map((booking) => ({
        ...booking,
        tutor_name: tutorNames.get(booking.tutor_id) ?? "Profesor",
      })),
    );

    setLoading(false);
  }

  useEffect(() => {
    void loadBookings();
  }, [user?.id]);

  const now = Date.now();

  const upcoming = bookings.filter(
    (booking) =>
      new Date(booking.scheduled_at).getTime() >= now &&
      booking.status !== "cancelled" &&
      booking.status !== "completed",
  );

  const past = bookings.filter(
    (booking) =>
      new Date(booking.scheduled_at).getTime() < now ||
      booking.status === "cancelled" ||
      booking.status === "completed",
  );

  const next = upcoming[0];

  async function cancelBooking(id: string) {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("student_id", user!.id);

    if (error) {
      console.error("Cancel booking error:", error);
      toast.error("Rezervarea nu a putut fi anulată.");
      return;
    }

    toast.success("Rezervarea a fost anulată.");
    await loadBookings();
  }

  return (
    <AppShell nav="app">
      <div className="page-container py-8">
        <h1 className="text-3xl">
          Salut, {profile?.full_name ?? "elev"} 👋
        </h1>

        <p className="mt-1.5 text-muted-foreground">
          {loading
            ? "Se încarcă rezervările..."
            : `Ai ${upcoming.length} ședințe programate.`}
        </p>

        {next && (
          <section className="mt-6 rounded-2xl border border-primary/25 bg-primary-soft p-6">
            <p className="text-sm font-semibold text-primary">
              Următoarea ședință
            </p>

            <div className="mt-3 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div>
                <h2 className="text-2xl">
                  {formatBookingDate(next.scheduled_at)}
                </h2>

                <p className="mt-1.5 text-muted-foreground">
                  {next.subject ?? "Meditație"}
                  {next.notes ? ` · ${next.notes}` : ""}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  cu {next.tutor_name} · {next.duration_minutes} min
                </p>

                <div className="mt-3">
                  <BookingStatus status={next.status} />
                </div>
              </div>

              {next.status === "confirmed" && (
                <Button asChild size="lg" className="gap-2">
                  <Link
                    to="/sedinta/$lessonId"
                    params={{ lessonId: next.id }}
                  >
                    <Video className="size-4" />
                    Intră în ședință
                  </Link>
                </Button>
              )}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-xl">Ședințe viitoare</h2>

          {!loading && upcoming.length === 0 && (
            <div className="surface-panel mt-4 p-5">
              <p className="text-sm text-muted-foreground">
                Nu ai nicio ședință programată.
              </p>

              <Button asChild className="mt-4">
                <Link to="/cauta" search={{ q: undefined, azi: undefined }}>
                  Caută profesori
                </Link>
              </Button>
            </div>
          )}

          <ul className="mt-4 space-y-3">
            {upcoming.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onCancel={cancelBooking}
              />
            ))}
          </ul>
        </section>

        {past.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl">Ședințe anterioare</h2>

            <ul className="mt-4 space-y-3">
              {past.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onCancel={cancelBooking}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function BookingRow({
  booking,
  onCancel,
}: {
  booking: StudentBooking;
  onCancel: (id: string) => Promise<void>;
}) {
  const { user } = useAuth();
  const navigate = Route.useNavigate();

  async function openConversation() {
    if (!user) return;

    try {
      const conversationId = await getOrCreateConversation(
        user.id,
        booking.tutor_id,
      );

      await navigate({
        to: "/mesaje/$conversationId",
        params: { conversationId },
      });
    } catch (error) {
      console.error("Open conversation error:", error);
      toast.error("Conversația nu a putut fi deschisă.");
    }
  }
  return (
    <li className="surface-panel grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">
            {formatBookingDate(booking.scheduled_at)}
          </p>

          <BookingStatus status={booking.status} />
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {booking.subject ?? "Meditație"}
          {booking.notes ? ` · ${booking.notes}` : ""}
        </p>

        <p className="mt-0.5 text-sm text-muted-foreground">
          {booking.tutor_name} · {booking.duration_minutes} min
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => void openConversation()}
        >
          <MessageCircle className="size-4" />
          Mesaj
        </Button>

        {booking.status === "confirmed" && (
          <Button asChild size="sm">
            <Link
              to="/sedinta/$lessonId"
              params={{ lessonId: booking.id }}
            >
              Intră în ședință
            </Link>
          </Button>
        )}

        {(booking.status === "pending" ||
          booking.status === "confirmed") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onCancel(booking.id)}
          >
            Anulează
          </Button>
        )}

        {booking.status === "cancelled" && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarClock className="size-4" />
            Anulată
          </span>
        )}
      </div>
    </li>
  );
}

function BookingStatus({ status }: { status: string }) {
  const labels: Record<string, string> = {
    pending: "De confirmat",
    confirmed: "Confirmată",
    completed: "Finalizată",
    cancelled: "Anulată",
  };

  return (
    <Badge variant="outline" className="font-normal">
      {labels[status] ?? status}
    </Badge>
  );
}

function formatBookingDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
