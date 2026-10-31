"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { handleChip, handleText, startPackageEnquiry, switchLanguage, welcomeReplies } from "@/lib/chat/flows";
import { t, toLang, type Lang } from "@/lib/chat/i18n";
import {
  initialChatState,
  type BotReply,
  type ChatCard,
  type ChatMessage,
  type ChatState,
  type FlowResult,
} from "@/lib/chat/types";

const STORAGE_KEY = "py_chat_v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // a chat is forgotten after a week of inactivity
const SYNC_DELAY_MS = 2000;
const MAX_SYNC_DELAY_MS = 60_000;
/** After this many failed saves in a row, stop retrying until the visitor sends something new. */
const MAX_SYNC_FAILURES = 6;
/** Messages kept on the device; older ones are dropped once the server has them (it keeps up to 300). */
const MAX_LOCAL_MESSAGES = 100;

interface PendingLead {
  contact: { name: string; phone: string; email?: string };
  leadId?: string;
}

interface StoredChat {
  sessionId: string;
  messages: ChatMessage[];
  state: ChatState;
  syncedCount: number;
  updatedAt: number;
  /** Enquiry details still to be linked to the saved transcript (kept until the server confirms). */
  pendingLead?: PendingLead;
}

type Runner = (state: ChatState) => Promise<FlowResult>;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

const toMessage = (reply: BotReply, role: ChatMessage["role"] = "bot"): ChatMessage => ({
  ...reply,
  id: newId(),
  role,
  createdAt: new Date().toISOString(),
});

const langOf = (chat: StoredChat | null): Lang => toLang(chat?.state.lang);

const freshChat = (lang: Lang = "en", langChosen = false): StoredChat => ({
  sessionId: newId(),
  messages: welcomeReplies(lang).map((r) => toMessage(r)),
  state: initialChatState(lang, langChosen),
  syncedCount: 0,
  updatedAt: Date.now(),
});

const parseStored = (raw: string | null): StoredChat | null => {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as StoredChat;
    if (stored.sessionId && Array.isArray(stored.messages) && Date.now() - stored.updatedAt < MAX_AGE_MS) return stored;
  } catch {
    // corrupted storage: start over
  }
  return null;
};

const loadChat = (): StoredChat => {
  try {
    return parseStored(localStorage.getItem(STORAGE_KEY)) ?? freshChat();
  } catch {
    return freshChat(); // storage blocked (private mode, etc.)
  }
};

const saveChat = (chat: StoredChat) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chat));
  } catch {
    // storage full or blocked: the chat still works for this page view
  }
};

/** Drops the oldest messages beyond the device limit, but only ones the server already has. */
const capMessages = (chat: StoredChat): StoredChat => {
  const extra = chat.messages.length - MAX_LOCAL_MESSAGES;
  const drop = Math.min(Math.max(extra, 0), chat.syncedCount);
  if (drop <= 0) return chat;
  return { ...chat, messages: chat.messages.slice(drop), syncedCount: chat.syncedCount - drop };
};

/** Plain-text version of a message for the saved transcript. */
const transcriptText = (m: ChatMessage) => {
  if (m.cards?.length) return `${m.text}\n${m.cards.map((c) => `- ${c.title}`).join("\n")}`;
  return m.text;
};

const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

export function useChatSession() {
  const [chat, setChat] = useState<StoredChat | null>(null);
  const [busy, setBusy] = useState(false);
  const chatRef = useRef<StoredChat | null>(null);
  const busyRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncFailuresRef = useRef(0);
  /** The step waiting for the visitor to come back online. */
  const pendingOfflineRef = useRef<Runner | null>(null);

  useEffect(() => {
    const loaded = loadChat();
    chatRef.current = loaded;
    setChat(loaded);
  }, []);

  const update = useCallback((next: StoredChat) => {
    const capped = capMessages(next);
    chatRef.current = capped;
    setChat(capped);
    saveChat(capped);
  }, []);

  // The same chat open in another tab: show what happened there instead of overwriting it
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || busyRef.current) return;
      const other = parseStored(event.newValue);
      if (other && other.updatedAt >= (chatRef.current?.updatedAt ?? 0)) {
        chatRef.current = other;
        setChat(other);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const scheduleSyncRef = useRef<(delay?: number) => void>(() => undefined);

  /**
   * Sends messages the server hasn't seen yet. Skipped until the visitor has said or tapped something.
   * Messages only count as saved once the server confirms; anything unconfirmed is re-sent with the
   * next batch (the server ignores message ids it already has, so retries never duplicate).
   */
  const flush = useCallback(() => {
    const current = chatRef.current;
    if (!current) return;
    const pending = current.messages.slice(current.syncedCount);
    const lead = current.pendingLead;
    if (pending.length === 0 && !lead) return;
    if (!current.messages.some((m) => m.role === "user")) return;

    const body = JSON.stringify({
      messages: pending.map((m) => ({
        id: m.id,
        role: m.role,
        kind: m.kind,
        text: transcriptText(m),
        createdAt: m.createdAt,
      })),
      pageUrl: window.location.href,
      ...(lead ? { contact: lead.contact, leadId: lead.leadId } : {}),
    });

    const failed = () => {
      // Back off (2s, 4s, 8s... up to a minute) and give up after a few tries
      syncFailuresRef.current += 1;
      if (syncFailuresRef.current < MAX_SYNC_FAILURES) {
        scheduleSyncRef.current(Math.min(SYNC_DELAY_MS * 2 ** syncFailuresRef.current, MAX_SYNC_DELAY_MS));
      }
    };

    // keepalive lets the request finish even if the visitor is leaving the page
    fetch(`/api/chat/conversations?sessionId=${encodeURIComponent(current.sessionId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) return failed();
        syncFailuresRef.current = 0;
        const latest = chatRef.current;
        if (latest && latest.sessionId === current.sessionId) {
          const firstPendingIndex = latest.messages.findIndex((m) => m.id === pending[0]?.id);
          const syncedUpTo = firstPendingIndex >= 0 ? firstPendingIndex + pending.length : latest.syncedCount;
          update({
            ...latest,
            syncedCount: Math.max(latest.syncedCount, syncedUpTo),
            // keep a lead that arrived while this request was in flight
            pendingLead: latest.pendingLead === lead ? undefined : latest.pendingLead,
          });
        }
      })
      .catch(failed);
  }, [update]);

  const scheduleSync = useCallback(
    (delay = SYNC_DELAY_MS) => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => flush(), delay);
    },
    [flush]
  );
  useEffect(() => {
    scheduleSyncRef.current = scheduleSync;
  }, [scheduleSync]);

  // Save whatever is left when the visitor leaves or hides the page
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      flush();
    };
  }, [flush]);

  /** Runs a flow step and appends its replies (optionally after the visitor's own message). */
  const runStep = useCallback(
    async (run: Runner, userMessage?: ChatMessage, prefix: BotReply[] = []) => {
      const current = chatRef.current;
      if (!current || busyRef.current) return;

      const base = userMessage ? { ...current, messages: [...current.messages, userMessage], updatedAt: Date.now() } : current;
      if (userMessage) update(base);

      // Offline: keep the step and run it as soon as the connection is back
      if (isOffline()) {
        pendingOfflineRef.current = run;
        update({ ...base, messages: [...base.messages, toMessage({ kind: "text", text: t(langOf(base), "offline") })] });
        return;
      }

      busyRef.current = true;
      setBusy(true);
      try {
        const result = await run(base.state);
        const latest = chatRef.current ?? base;
        update({
          ...latest,
          ...(result.lead ? { pendingLead: result.lead } : {}),
          state: result.state,
          messages: [...latest.messages, ...[...prefix, ...result.replies].map((r) => toMessage(r))],
          updatedAt: Date.now(),
        });
      } catch {
        const latest = chatRef.current ?? base;
        if (isOffline()) pendingOfflineRef.current = run;
        update({
          ...latest,
          messages: [...latest.messages, toMessage({ kind: "text", text: t(langOf(latest), isOffline() ? "offline" : "genericError") })],
        });
      } finally {
        busyRef.current = false;
        setBusy(false);
        syncFailuresRef.current = 0; // something new to save: try again even after earlier failures
        scheduleSync();
      }
    },
    [scheduleSync, update]
  );

  // Back online: carry on with the step that was waiting
  useEffect(() => {
    const onOnline = () => {
      const run = pendingOfflineRef.current;
      if (!run) return;
      pendingOfflineRef.current = null;
      void runStep(run, undefined, [{ kind: "text", text: t(langOf(chatRef.current), "backOnline") }]);
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [runStep]);

  /** A tapped chip: shown as the visitor's message, then handled by the flows. */
  const choose = useCallback(
    (action: string, label: string) => runStep((state) => handleChip(action, state), toMessage({ kind: "text", text: label }, "user")),
    [runStep]
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      return runStep((state) => handleText(trimmed, state), toMessage({ kind: "text", text: trimmed.slice(0, 1000) }, "user"));
    },
    [runStep]
  );

  /** "Enquire now" on a package or departure card. */
  const enquire = useCallback(
    (card: ChatCard) =>
      runStep(
        (state) => startPackageEnquiry(card, state),
        toMessage({ kind: "text", text: t(langOf(chatRef.current), "enquireAbout", { title: card.title }) }, "user")
      ),
    [runStep]
  );

  /** The language picker in the chat header. */
  const setLanguage = useCallback(
    (lang: Lang) => {
      if (lang === langOf(chatRef.current) && chatRef.current?.state.langChosen) return;
      return runStep((state) => Promise.resolve(switchLanguage(lang, state)));
    },
    [runStep]
  );

  /** Starts a new conversation (after saving what's left of the current one), in the same language. */
  const reset = useCallback(() => {
    flush();
    pendingOfflineRef.current = null;
    const current = chatRef.current;
    update(freshChat(langOf(current), Boolean(current?.state.langChosen)));
  }, [flush, update]);

  return {
    messages: chat?.messages ?? [],
    leadStep: chat?.state.lead.step ?? null,
    interest: chat?.state.interest,
    lang: langOf(chat),
    ready: chat !== null,
    busy,
    choose,
    send,
    enquire,
    setLanguage,
    reset,
    flush,
  };
}
