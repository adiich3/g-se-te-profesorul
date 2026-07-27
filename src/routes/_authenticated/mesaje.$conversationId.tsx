import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/medito/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute(
  "/_authenticated/mesaje/$conversationId",
)({
  head: () => ({
    meta: [
      { title: "Mesaje · Medito" },
      {
        name: "description",
        content: "Conversația ta pe Medito.",
      },
    ],
  }),
  component: ConversationPage,
});

type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  student_id: string;
  tutor_id: string;
};

function ConversationPage() {
  const { conversationId } = Route.useParams();
  const { user } = useAuth();

  const [conversation, setConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherName, setOtherName] = useState("Conversație");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    let active = true;

    async function loadConversation() {
      setLoading(true);

      const { data: conversationData, error: conversationError } =
        await supabase
          .from("conversations")
          .select("id, student_id, tutor_id")
          .eq("id", conversationId)
          .single();

      if (conversationError || !conversationData) {
        console.error("Conversation error:", conversationError);
        toast.error("Conversația nu a putut fi deschisă.");
        setLoading(false);
        return;
      }

      if (!active) return;

      setConversation(conversationData);

      const otherUserId =
        conversationData.student_id === userId
          ? conversationData.tutor_id
          : conversationData.student_id;

      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", otherUserId)
        .single();

      if (active && otherProfile?.full_name) {
        setOtherName(otherProfile.full_name);
      }

      const { data: messageData, error: messageError } =
        await supabase
          .from("messages")
          .select(
            "id, conversation_id, sender_id, content, created_at",
          )
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

      if (messageError) {
        console.error("Messages error:", messageError);
        toast.error("Mesajele nu au putut fi încărcate.");
      } else if (active) {
        setMessages(messageData ?? []);
      }

      if (active) setLoading(false);
    }

    void loadConversation();

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage;

          setMessages((current) => {
            if (current.some((message) => message.id === incoming.id)) {
              return current;
            }

            return [...current, incoming];
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    if (!user || !conversation) return;

    const content = text.trim();

    if (!content) return;

    setSending(true);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content,
      })
      .select(
        "id, conversation_id, sender_id, content, created_at",
      )
      .single();

    setSending(false);

    if (error) {
      console.error("Send message error:", error);
      toast.error("Mesajul nu a fost trimis.");
      return;
    }

    setText("");

    if (data) {
      setMessages((current) => {
        if (current.some((message) => message.id === data.id)) {
          return current;
        }

        return [...current, data];
      });
    }
  }

  return (
    <AppShell nav="app">
      <div className="page-container py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 border-b pb-4">
            <Button asChild variant="ghost" size="icon">
              <Link to="/dashboard">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>

            <div>
              <h1 className="text-xl">{otherName}</h1>
              <p className="text-sm text-muted-foreground">
                Mesaje Medito
              </p>
            </div>
          </div>

          <div className="flex min-h-[32rem] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto py-6">
              {loading && (
                <p className="text-center text-sm text-muted-foreground">
                  Se încarcă mesajele...
                </p>
              )}

              {!loading && messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Nu există mesaje încă. Trimite primul mesaj.
                </p>
              )}

              {messages.map((message) => {
                const mine = message.sender_id === user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        mine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </p>

                      <p
                        className={`mt-1 text-[11px] ${
                          mine
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Intl.DateTimeFormat("ro-RO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(message.created_at))}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={sendMessage}
              className="flex gap-2 border-t pt-4"
            >
              <Input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={`Mesaj pentru ${otherName}`}
                autoComplete="off"
              />

              <Button
                type="submit"
                size="icon"
                disabled={sending || !text.trim()}
                aria-label="Trimite mesajul"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
