import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Users, Video, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/medito/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated/profesor-dashboard")({
  head: () => ({
    meta: [
      { title: "Panou profesor · Medito" },
      {
        name: "description",
        content: "Rezervările și elevii profesorului.",
      },
    ],
  }),
  component: TutorDashboard,
});

type TutorBooking = {
  id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  subject: string | null;
  notes: string | null;
  status: string;
  student_name: string;
};

function TutorDashboard() {
  const { user, profile } = useAuth();

  const [bookings, setBookings] = useState<TutorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadBookings() {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        student_id,
        scheduled_at,
        duration_minutes,
        subject,
        notes,
        status
      `)
      .eq("tutor_id", user.id)
      .order("scheduled_at", { ascending: true });

    if (error) {
      console.error("Tutor bookings error:", error);
      toast.error("Nu am putut încărca rezervările.");
      setLoading(false);
      return;
    }

    const studentIds = [
      ...new Set((data ?? []).map((booking) => booking.student_id)),
    ];

    const { data: students, error: studentsError } = studentIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds)
      : { data: [], error: null };

    if (studentsError) {
      console.error("Student profiles error:", studentsError);
    }

    const studentNames = new Map(
      (students ?? []).map((student) => [
        student.id,
        student.full_name ?? "Elev",
      ]),
    );

    setBookings(
      (data ?? []).map((booking) => ({
        ...booking,
        student_name:
          studentNames.get(booking.student_id) ?? "Elev",
      })),
    );

    setLoading(false);
  }

  useEffect(() => {
    void loadBookings();
  }, [user?.id]);

  const upcoming = bookings.filter(
    (booking) =>
      new Date(booking.scheduled_at).getTime() >= Date.now() &&
      booking.status !== "cancelled" &&
      booking.status !== "completed",
  );

  const today = upcoming.filter((booking) => {
    const date = new Date(booking.scheduled_at);
    const now = new Date();

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  });

  const students = useMemo(() => {
    const map = new Map<string, string>();

    bookings
      .filter((booking) => booking.status !== "cancelled")
      .forEach((booking) => {
        map.set(booking.student_id, booking.student_name);
      });

    return [...map.entries()].map(([id, name]) => ({
      id,
      name,
    }));
  }, [bookings]);

  async function updateStatus(
    bookingId: string,
    status: "confirmed" | "cancelled" | "completed",
  ) {
    if (!user) return;

    setUpdatingId(bookingId);

    const { error } = await supabase
      .from("bookings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq("tutor_id", user.id);

    setUpdatingId(null);

    if (error) {
      console.error("Booking update error:", error);
      toast.error("Rezervarea nu a putut fi actualizată.");
      return;
    }

    if (status === "confirmed") {
      toast.success("Rezervarea a fost confirmată.");
    }

    if (status === "cancelled") {
      toast.success("Rezervarea a fost anulată.");
    }

    if (status === "completed") {
      toast.success("Ședința a fost marcată drept finalizată.");
    }

    await loadBookings();
  }

  return (
    <AppShell nav="app">
      <div className="page-container py-8">
        <h1 className="text-3xl">
          Bună, {profile?.full_name ?? "profesor"}
        </h1>

        <p className="mt-1.5 text-muted-foreground">
          {loading
            ? "Se încarcă programul..."
            : `${today.length} ședințe azi · ${students.length} elevi activi`}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <StatCard
            icon={CalendarDays}
            value={String(upcoming.length)}
            label="Ședințe programate"
          />

          <StatCard
            icon={Users}
            value={String(students.length)}
            label="Elevi activi"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section>
            <h2 className="text-xl">Programul apropiat</h2>

            {!loading && upcoming.length === 0 && (
              <div className="surface-panel mt-4 p-5">
                <p className="text-sm text-muted-foreground">
                  Nu ai rezervări viitoare.
                </p>
              </div>
            )}

            <ul className="mt-4 space-y-3">
              {upcoming.map((booking) => (
                <li
                  key={booking.id}
                  className="surface-panel grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {formatBookingDate(booking.scheduled_at)}
                      </p>

                      <BookingStatus status={booking.status} />
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.student_name} ·{" "}
                      {booking.subject ?? "Meditație"}
                    </p>

                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {booking.duration_minutes} min
                      {booking.notes ? ` · ${booking.notes}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="gap-1.5"
                          disabled={updatingId === booking.id}
                          onClick={() =>
                            void updateStatus(
                              booking.id,
                              "confirmed",
                            )
                          }
                        >
                          <Check className="size-4" />
                          Confirmă
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={updatingId === booking.id}
                          onClick={() =>
                            void updateStatus(
                              booking.id,
                              "cancelled",
                            )
                          }
                        >
                          <X className="size-4" />
                          Refuză
                        </Button>
                      </>
                    )}

                    {booking.status === "confirmed" && (
                      <>
                        <Button asChild size="sm" className="gap-1.5">
                          <Link
                            to="/sedinta/$lessonId"
                            params={{ lessonId: booking.id }}
                          >
                            <Video className="size-4" />
                            Începe
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingId === booking.id}
                          onClick={() =>
                            void updateStatus(
                              booking.id,
                              "completed",
                            )
                          }
                        >
                          Finalizează
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside>
            <section className="surface-panel p-5">
              <h2 className="text-lg">Elevii mei</h2>

              {students.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Elevii apar aici după prima rezervare.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {students.map((student) => (
                    <li key={student.id}>
                      <p className="text-sm font-medium">
                        {student.name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
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

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) {
  return (
    <div className="surface-panel flex items-center gap-3 p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" aria-hidden />
      </span>

      <div>
        <p className="font-display text-xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
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
