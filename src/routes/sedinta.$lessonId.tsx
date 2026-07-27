import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/sedinta/$lessonId")({
  head: () => ({
    meta: [
      { title: "Sala de curs · Medito" },
      {
        name: "description",
        content: "Ședință online Medito.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LessonRoom,
});

type Booking = {
  id: string;
  student_id: string;
  tutor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  subject: string | null;
  status: string;
};

type SignalPayload = {
  senderId: string;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

const rtcConfiguration: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function LessonRoom() {
  const { lessonId } = Route.useParams();
  const { user } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const makingOfferRef = useRef(false);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [otherName, setOtherName] = useState("Participant");
  const [loading, setLoading] = useState(true);

  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaStarted, setMediaStarted] = useState(false);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  const [remoteConnected, setRemoteConnected] = useState(false);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");

  const [mediaError, setMediaError] = useState<string | null>(null);


  const sendSignal = useCallback(
    async (
      event: "ready" | "offer" | "answer" | "ice",
      payload: Omit<SignalPayload, "senderId"> = {},
    ) => {
      if (!user || !channelRef.current) return;

      console.log(
        `[RTC] SEND ${event} | user=${user.id} | room=${lessonId}`,
        payload,
      );

      await channelRef.current.send({
        type: "broadcast",
        event,
        payload: {
          senderId: user.id,
          ...payload,
        },
      });
    },
    [user],
  );

  const flushPendingCandidates = useCallback(async () => {
    const peer = peerRef.current;

    if (!peer?.remoteDescription) return;

    const candidates = pendingCandidatesRef.current.splice(0);

    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(candidate);
      } catch (error) {
        console.error("ICE candidate error:", error);
      }
    }
  }, []);

  const createOffer = useCallback(async () => {
    const peer = peerRef.current;

    if (!peer || !localStreamRef.current) return;
    if (makingOfferRef.current) return;
    if (peer.signalingState !== "stable") return;

    makingOfferRef.current = true;

    try {
      const offer = await peer.createOffer();

      await peer.setLocalDescription(offer);

      if (peer.localDescription) {
        await sendSignal("offer", {
          description: peer.localDescription.toJSON(),
        });
      }
    } catch (error) {
      console.error("Offer error:", error);
    } finally {
      makingOfferRef.current = false;
    }
  }, [sendSignal]);

  const createPeer = useCallback(() => {
    if (peerRef.current) return peerRef.current;

    const peer = new RTCPeerConnection(rtcConfiguration);
    peerRef.current = peer;

    const localStream = localStreamRef.current;

    if (localStream) {
      for (const track of localStream.getTracks()) {
        peer.addTrack(track, localStream);
      }
    }

    peer.ontrack = (event) => {
      console.log("[RTC] REMOTE TRACK", event.track.kind);
      const remoteStream = event.streams[0];

      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }

      setRemoteConnected(true);
    };

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      void sendSignal("ice", {
        candidate: event.candidate.toJSON(),
      });
    };

    peer.onconnectionstatechange = () => {
      console.log("[RTC] CONNECTION", peer.connectionState);
      setConnectionState(peer.connectionState);

      if (peer.connectionState === "connected") {
        setRemoteConnected(true);
      }

      if (
        peer.connectionState === "failed" ||
        peer.connectionState === "closed"
      ) {
        setRemoteConnected(false);
      }
    };

    return peer;
  }, [sendSignal]);

  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    let active = true;

    async function loadBooking() {
      setLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, student_id, tutor_id, scheduled_at, duration_minutes, subject, status",
        )
        .eq("id", lessonId)
        .single();

      if (!active) return;

      if (error || !data) {
        console.error("Booking room error:", error);
        setBooking(null);
        setLoading(false);
        return;
      }

      if (
        data.student_id !== userId &&
        data.tutor_id !== userId
      ) {
        setBooking(null);
        setLoading(false);
        return;
      }

      setBooking(data);

      const otherUserId =
        data.student_id === userId
          ? data.tutor_id
          : data.student_id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", otherUserId)
        .single();

      if (active && profile?.full_name) {
        setOtherName(profile.full_name);
      }

      if (active) setLoading(false);
    }

    void loadBooking();

    return () => {
      active = false;
    };
  }, [lessonId, user?.id]);

  useEffect(() => {
    if (!user || !booking || booking.status !== "confirmed") return;

    const userId = user.id;

    const channel = supabase.channel(`lesson:${booking.id}`, {
      config: {
        broadcast: {
          self: false,
        },
      },
    });

    channelRef.current = channel;

    channel.on(
      "broadcast",
      { event: "ready" },
      ({ payload }) => {
        const signal = payload as SignalPayload;
        console.log("[RTC] READY RECEIVED", signal);

        if (signal.senderId === userId) return;

        if (booking.student_id === userId && localStreamRef.current) {
          createPeer();
          void createOffer();
        }
      },
    );

    channel.on(
      "broadcast",
      { event: "offer" },
      ({ payload }) => {
        void (async () => {
          const signal = payload as SignalPayload;
          console.log("[RTC] OFFER RECEIVED", signal);

          if (
            signal.senderId === userId ||
            !signal.description ||
            !localStreamRef.current
          ) {
            return;
          }

          try {
            const peer = createPeer();

            await peer.setRemoteDescription(signal.description);
            await flushPendingCandidates();

            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            if (peer.localDescription) {
              await sendSignal("answer", {
                description: peer.localDescription.toJSON(),
              });
            }
          } catch (error) {
            console.error("Offer handling error:", error);
          }
        })();
      },
    );

    channel.on(
      "broadcast",
      { event: "answer" },
      ({ payload }) => {
        void (async () => {
          const signal = payload as SignalPayload;
          console.log("[RTC] ANSWER RECEIVED", signal);

          if (
            signal.senderId === userId ||
            !signal.description
          ) {
            return;
          }

          const peer = peerRef.current;

          if (!peer) return;

          try {
            await peer.setRemoteDescription(signal.description);
            await flushPendingCandidates();
          } catch (error) {
            console.error("Answer handling error:", error);
          }
        })();
      },
    );

    channel.on(
      "broadcast",
      { event: "ice" },
      ({ payload }) => {
        void (async () => {
          const signal = payload as SignalPayload;

          if (
            signal.senderId === userId ||
            !signal.candidate
          ) {
            return;
          }

          const peer = peerRef.current;

          if (!peer || !peer.remoteDescription) {
            pendingCandidatesRef.current.push(signal.candidate);
            return;
          }

          try {
            await peer.addIceCandidate(signal.candidate);
          } catch (error) {
            console.error("ICE handling error:", error);
          }
        })();
      },
    );

    channel.subscribe((status) => {
      console.log(`[RTC] CHANNEL ${status}`);

      if (status === "SUBSCRIBED" && localStreamRef.current) {
        void sendSignal("ready");
      }
    });

    return () => {
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [
    booking,
    user?.id,
    createOffer,
    createPeer,
    flushPendingCandidates,
    sendSignal,
  ]);

  useEffect(() => {
    return () => {
      localStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      peerRef.current?.close();

      localStreamRef.current = null;
      peerRef.current = null;
      pendingCandidatesRef.current = [];
    };
  }, []);

  async function startMedia() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError(
        "Browserul nu oferă acces la cameră și microfon.",
      );
      return;
    }

    setMediaLoading(true);
    setMediaError(null);

    try {
      localStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      peerRef.current?.close();
      peerRef.current = null;
      pendingCandidatesRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setMic(true);
      setCam(true);
      setMediaStarted(true);
      setRemoteConnected(false);
      setConnectionState("new");

      createPeer();

      await sendSignal("ready");

      if (booking?.student_id === user?.id) {
        window.setTimeout(() => {
          void createOffer();
        }, 500);
      }
    } catch (error) {
      console.error("Media permission error:", error);

      const mediaError =
        error instanceof DOMException
          ? `${error.name}: ${error.message}`
          : error instanceof Error
            ? `${error.name}: ${error.message}`
            : String(error);

      console.error("[MEDIA] FAILED:", mediaError);

      setMediaError(`Eroare media: ${mediaError}`);
      toast.error(`Eroare media: ${mediaError}`);
    } finally {
      setMediaLoading(false);
    }
  }

  function toggleMic() {
    const stream = localStreamRef.current;

    if (!stream) return;

    const next = !mic;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });

    setMic(next);
  }

  function toggleCam() {
    const stream = localStreamRef.current;

    if (!stream) return;

    const next = !cam;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });

    setCam(next);
  }

  function stopMedia() {
    localStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    peerRef.current?.close();

    localStreamRef.current = null;
    peerRef.current = null;
    pendingCandidatesRef.current = [];

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setMediaStarted(false);
    setRemoteConnected(false);
    setConnectionState("closed");
    setMic(false);
    setCam(false);
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-foreground/95 text-background">
        <p>Se pregătește sala...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="grid min-h-screen place-items-center bg-foreground/95 p-6 text-center text-background">
        <div>
          <h1 className="text-2xl font-semibold">
            Ședința nu este disponibilă
          </h1>

          <p className="mt-2 text-sm opacity-70">
            Rezervarea nu există sau nu ai acces la această ședință.
          </p>

          <Button asChild variant="secondary" className="mt-6">
            <Link to="/dashboard">
              Mergi la panoul meu
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (booking.status !== "confirmed") {
    return (
      <div className="grid min-h-screen place-items-center bg-foreground/95 p-6 text-center text-background">
        <div>
          <h1 className="text-2xl font-semibold">
            Ședința nu este confirmată
          </h1>

          <p className="mt-2 text-sm opacity-70">
            Statusul rezervării este {booking.status}.
          </p>

          <Button asChild variant="secondary" className="mt-6">
            <Link to="/dashboard">
              Mergi la panoul meu
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-foreground/95 text-background">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {booking.subject ?? "Ședință"} · {otherName}
          </p>

          <p className="text-xs opacity-70">
            {new Intl.DateTimeFormat("ro-RO", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(booking.scheduled_at))}
            {" · "}
            {booking.duration_minutes} min
          </p>
        </div>

        <Badge
          variant="outline"
          className="border-white/25 text-background"
        >
          {remoteConnected
            ? "Conectat"
            : mediaStarted
              ? "Se așteaptă participantul"
              : "Pregătire"}
        </Badge>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-6xl">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />

            {!remoteConnected && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <div>
                  <VideoIcon className="mx-auto size-12 opacity-60" />

                  <h1 className="mt-4 text-xl font-semibold">
                    {!mediaStarted
                      ? "Pregătit pentru ședință"
                      : "Se așteaptă celălalt participant"}
                  </h1>

                  {!mediaStarted && (
                    <>
                      <p className="mt-2 text-sm opacity-70">
                        Pornește camera și microfonul pentru a intra în apel.
                      </p>

                      <Button
                        variant="secondary"
                        className="mt-5 gap-2"
                        disabled={mediaLoading}
                        onClick={() => void startMedia()}
                      >
                        <VideoIcon className="size-4" />

                        {mediaLoading
                          ? "Se pornesc dispozitivele..."
                          : "Intră în apel"}
                      </Button>
                    </>
                  )}

                  {mediaStarted && (
                    <p className="mt-2 text-sm opacity-70">
                      Conexiune: {connectionState}
                    </p>
                  )}
                </div>
              </div>
            )}

            {mediaStarted && (
              <div className="absolute bottom-4 right-4 aspect-video w-40 overflow-hidden rounded-xl border border-white/20 bg-black shadow-lg sm:w-56">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`h-full w-full object-cover ${
                    cam ? "" : "invisible"
                  }`}
                />

                {!cam && (
                  <div className="absolute inset-0 grid place-items-center">
                    <VideoOff className="size-7 opacity-60" />
                  </div>
                )}

                <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs">
                  Tu
                </div>
              </div>
            )}
          </div>

          {mediaError && (
            <p className="mt-3 text-center text-sm text-red-300">
              {mediaError}
            </p>
          )}


        </div>
      </main>

      <footer className="sticky bottom-0 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-black/40 px-4 py-3">
        <Button
          variant="secondary"
          size="lg"
          className="gap-2"
          disabled={!mediaStarted}
          onClick={toggleMic}
        >
          {mic ? (
            <Mic className="size-4" />
          ) : (
            <MicOff className="size-4" />
          )}

          {mic ? "Microfon" : "Mut"}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="gap-2"
          disabled={!mediaStarted}
          onClick={toggleCam}
        >
          {cam ? (
            <VideoIcon className="size-4" />
          ) : (
            <VideoOff className="size-4" />
          )}

          {cam ? "Cameră" : "Camera oprită"}
        </Button>

        <Button
          asChild
          variant="destructive"
          size="lg"
          className="gap-2"
        >
          <Link
            to="/dashboard"
            onClick={stopMedia}
          >
            <PhoneOff className="size-4" />
            Ieși din ședință
          </Link>
        </Button>
      </footer>
    </div>
  );
}
