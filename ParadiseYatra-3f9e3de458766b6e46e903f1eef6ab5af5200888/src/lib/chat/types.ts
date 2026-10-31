import type { TourMenuKey } from "@/lib/tourMenus";
import type { Lang } from "./i18n";

export type ChatRole = "user" | "bot";

/** How a message renders; also stored with the transcript. */
export type ChatKind = "text" | "packages" | "faq" | "handoff" | "lead";

/** A tappable chip. `action` is handled by runAction() in flows.ts. */
export interface QuickReply {
  action: string;
  label: string;
}

export interface ChatCard {
  id: string;
  title: string;
  href: string;
  image: string | null;
  price: number;
  priceLabel: string;
  subtitle: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  kind: ChatKind;
  text: string;
  options?: QuickReply[];
  cards?: ChatCard[];
  seeAll?: { label: string; href: string };
  createdAt: string;
}

/** What a flow step produces; the session adds id/role/createdAt. */
export type BotReply = Omit<ChatMessage, "id" | "role" | "createdAt">;

export type LeadStep =
  | "name"
  | "phone"
  | "email"
  | "month"
  | "adults"
  | "children"
  | "budget"
  | "notes"
  | "confirm";

export interface LeadDraft {
  name?: string;
  phone?: string;
  email?: string;
  month?: string;
  adults?: string;
  children?: string;
  budget?: string;
  notes?: string;
}

/** The package or departure an enquiry is about (from a card's "Enquire now" button). */
export interface EnquiryPackage {
  title: string;
  href: string;
  price: number;
  priceLabel: string;
}

/** Which question of "Find a package" is waiting for an answer (so a typed reply can answer it). */
export type FindStep = "tour" | "dest" | "budget" | "duration";

export interface ChatState {
  /** Reply language; missing in chats saved before languages existed (treated as English). */
  lang?: Lang;
  /** The visitor picked the language themselves, so it is never switched automatically. */
  langChosen?: boolean;
  find: {
    step?: FindStep;
    tourType?: TourMenuKey;
    destination?: string;
    budget?: string;
    duration?: string;
    /** Typed budget ("under 25k"): an upper price limit instead of a band. */
    maxPrice?: number;
  };
  lead: {
    step: LeadStep | null;
    draft: LeadDraft;
    package?: EnquiryPackage;
    /** "Cancel this enquiry?" is waiting for a yes/no. */
    confirmCancel?: boolean;
  };
  /** Last destination / package the visitor showed interest in; used in hand-off and enquiry summaries. */
  interest?: string;
  /** Website page for `interest` (package or destination page), saved with the enquiry for the admin panel. */
  interestHref?: string;
  /**
   * Everything the visitor has told us in this chat (name, phone, email, travel month, travellers, budget),
   * even from an enquiry they didn't finish. Every new enquiry starts from it, so nothing is asked twice.
   */
  profile?: Partial<LeadDraft>;
  /** Older chats saved contact details here before `profile` existed; still read for those chats. */
  contact?: { name: string; phone: string; email?: string };
}

export interface FlowResult {
  replies: BotReply[];
  state: ChatState;
  /** Set once an enquiry is submitted, so the transcript can be linked to the lead. */
  lead?: {
    contact: { name: string; phone: string; email?: string };
    leadId?: string;
  };
}

export const initialChatState = (lang: Lang = "en", langChosen = false): ChatState => ({
  lang,
  langChosen,
  find: {},
  lead: { step: null, draft: {} },
});
