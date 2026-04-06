"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
}

interface MessagingPanelProps {
  threadId: string;
  currentUserId: string;
  isHeadhunt?: boolean;
  applicantAccepted?: boolean | null;
}

// ─── Status indicator ─────────────────────────────────────────────────────────

function MessageStatus({ msg }: { msg: Message }) {
  if (msg.readAt) {
    return (
      <span className="flex items-center gap-0.5 text-blue-400" title="Read">
        {/* Double check — blue */}
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
          <path d="M1 5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">Read</span>
      </span>
    );
  }
  if (msg.deliveredAt) {
    return (
      <span className="flex items-center gap-0.5 text-gray-400" title="Delivered">
        {/* Double check — gray */}
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
          <path d="M1 5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">Delivered</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-gray-500" title="Sent">
      {/* Single clock icon */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">Sent</span>
    </span>
  );
}

// ─── Headhunt prompt ──────────────────────────────────────────────────────────

interface HeadhuntPromptProps {
  threadId: string;
  onAccepted: () => void;
  onDeclined: () => void;
}

function HeadhuntPrompt({ threadId, onAccepted, onDeclined }: HeadhuntPromptProps) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setLoading("accept");
    setError(null);
    try {
      const res = await fetch(`/api/messages/threads/${threadId}/accept`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to accept");
      } else {
        onAccepted();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function handleDecline() {
    setLoading("decline");
    setError(null);
    try {
      const res = await fetch(`/api/messages/threads/${threadId}/decline`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to decline");
      } else {
        onDeclined();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 mb-3">
      <p className="text-sm font-medium text-amber-300 mb-1">Headhunt Outreach</p>
      <p className="text-xs text-gray-400 mb-3">
        A recruiter has reached out to you. Accept to start the conversation or decline to block further messages.
      </p>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={loading !== null}
          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading === "accept" ? "Accepting…" : "Accept"}
        </button>
        <button
          onClick={handleDecline}
          disabled={loading !== null}
          className="rounded-lg border border-red-500/40 px-4 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
        >
          {loading === "decline" ? "Declining…" : "Decline"}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MessagingPanel({
  threadId,
  currentUserId,
  isHeadhunt = false,
  applicantAccepted = null,
}: MessagingPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState<boolean | null>(applicantAccepted);
  const [declined, setDeclined] = useState(applicantAccepted === false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch message history
  useEffect(() => {
    fetch(`/api/messages/${threadId}`)
      .then((r) => r.json())
      .then((data: Message[]) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [threadId]);

  // Socket.io real-time events
  useEffect(() => {
    const socket = io(window.location.origin, { path: "/api/socketio" });
    socketRef.current = socket;

    socket.on("message:new", ({ threadId: tid, message }: { threadId: string; message: Message }) => {
      if (tid !== threadId) return;
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("message:delivered", ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, deliveredAt: new Date().toISOString() } : m
        )
      );
    });

    socket.on("message:read", ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, readAt: new Date().toISOString() } : m
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [threadId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error ?? "Failed to send");
      } else {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data as Message];
        });
        setInput("");
      }
    } catch {
      setSendError("Something went wrong");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Headhunt pending: show prompt instead of input (for applicant)
  const showHeadhuntPrompt =
    isHeadhunt && accepted === null && !declined;

  // Input disabled when headhunt is pending or declined
  const inputDisabled = sending || (isHeadhunt && accepted !== true);

  return (
    <div className="flex flex-col h-full min-h-0 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-muted py-8">No messages yet</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    isMine
                      ? "bg-emerald-600 text-white rounded-br-sm"
                      : "bg-gray-700/60 text-gray-100 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                {isMine && (
                  <div className="mt-0.5 flex items-center gap-1 px-1">
                    <MessageStatus msg={msg} />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom area */}
      <div className="border-t border-border dark:border-border-dark p-3">
        {showHeadhuntPrompt ? (
          <HeadhuntPrompt
            threadId={threadId}
            onAccepted={() => setAccepted(true)}
            onDeclined={() => {
              setAccepted(false);
              setDeclined(true);
            }}
          />
        ) : declined ? (
          <p className="text-center text-xs text-muted py-2">
            You declined this outreach. No further messages can be sent.
          </p>
        ) : (
          <>
            {sendError && (
              <p className="text-xs text-red-400 mb-2">{sendError}</p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={inputDisabled}
                rows={1}
                placeholder={inputDisabled ? "Waiting for acceptance…" : "Type a message…"}
                className="flex-1 resize-none rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-foreground placeholder-muted focus:border-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={inputDisabled || !input.trim()}
                className="flex-shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? "…" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
