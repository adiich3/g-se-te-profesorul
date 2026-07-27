import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Files,
  Mic,
  MicOff,
  MonitorUp,
  MessageSquare,
  PenLine,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { IntegrationNote } from "@/components/medito/IntegrationNote";
import { lessonById, subjectById, tutorById, userById } from "@/lib/demo-data";
import { formatTime } from "@/lib/matching";
import { toast } from "sonner";

export const Route = createFileRoute("/sedinta/$lessonId")({
  head: () => ({
    meta: [
      { title: "Sala de curs · Medito" },
      {
        name: "description",
        content: "Sala de curs Medito: video, chat, materiale, tablă și cronometru.",
      },
      { property: "og:title", content: "Sala de curs · Medito" },
      { property: "og:description", content: "Ședințe online direct în platformă." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LessonRoom,
});

/**
 * Shell UI pentru sala de curs.
 * Zona video este izolată intenționat: la integrarea LiveKit/Daily se
 * înlocuiesc doar `VideoStage` și controalele, restul rămâne neschimbat.
 */
function LessonRoom() {
  const { lessonId } = Route.useParams();
  const lesson = lessonById(lessonId);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [consent, setConsent] = useState(false);

  if (!lesson) {
    return (
      <div className="grid min-h-screen place-items-center bg-foreground/95 p-6 text-center text-background">
        <div>
          <h1 className="text-2xl font-semibold">Ședința nu este disponibilă</h1>
          <p className="mt-2 text-sm opacity-70">Verifică linkul sau întoarce-te la panoul tău.</p>
          <Button asChild variant="secondary" className="mt-6">
            <Link to="/dashboard">Mergi la panoul meu</Link>
          </Button>
        </div>
      </div>
    );
  }
  const tutor = tutorById(lesson.tutorId)!;
  const tutorUser = userById(tutor.userId)!;

  return (
    <div className="flex min-h-screen flex-col bg-foreground/95 text-background">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {subjectById(lesson.subjectId)?.name} · {tutorUser.fullName}
          </p>
          <p className="truncate text-xs opacity-70">
            Început {formatTime(lesson.start)} · durată {lesson.durationMinutes} min
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-white/25 text-background/90">
            {consent ? "Se înregistrează" : "Fără înregistrare"}
          </Badge>
        </div>
      </header>

      <main className="grid flex-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="flex flex-col gap-4">
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-black/40">
            <div className="p-8 text-center">
              <VideoIcon className="mx-auto size-10 opacity-60" aria-hidden />
              <p className="mt-3 font-medium">Zona video</p>
              <p className="mt-1 text-sm opacity-70">
                Se conectează la furnizorul de video (LiveKit sau Daily) în etapa următoare.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            {[tutorUser.fullName, "Tu"].map((name) => (
              <div
                key={name}
                className="flex aspect-video items-center justify-center rounded-xl border border-white/10 bg-black/30 text-sm"
              >
                {name}
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-sm font-semibold">Înregistrare</h2>
            <p className="mt-1 text-xs opacity-70">
              Pornirea necesită acordul explicit al ambilor participanți.
            </p>
            <Button
              variant={consent ? "destructive" : "secondary"}
              size="sm"
              className="mt-3 w-full gap-2"
              onClick={() => {
                setConsent(!consent);
                toast(
                  consent ? "Înregistrare oprită" : "Cerere de acord trimisă celuilalt participant",
                );
              }}
            >
              <Circle className="size-3.5" />{" "}
              {consent ? "Oprește înregistrarea" : "Cere acordul pentru înregistrare"}
            </Button>
          </div>
          <RoomDrawer icon={MessageSquare} label="Chat">
            Mesajele ședinței se vor sincroniza în timp real după activarea backendului.
          </RoomDrawer>
          <RoomDrawer icon={Files} label="Materiale">
            Fișierele încărcate de profesor apar aici și rămân disponibile după ședință.
          </RoomDrawer>
          <RoomDrawer icon={PenLine} label="Tablă colaborativă">
            Tabla comună se activează odată cu integrarea video.
          </RoomDrawer>
        </aside>
      </main>

      <footer className="sticky bottom-0 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-black/40 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Button variant="secondary" size="lg" className="gap-2" onClick={() => setMic(!mic)}>
          {mic ? <Mic className="size-4" /> : <MicOff className="size-4" />}{" "}
          {mic ? "Microfon" : "Mut"}
        </Button>
        <Button variant="secondary" size="lg" className="gap-2" onClick={() => setCam(!cam)}>
          {cam ? <VideoIcon className="size-4" /> : <VideoOff className="size-4" />} Cameră
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="gap-2"
          onClick={() =>
            toast.info("Partajarea ecranului devine disponibilă când sala LiveKit este conectată.")
          }
        >
          <MonitorUp className="size-4" /> Partajează ecranul
        </Button>
        <Button asChild variant="destructive" size="lg" className="gap-2">
          <Link to="/lectie/$lessonId" params={{ lessonId: lesson.id }}>
            <PhoneOff className="size-4" /> Încheie ședința
          </Link>
        </Button>
      </footer>
    </div>
  );
}

function RoomDrawer({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Files;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 border border-white/10 bg-white/5 text-background hover:bg-white/10"
        >
          <Icon className="size-4" /> {label}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetTitle className="px-4 pt-4">{label}</SheetTitle>
        <div className="p-4">
          <IntegrationNote title="Se activează la integrare">{children}</IntegrationNote>
        </div>
      </SheetContent>
    </Sheet>
  );
}
