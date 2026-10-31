// Guided conversation flows for the chat assistant.
// runAction() handles chip taps (and actions chosen by the matcher); handleText() handles typed messages.
// Every reply is written in the chat's language (English, Hindi or Hinglish); enquiries sent to the team
// are always summarised in English.

import { DURATIONS, PRICES, matchesDuration } from "@/components/ui/SearchFilterSidebar";
import { fetchTourLocations } from "@/hooks/useTourLocations";
import { fetchUpcomingDepartures } from "@/lib/fixedDepartures";
import { TOUR_MENUS, toLocationSlug, type TourMenuKey } from "@/lib/tourMenus";
import { ChatNetworkError, fetchWithTimeout, searchPackages, toCard, withTimeout } from "./data";
import { COMPANY, companyReply, companyText, companyTopic, type CompanyTopic } from "./company";
import { BUDGET_BAND_LABELS, LANGS, monthChipLabel, t, toLang, type Lang } from "./i18n";
import { detectDestination, faqReply, matchFaq, respondToText } from "./matcher";
import {
  NOT_DECIDED,
  asksWhyContact,
  durationBandFor,
  extractEmail,
  extractPhone,
  hasDevanagari,
  hasPhrase,
  isDecline,
  isEmail,
  isExit,
  isFlexible,
  isNo,
  isSkip,
  isYes,
  looksHinglish,
  looksLikeQuestion,
  normalize,
  parseAmount,
  parseChildren,
  parseDays,
  parseMonth,
  parseName,
  parseTravellers,
  statedName,
} from "./parse";
import { ASSISTANT } from "./persona";
import type { BotReply, ChatCard, ChatState, EnquiryPackage, FlowResult, LeadDraft, LeadStep, QuickReply } from "./types";

const MAX_CARDS = 5;
const MAX_DESTINATION_CHIPS = 10;
/** A typed budget ("under 25k") also shows packages up to 5% above it. */
const BUDGET_TOLERANCE = 1.05;

const L = (state: ChatState): Lang => toLang(state.lang);

/** What the visitor has told us so far in this chat (incl. contact details saved by older chats). */
const knownDetails = (state: ChatState): Partial<LeadDraft> => ({
  ...(state.contact ? { name: state.contact.name, phone: state.contact.phone, email: state.contact.email ?? "" } : {}),
  ...state.profile,
});

/** ", Rahul" / " Rahul" for "Sure, Rahul!" / "Haan ji Rahul!", or "" while we don't know the name yet. */
const who = (state: ChatState) => {
  const first = knownDetails(state).name?.split(" ")[0];
  if (!first) return "";
  return L(state) === "hl" ? ` ${first}` : `, ${first}`;
};
const formatInr = (value: number) => value.toLocaleString("en-IN");
const text = (value: string, options?: QuickReply[]): BotReply => ({ kind: "text", text: value, options });

const menuOptions = (lang: Lang): QuickReply[] => [
  { action: "find", label: t(lang, "chipFind") },
  { action: "fd", label: t(lang, "chipFd") },
  { action: "ask", label: t(lang, "chipAsk") },
  { action: "lead", label: t(lang, "chipLead") },
  { action: "about", label: t(lang, "chipAbout") },
  { action: "handoff", label: t(lang, "chipHandoff") },
];

const afterResults = (lang: Lang): QuickReply[] => [
  { action: "lead", label: t(lang, "chipPlanTrip") },
  { action: "find", label: t(lang, "chipSearchAgain") },
  { action: "menu", label: t(lang, "chipMenu") },
];

const noResults = (lang: Lang): QuickReply[] => [
  { action: "lead", label: t(lang, "chipPlanTrip") },
  { action: "find", label: t(lang, "chipTryAnother") },
  { action: "handoff", label: t(lang, "chipTalkExpert") },
];

// Question topics; each is answered from the FAQs when one matches, never from made-up text
const TOPICS = {
  payment: { label: "topicPayment", keywords: "payment pay advance booking amount emi" },
  cancellation: { label: "topicCancellation", keywords: "cancellation cancel refund" },
  visa: { label: "topicVisa", keywords: "visa passport documents" },
  customise: { label: "topicCustomise", keywords: "customise customize custom itinerary change" },
  group: { label: "topicGroup", keywords: "group fixed departure" },
} as const;

export const welcomeReplies = (lang: Lang = "en"): BotReply[] => [
  text(t(lang, "welcome", { name: ASSISTANT.name })),
  text(t(lang, "welcomeHelp"), menuOptions(lang)),
];

const handoffReply = (lang: Lang): BotReply => ({
  kind: "handoff",
  text: t(lang, "handoff"),
  options: [
    { action: "lead", label: t(lang, "chipCallback") },
    { action: "menu", label: t(lang, "chipMenu") },
  ],
});

/** The server couldn't be reached: say so (rather than "nothing found") and offer a retry. */
const connectionTrouble = (state: ChatState, retryAction: string): FlowResult => ({
  state,
  replies: [
    text(t(L(state), "connection"), [
      { action: retryAction, label: t(L(state), "chipTryAgain") },
      { action: "handoff", label: t(L(state), "chipWhatsapp") },
    ]),
  ],
});

// ---------------------------------------------------------------- language

// Hindi is answered in Hinglish (Roman Hindi), the chat's only non-English option
const LANGUAGE_COMMANDS: Record<string, Lang> = {
  english: "en", "in english": "en", "english please": "en", "english me": "en", "english mein": "en",
  hinglish: "hl", "in hinglish": "hl", "hinglish me": "hl", "hinglish mein": "hl",
  hindi: "hl", "in hindi": "hl", "hindi please": "hl", "hindi me": "hl", "hindi mein": "hl", हिंदी: "hl", "हिंदी में": "hl",
};

/** Changes the reply language and carries on where the visitor was. */
export function switchLanguage(lang: Lang, state: ChatState): FlowResult {
  const next: ChatState = { ...state, lang, langChosen: true, lead: { ...state.lead, confirmCancel: false } };
  const step = next.lead.step;
  const followUp = step ? askStep(step, next).replies : [text(t(lang, "menuShort"), menuOptions(lang))];
  return { state: next, replies: [text(t(lang, "languageSwitched")), ...followUp] };
}

/** Picks up the visitor's language from what they type, unless they chose one themselves. */
const detectLanguage = (input: string, state: ChatState): ChatState => {
  if (state.langChosen) return state;
  // Hindi typed in Devanagari is answered in Hinglish too
  if (L(state) === "en" && (hasDevanagari(input) || looksHinglish(input))) return { ...state, lang: "hl" };
  return state;
};

// ---------------------------------------------------------------- package search

/** The website page for a destination, e.g. /package/india/kerala. */
const destinationHref = (tourType: TourMenuKey | undefined, destination: string | undefined) =>
  tourType && destination ? `${TOUR_MENUS[tourType].basePath}/${toLocationSlug(destination)}` : undefined;

/** Remembers the destination the visitor is looking at (and its page) for the enquiry summary. */
const withInterest = (state: ChatState, tourType: TourMenuKey | undefined, destination: string | undefined): ChatState =>
  destination ? { ...state, interest: destination, interestHref: destinationHref(tourType, destination) } : state;

const budgetChips = (lang: Lang) =>
  PRICES.map((p) => ({ action: `budget:${p.value}`, label: BUDGET_BAND_LABELS[p.value]?.[lang] ?? p.label }));

const durationChips = (lang: Lang) =>
  DURATIONS.map((d) => ({
    action: `duration:${d.value}`,
    label: d.value === "all" ? t(lang, "anyDuration") : t(lang, "daysLabel", { range: d.value }),
  }));

async function showPackages(state: ChatState): Promise<FlowResult> {
  const lang = L(state);
  const { tourType, destination, budget = "all", duration = "all", maxPrice } = state.find;
  const priceBand = PRICES.find((p) => p.value === budget) ?? PRICES[0];

  const packages = (await searchPackages({ tourType, destination })).filter((pkg) => {
    const price = Number(pkg.price) || 0;
    const withinBudget = maxPrice ? price <= maxPrice * BUDGET_TOLERANCE : priceBand.test(price);
    return withinBudget && matchesDuration(pkg.duration || "", duration);
  });

  const where = destination || (tourType ? TOUR_MENUS[tourType].title.replace(" Tour Packages", "") : t(lang, "yourSearch"));
  const nextState = withInterest({ ...state, find: { ...state.find, step: undefined } }, tourType, destination);

  if (packages.length === 0) {
    return { state: nextState, replies: [text(t(lang, "noPackages", { where, who: who(state) }), noResults(lang))] };
  }

  const menu = tourType ? TOUR_MENUS[tourType] : null;
  const shown = Math.min(packages.length, MAX_CARDS);
  const heading =
    packages.length === 1
      ? t(lang, "foundOne", { where, who: who(state) })
      : packages.length <= MAX_CARDS
        ? t(lang, "foundSome", { where, count: packages.length, who: who(state) })
        : t(lang, "foundMany", { where, count: packages.length, shown, who: who(state) });
  const budgetNote = maxPrice ? t(lang, "withinBudget", { amount: formatInr(maxPrice) }) : "";

  return {
    state: nextState,
    replies: [
      {
        kind: "packages",
        text: heading.replace(/:$/, `${budgetNote}:`),
        cards: packages.slice(0, MAX_CARDS).map(toCard),
        seeAll: menu
          ? { label: t(lang, "seeAll"), href: destination ? `${menu.basePath}/${toLocationSlug(destination)}` : menu.basePath }
          : undefined,
        options: afterResults(lang),
      },
    ],
  };
}

async function keywordSearch(query: string, state: ChatState): Promise<FlowResult> {
  const lang = L(state);
  const packages = (await searchPackages({ q: query })).slice(0, MAX_CARDS);
  if (packages.length === 0) {
    return {
      state,
      replies: [
        text(t(lang, "keywordNone"), [
          { action: "find", label: t(lang, "chipFind") },
          { action: "ask", label: t(lang, "chipCommonQuestions") },
          { action: "handoff", label: t(lang, "chipHandoff") },
        ]),
      ],
    };
  }
  return {
    state,
    replies: [{ kind: "packages", text: t(lang, "keywordFound", { query, who: who(state) }), cards: packages.map(toCard), options: afterResults(lang) }],
  };
}

// ---------------------------------------------------------------- enquiry (lead) steps

const nextMonths = (count: number) => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => new Date(now.getFullYear(), now.getMonth() + i, 1));
};

const englishMonth = (date: Date) => date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const LEAD_ORDER: LeadStep[] = ["name", "phone", "email", "month", "adults", "children", "budget", "notes", "confirm"];

/** The draft field each step fills ("" means the visitor skipped an optional one). */
const FIELD: Record<Exclude<LeadStep, "confirm">, keyof LeadDraft> = {
  name: "name",
  phone: "phone",
  email: "email",
  month: "month",
  adults: "adults",
  children: "children",
  budget: "budget",
  notes: "notes",
};

/** The first step after `from` whose answer we don't have yet (details given early are not asked again). */
const nextMissing = (from: LeadStep | null, draft: LeadDraft): LeadStep => {
  const start = from ? LEAD_ORDER.indexOf(from) + 1 : 0;
  for (const step of LEAD_ORDER.slice(start)) {
    if (step === "confirm" || draft[FIELD[step]] === undefined) return step;
  }
  return "confirm";
};

const LEAD_PROMPTS: Record<Exclude<LeadStep, "confirm">, (state: ChatState) => BotReply> = {
  name: (state) =>
    text(state.lead.package ? t(L(state), "askNameForPackage", { title: state.lead.package.title }) : t(L(state), "askName")),
  phone: (state) => text(t(L(state), "askPhone", { name: state.lead.draft.name ?? "" }).replace(", !", "!")),
  email: (state) =>
    state.lead.draft.phone === ""
      ? text(t(L(state), "askEmailInstead"), noPhoneChips(L(state)))
      : text(t(L(state), "askEmail"), [{ action: "lead:skip", label: t(L(state), "skip") }]),
  month: (state) =>
    text(t(L(state), "askMonth"), [
      ...nextMonths(6).map((d) => ({ action: `lead:month|${englishMonth(d)}`, label: monthChipLabel(d) })),
      { action: `lead:month|${NOT_DECIDED}`, label: t(L(state), "notDecided") },
    ]),
  adults: (state) =>
    text(t(L(state), "askAdults"), ["1", "2", "3", "4", "5", "6+"].map((n) => ({ action: `lead:adults|${n}`, label: n }))),
  children: (state) =>
    text(
      t(L(state), "askChildren"),
      ["0", "1", "2", "3", "4+"].map((n) => ({ action: `lead:children|${n}`, label: n === "0" ? t(L(state), "noChildren") : n }))
    ),
  budget: (state) =>
    text(
      t(L(state), "askBudget"),
      PRICES.map((p) => ({
        // The team always receives the English label
        action: `lead:budget|${p.value === "all" ? "Flexible" : p.label}`,
        label: p.value === "all" ? t(L(state), "flexible") : BUDGET_BAND_LABELS[p.value]?.[L(state)] ?? p.label,
      }))
    ),
  notes: (state) =>
    text(t(L(state), state.lead.package ? "askNotesPackage" : "askNotes"), [{ action: "lead:skip", label: t(L(state), "skip") }]),
};

const travellersLabel = (d: LeadDraft, lang: Lang) => {
  const adults = d.adults ? (d.adults === "1" ? t(lang, "oneAdult") : t(lang, "adultsCount", { n: d.adults })) : "";
  const children =
    d.children && d.children !== "0" ? (d.children === "1" ? t(lang, "oneChild") : t(lang, "childrenCount", { n: d.children })) : "";
  return [adults, children].filter(Boolean).join(", ") || t(lang, "notGiven");
};

const confirmReply = (state: ChatState): BotReply => {
  const lang = L(state);
  const d = state.lead.draft;
  const pkg = state.lead.package;
  return text(
    [
      t(lang, "checkDetails"),
      pkg ? `• ${t(lang, "fPackage")}: ${pkg.title}` : "",
      `• ${t(lang, "fName")}: ${d.name || t(lang, "notShared")}`,
      `• ${t(lang, "fPhone")}: ${d.phone || t(lang, "notShared")}`,
      d.email ? `• ${t(lang, "fEmail")}: ${d.email}` : "",
      `• ${t(lang, "fMonth")}: ${d.month === NOT_DECIDED ? t(lang, "notDecided") : d.month}`,
      `• ${t(lang, "fTravellers")}: ${travellersLabel(d, lang)}`,
      `• ${t(lang, "fBudget")}: ${d.budget === "Flexible" ? t(lang, "flexible") : d.budget}`,
      d.notes ? `• ${t(lang, "fNotes")}: ${d.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    [
      { action: "lead:submit", label: t(lang, "sendEnquiry") },
      { action: "lead:restart", label: t(lang, "startOver") },
      { action: "lead:cancel", label: t(lang, "cancel") },
    ]
  );
};

const askStep = (step: LeadStep, state: ChatState): FlowResult => ({
  state: { ...state, lead: { ...state.lead, step, confirmCancel: false } },
  replies: [step === "confirm" ? confirmReply(state) : LEAD_PROMPTS[step](state)],
});

/** Saves an answer and moves on to the next question we don't have an answer for yet. */
const answer = (state: ChatState, patch: Partial<LeadDraft>): FlowResult => {
  const next = withDraft(state, patch);
  return askStep(nextMissing(state.lead.step, next.lead.draft), next);
};

const withDraft = (state: ChatState, patch: Partial<LeadDraft>): ChatState => {
  const remembered = { ...patch };
  delete remembered.notes;
  // A declined name/phone isn't "known"; an empty email is only remembered when we have a phone instead
  if (remembered.name === "") delete remembered.name;
  if (remembered.phone === "") delete remembered.phone;
  if (remembered.email === "" && !(state.lead.draft.phone || knownDetails(state).phone)) delete remembered.email;
  return {
    ...state,
    profile: { ...knownDetails(state), ...remembered },
    lead: { ...state.lead, draft: { ...state.lead.draft, ...patch } },
  };
};

/** "Rahul, +919876543210, March 2027" for the "I already have your details" line. */
const describeKnown = (known: Partial<LeadDraft>) =>
  [known.name, known.phone, known.month && known.month !== NOT_DECIDED ? known.month : ""].filter(Boolean).join(", ");

/**
 * Starts an enquiry from everything the visitor already told us in this chat (even in an enquiry they
 * didn't finish), so only the missing questions are asked.
 */
const startEnquiry = (state: ChatState, pkg?: EnquiryPackage, prefill: Partial<LeadDraft> = {}): FlowResult => {
  const lang = L(state);
  const known = { ...knownDetails(state), ...prefill };
  const base: ChatState = { ...state, profile: known, find: {}, lead: { step: null, draft: { ...known }, package: pkg } };
  const next = askStep(nextMissing(null, base.lead.draft), base);

  const details = describeKnown(known);
  if (!details || !(known.name || known.phone)) return next;
  const prompt = next.replies[0];
  // One message, because chips only show under the latest bot message
  return {
    ...next,
    replies: [
      {
        ...prompt,
        text: `${pkg ? `${t(lang, "enquiryFor", { title: pkg.title })} ` : ""}${t(lang, "reuseContact", { details })}\n\n${prompt.text}`,
        options: [...(prompt.options ?? []), { action: "lead:newdetails", label: t(lang, "useDifferentDetails") }],
      },
    ],
  };
};

/** "Enquire now" on a package or departure card. */
export function startPackageEnquiry(card: ChatCard, state: ChatState): Promise<FlowResult> {
  const pkg: EnquiryPackage = { title: card.title, href: card.href, price: card.price, priceLabel: card.priceLabel };
  return Promise.resolve(startEnquiry({ ...state, interest: card.title, interestHref: card.href }, pkg));
}

/** "I'm not comfortable sharing my number": stop asking, stay friendly, point to the details and packages. */
const declineContact = (state: ChatState): FlowResult => {
  const lang = L(state);
  const pkg = state.lead.package;
  const href = pkg?.href || state.interestHref || "/package";
  return {
    state: { ...state, find: {}, lead: { step: null, draft: {} } },
    replies: [
      {
        kind: "text",
        text: t(lang, "decline", OUR_CONTACT),
        seeAll: { label: pkg || state.interestHref ? t(lang, "viewPackageDetails") : t(lang, "browseAllPackages"), href },
        options: [
          { action: "find", label: t(lang, "chipBrowse") },
          { action: "fd", label: t(lang, "chipFd") },
          { action: "handoff", label: t(lang, "chipWhatsapp") },
        ],
      },
    ],
  };
};

/** Choices under "share your email instead?": change their mind about the number, or skip email too. */
const noPhoneChips = (lang: Lang): QuickReply[] => [
  { action: "lead:sharephone", label: t(lang, "chipShareNumber") },
  { action: "lead:noemail", label: t(lang, "chipNoEmail") },
];

const OUR_CONTACT = { ourPhone: COMPANY.phone, ourEmail: COMPANY.email };

/** No phone and no email: we can't reply, so give our contact details and let them browse. */
const contactDirectly = (state: ChatState): FlowResult => {
  const lang = L(state);
  const pkg = state.lead.package;
  const href = pkg?.href || state.interestHref || "/package";
  return {
    state: { ...state, find: {}, lead: { step: null, draft: {} } },
    replies: [
      {
        kind: "handoff",
        text: t(lang, "contactDirectly", OUR_CONTACT),
        seeAll: { label: pkg || state.interestHref ? t(lang, "viewPackageDetails") : t(lang, "browseAllPackages"), href },
        options: [
          { action: "find", label: t(lang, "chipBrowse") },
          { action: "fd", label: t(lang, "chipFd") },
          { action: "menu", label: t(lang, "chipMenu") },
        ],
      },
    ],
  };
};

/** Puts a line ("No problem, let's skip that.") in front of the next question, in the same message. */
const prefixed = (result: FlowResult, line: string): FlowResult => {
  const [first, ...rest] = result.replies;
  return first ? { ...result, replies: [{ ...first, text: `${line}\n\n${first.text}` }, ...rest] } : result;
};

/**
 * The visitor won't share the current detail. Stay friendly and keep the enquiry going:
 * no name → carry on without it; no phone → give our number and ask for email instead;
 * no email either → our contact details; anything optional → skip it.
 */
const declineStep = (state: ChatState): FlowResult => {
  const lang = L(state);
  const step = state.lead.step;
  const d = state.lead.draft;

  switch (step) {
    case "name":
      return prefixed(answer(state, { name: "" }), t(lang, "declineName"));
    case "phone": {
      if (d.email) return prefixed(answer(state, { phone: "" }), t(lang, "declinePhoneHaveEmail", OUR_CONTACT));
      const next = withDraft(state, { phone: "" });
      return {
        state: { ...next, lead: { ...next.lead, step: "email", confirmCancel: false } },
        replies: [text(t(lang, "declinePhone", OUR_CONTACT), noPhoneChips(lang))],
      };
    }
    case "email":
      if (!d.phone) return contactDirectly(state);
      return prefixed(answer(state, { email: "" }), t(lang, "declineOptional"));
    case "confirm":
    case null:
      return declineContact(state);
    default:
      return prefixed(answer(state, { [FIELD[step]]: "" }), t(lang, "declineOptional"));
  }
};

const cancelEnquiry = (state: ChatState): FlowResult => ({
  state: { ...state, lead: { step: null, draft: {} } },
  replies: [text(t(L(state), "cancelled"), menuOptions(L(state)))],
});

const confirmCancelPrompt = (state: ChatState): FlowResult => ({
  state: { ...state, lead: { ...state.lead, confirmCancel: true } },
  replies: [
    text(t(L(state), "confirmCancel"), [
      { action: "lead:cancel", label: t(L(state), "yesCancel") },
      { action: "lead:resume", label: t(L(state), "noContinue") },
    ]),
  ],
});

/** Repeats the current question after a side-answer, in one message so its chips stay visible. */
const continueWith = (state: ChatState, lead: string): FlowResult => {
  const prompt = askStep(state.lead.step!, state);
  const reply = prompt.replies[0];
  return { ...prompt, replies: [{ ...reply, text: `${lead}\n\n${t(L(state), "letsContinue")}\n${reply.text}` }] };
};

async function handleLeadInput(input: string, state: ChatState): Promise<FlowResult> {
  const lang = L(state);
  const step = state.lead.step!;
  const d = state.lead.draft;
  const value = input.trim();

  if (!LEAD_ORDER.includes(step)) {
    // A step from an older version of the chat (saved in the visitor's browser): start the enquiry again
    return startEnquiry(state, state.lead.package);
  }

  // Waiting for "Cancel this enquiry?"
  if (state.lead.confirmCancel) {
    if (isYes(value) || isExit(value)) return cancelEnquiry(state);
    const resumed: ChatState = { ...state, lead: { ...state.lead, confirmCancel: false } };
    if (isNo(value)) return continueWith(resumed, t(lang, "continueEnquiry"));
    return handleLeadInput(input, resumed);
  }

  if (isExit(value)) return step === "confirm" ? cancelEnquiry(state) : confirmCancelPrompt(state);
  if (isDecline(value)) return declineStep(state);

  if ((step === "phone" || step === "email") && asksWhyContact(value)) {
    return {
      state,
      replies: [
        text(t(lang, "whyContact"), [
          { action: "lead:resume", label: t(lang, "shareNumber") },
          { action: "lead:decline", label: t(lang, "notComfortable") },
        ]),
      ],
    };
  }

  // A question about the company mid-form ("where is your office?"): answer it, then repeat the question.
  // Checked before reading the answer, so "office address" is never saved as a name.
  const topic = step !== "notes" && step !== "confirm" ? companyTopic(value) : null;
  if (topic && !extractPhone(value) && !isEmail(value)) return continueWith(state, companyText(topic, lang));

  // Any other question in the middle of the form: answer it if we can, then repeat the current question
  if (step !== "notes" && step !== "confirm" && looksLikeQuestion(value) && !extractPhone(value) && !isEmail(value)) {
    const match = await matchFaq(value);
    const side = match && match.score >= 0.4 ? match.faq.answer : t(lang, "questionMidEnquiry");
    return continueWith(state, side);
  }

  switch (step) {
    case "name": {
      const parsed = parseName(value);
      const extras: Partial<LeadDraft> = {};
      if (parsed.phone) extras.phone = parsed.phone;
      if (parsed.email) extras.email = parsed.email;
      if (parsed.name) return answer(state, { name: parsed.name, ...extras });
      const kept = withDraft(state, extras);
      const problem = parsed.problem === "sentence" ? "nameSentence" : parsed.problem === "digits" ? "nameDigits" : "nameEmpty";
      return { state: kept, replies: [text(t(lang, problem))] };
    }
    case "phone": {
      const found = extractPhone(value);
      if (found) {
        const email = extractEmail(value);
        return answer(state, { phone: found.phone, ...(email ? { email } : {}) });
      }
      const email = extractEmail(value);
      if (email) return { state: withDraft(state, { email }), replies: [text(t(lang, "emailSavedAskPhone"))] };
      return { state, replies: [text(t(lang, "phoneInvalid"))] };
    }
    case "email":
      if (isSkip(value)) return d.phone ? answer(state, { email: "" }) : contactDirectly(state);
      if (isEmail(value)) return answer(state, { email: value.toLowerCase().slice(0, 120) });
      {
        const email = extractEmail(value);
        if (email) return answer(state, { email });
      }
      return {
        state,
        replies: [text(t(lang, "emailInvalid"), d.phone ? [{ action: "lead:skip", label: t(lang, "skip") }] : noPhoneChips(lang))],
      };
    case "month": {
      const parsed = parseMonth(value);
      if (parsed && "past" in parsed) return { state, replies: [{ ...LEAD_PROMPTS.month(state), text: t(lang, "monthPast") }] };
      if (parsed) return answer(state, { month: parsed.month });
      // Something we can't read as a month ("after Diwali"): keep the visitor's words for the team
      if (value.length >= 3) return answer(state, { month: value.slice(0, 60) });
      return { state, replies: [LEAD_PROMPTS.month(state)] };
    }
    case "adults": {
      const { adults, children } = parseTravellers(value);
      const count = adults ?? (children === undefined ? parseTravellersCount(value) : undefined);
      if (count === undefined || count < 1 || count > 50) return { state, replies: [text(t(lang, "adultsInvalid"))] };
      return answer(state, { adults: String(count), ...(children !== undefined ? { children: String(children) } : {}) });
    }
    case "children": {
      const children = parseChildren(value);
      if (children === null || children < 0 || children > 50) return { state, replies: [text(t(lang, "childrenInvalid"))] };
      return answer(state, { children: String(children) });
    }
    case "budget": {
      if (isFlexible(value)) return answer(state, { budget: "Flexible" });
      const amount = parseAmount(value);
      if (amount) return answer(state, { budget: `Up to ₹${formatInr(amount)}` });
      if (value.length >= 2 && /\p{L}/u.test(value)) return answer(state, { budget: value.slice(0, 60) });
      return { state, replies: [text(t(lang, "budgetInvalid"))] };
    }
    case "notes":
      return answer(state, { notes: isSkip(value) ? "" : value.slice(0, 500) });
    case "confirm":
      if (isYes(value) || hasPhrase(normalize(value), ["send", "submit", "bhejo", "bhej do", "भेजो"])) return submitLead(state);
      return { state, replies: [text(t(lang, "useButtons"))] };
  }
}

/** A bare number of travellers ("4", "four", "char"). */
const parseTravellersCount = (value: string) => {
  const digits = normalize(value).match(/\d+/);
  if (digits) return parseInt(digits[0], 10);
  const parsed = parseChildren(value);
  return parsed === null || parsed === 0 ? undefined : parsed;
};

async function submitLead(state: ChatState): Promise<FlowResult> {
  const lang = L(state);
  const d = state.lead.draft;
  const pkg = state.lead.package;
  if (d.name === undefined) return startEnquiry(state, pkg, d);
  if (!d.phone && !d.email) return contactDirectly(state);

  const languageName = LANGS.find((l) => l.value === lang)?.label;
  const message = [
    "Enquiry from the website chat assistant.",
    pkg ? `Package: ${pkg.title} (${pkg.href})` : state.interest ? `Interested in: ${state.interest}` : "",
    `Travel month: ${d.month || "Not given"}`,
    `Adults: ${d.adults || "Not given"}`,
    `Children: ${d.children || "0"}`,
    `Budget per person: ${d.budget || "Not given"}`,
    d.notes ? `Notes: ${d.notes}` : "",
    lang !== "en" ? `Chat language: ${languageName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const errorReply: FlowResult = {
    state,
    replies: [
      text(t(lang, "submitError"), [
        { action: "lead:submit", label: t(lang, "chipTryAgain") },
        { action: "handoff", label: t(lang, "chipTalkExpert") },
      ]),
    ],
  };

  let res: Response;
  try {
    res = await fetchWithTimeout(
      "/api/lead-capture",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: d.name || "Guest (name not shared)",
          phone: d.phone || "",
          email: d.email || "",
          destination: state.interest || d.notes || "",
          destinationUrl: pkg?.href || state.interestHref || "",
          budget: d.budget || "",
          departureDate: d.month || "",
          packageTitle: pkg?.title,
          packagePrice: pkg && pkg.price > 0 ? `₹${formatInr(pkg.price)} ${pkg.priceLabel}` : undefined,
          message,
          source: "chatbot",
          newsletterConsent: false,
          timestamp: new Date().toISOString(),
        }),
      },
      12000
    );
  } catch {
    return errorReply;
  }

  const contact = { name: d.name || "Guest", phone: d.phone || "", email: d.email || undefined };
  const done = (key: "submitted" | "duplicate" | "tooMany", kind: BotReply["kind"] = "lead"): FlowResult => ({
    state: { ...state, profile: knownDetails(state), lead: { step: null, draft: {} } },
    replies: [
      {
        kind,
        text:
          key === "submitted" && !d.phone
            ? t(lang, "submittedByEmail", { who: who(state), email: d.email ?? "", ourPhone: COMPANY.phone })
            : t(lang, key, { who: who(state), phone: d.phone || d.email || "" }),
        options: [
          { action: "find", label: t(lang, "chipBrowse") },
          { action: "menu", label: t(lang, "chipMenu") },
        ],
      },
    ],
  });

  if (res.status === 429) return { ...done("tooMany", "handoff"), lead: undefined };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return errorReply;
  if (data?.duplicate) return { ...done("duplicate"), lead: { contact, leadId: data?.leadId } };
  return { ...done("submitted"), lead: { contact, leadId: data?.leadId } };
}

// ---------------------------------------------------------------- "Find a package" typed answers

const INDIA_WORDS = ["india", "indian", "domestic", "bharat", "desh", "within india", "india mein", "भारत", "देश", "इंडिया"];
const ABROAD_WORDS = ["international", "abroad", "foreign", "overseas", "videsh", "bahar", "outside india", "विदेश", "बाहर"];

/** A typed answer to the current "Find a package" question, or null to treat it as a fresh message. */
async function handleFindInput(input: string, state: ChatState): Promise<FlowResult | null> {
  const norm = normalize(input);
  const step = state.find.step;

  if (step === "tour") {
    const destination = await detectDestination(input);
    if (destination) return runAction(`go:${destination.tourType}|${destination.name}||`, state);
    if (hasPhrase(norm, ABROAD_WORDS)) return runAction("tour:international", state);
    if (hasPhrase(norm, INDIA_WORDS)) return runAction("tour:india", state);
    return null;
  }

  if (step === "dest") {
    if (isFlexible(input)) return runAction("dest:", state);
    const destination = await detectDestination(input);
    if (!destination) return null;
    const moved: ChatState = { ...state, find: { ...state.find, tourType: destination.tourType } };
    // "kerala under 25k for 5 days" answers the next questions too
    const amount = parseAmount(input);
    const days = parseDays(input);
    if (amount || days) {
      return runAction(`go:${destination.tourType}|${destination.name}|${amount ?? ""}|${days ?? ""}`, moved);
    }
    return runAction(`dest:${destination.name}`, moved);
  }

  if (step === "budget") {
    if (isFlexible(input)) return runAction("budget:all", state);
    const amount = parseAmount(input);
    if (!amount) return null;
    const days = parseDays(input);
    const withBudget: ChatState = { ...state, find: { ...state.find, budget: "all", maxPrice: amount } };
    if (days) return runAction(`duration:${durationBandFor(days)}`, withBudget);
    return runAction("budget:all", withBudget);
  }

  if (step === "duration") {
    if (isFlexible(input)) return runAction("duration:all", state);
    const days = parseDays(input) ?? (/^\d{1,2}$/.test(norm) ? parseInt(norm, 10) : null);
    if (!days) return null;
    return runAction(`duration:${durationBandFor(days)}`, state);
  }
  return null;
}

// ---------------------------------------------------------------- public API

async function runActionUnsafe(action: string, state: ChatState): Promise<FlowResult> {
  const lang = L(state);
  const [name, arg = ""] = action.split(/:(.*)/s);

  switch (name) {
    case "menu":
      return {
        state: { ...state, find: {}, lead: { step: null, draft: {} } },
        // "quiet": the chips go under the greeting just shown, without another question
        replies: [text(arg === "quiet" ? "" : t(lang, "menuPrompt"), menuOptions(lang))],
      };

    case "find":
      return {
        state: { ...state, find: { step: "tour" }, lead: { step: null, draft: {} } },
        replies: [
          text(t(lang, "whereToGo"), [
            { action: "tour:india", label: t(lang, "withinIndia") },
            { action: "tour:international", label: t(lang, "international") },
          ]),
        ],
      };

    case "tour": {
      const tourType = arg as TourMenuKey;
      const locations = await withTimeout(fetchTourLocations());
      const names = tourType === "india" ? locations.indiaStates : locations.internationalCountries;
      return {
        state: { ...state, find: { step: "dest", tourType } },
        replies: [
          text(t(lang, tourType === "india" ? "whichState" : "whichCountry"), [
            ...names.slice(0, MAX_DESTINATION_CHIPS).map((n) => ({ action: `dest:${n}`, label: n })),
            { action: "dest:", label: t(lang, "anyDestination") },
          ]),
        ],
      };
    }

    case "dest":
      return {
        state: withInterest({ ...state, find: { ...state.find, step: "budget", destination: arg || undefined } }, state.find.tourType, arg),
        replies: [text(t(lang, "budgetPrompt"), budgetChips(lang))],
      };

    case "budget":
      return {
        state: { ...state, find: { ...state.find, step: "duration", budget: arg } },
        replies: [text(t(lang, "daysPrompt"), durationChips(lang))],
      };

    case "duration":
      return showPackages({ ...state, find: { ...state.find, duration: arg } });

    case "go": {
      // Destination detected in typed text: search straight away (optionally with a budget and length)
      const [tourType, destination, maxPrice, days] = arg.split("|");
      return showPackages({
        ...state,
        find: {
          tourType: tourType as TourMenuKey,
          destination,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          duration: days ? durationBandFor(Number(days)) : "all",
        },
      });
    }

    case "q":
      return keywordSearch(arg, state);

    case "fd": {
      const departures = await withTimeout(fetchUpcomingDepartures(MAX_CARDS));
      if (departures.length === 0) return { state, replies: [text(t(lang, "fdNone"), noResults(lang))] };
      return {
        state,
        replies: [
          {
            kind: "packages",
            text: t(lang, "fdFound", { who: who(state) }),
            cards: departures.map((d) => ({
              id: d.id,
              title: d.title,
              href: `/fixed-departures/${d.slug}`,
              image: d.image,
              price: d.price,
              priceLabel: t(lang, "perPerson"),
              subtitle: [
                new Date(d.departureDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                d.duration,
              ]
                .filter(Boolean)
                .join(" · "),
            })),
            seeAll: { label: t(lang, "seeAllDepartures"), href: "/fixed-departures" },
            options: afterResults(lang),
          },
        ],
      };
    }

    case "ask":
      return {
        state,
        replies: [
          text(
            t(lang, "askPrompt"),
            Object.entries(TOPICS).map(([key, topic]) => ({ action: `topic:${key}`, label: t(lang, topic.label) }))
          ),
        ],
      };

    case "topic": {
      const topic = TOPICS[arg as keyof typeof TOPICS];
      const match = topic ? await matchFaq(topic.keywords) : null;
      if (match && match.score > 0) return { state, replies: [faqReply(match.faq, lang)] };
      return {
        state,
        replies: [
          text(t(lang, "topicFallback", { topic: topic ? t(lang, topic.label).toLowerCase() : "this" }), [
            { action: "handoff", label: t(lang, "chipTalkExpert") },
            { action: "lead", label: t(lang, "chipPlanTrip") },
            { action: "menu", label: t(lang, "chipMenu") },
          ]),
        ],
      };
    }

    case "handoff":
      return { state, replies: [handoffReply(lang)] };

    case "decline":
      return declineContact(state);

    case "about":
      return { state, replies: [companyReply((arg || "about") as CompanyTopic, lang)] };

    case "lead":
      return startEnquiry(state);

    case "lang":
      return switchLanguage(arg as Lang, state);
  }

  return { state, replies: [text(t(lang, "menuShort"), menuOptions(lang))] };
}

/** Runs a chip/flow action; if the server can't be reached, says so and offers to try the same action again. */
export async function runAction(action: string, state: ChatState): Promise<FlowResult> {
  try {
    return await runActionUnsafe(action, state);
  } catch (error) {
    if (error instanceof ChatNetworkError) return connectionTrouble(state, action);
    throw error;
  }
}

/** Typed text: language commands, then the open enquiry or "Find a package" question, then the matcher. */
export async function handleText(input: string, rawState: ChatState): Promise<FlowResult> {
  const command = LANGUAGE_COMMANDS[normalize(input)];
  if (command) return switchLanguage(command, rawState);

  const state = detectLanguage(input, rawState);
  if (state.lead.step) return handleLeadInput(input, state);

  const introduced = statedName(input);
  if (introduced) {
    const { name, phone, email } = introduced;
    const remembered: ChatState = {
      ...state,
      profile: { ...knownDetails(state), name, ...(phone ? { phone } : {}), ...(email ? { email } : {}) },
    };
    return { state: remembered, replies: [text(t(L(state), "niceToMeet", { name: name.split(" ")[0] }), menuOptions(L(state)))] };
  }

  if (state.find.step) {
    const answered = await handleFindInput(input, state).catch((error) => {
      if (error instanceof ChatNetworkError) return connectionTrouble(state, "find");
      throw error;
    });
    if (answered) return answered;
  }

  const response = await respondToText(input, L(state), who(state));
  const replies = response.replies ?? [];
  if (!response.action) return { state, replies };

  const result = await runAction(response.action, state);
  // A "quiet" menu just adds its chips under the reply above
  if (response.action === "menu:quiet" && replies.length) {
    const last = replies[replies.length - 1];
    return { ...result, replies: [...replies.slice(0, -1), { ...last, options: result.replies[0]?.options }] };
  }
  return { ...result, replies: [...replies, ...result.replies] };
}

/** Chip taps. Enquiry chips ("lead:...") are handled here; their value follows "|". */
export async function handleChip(action: string, state: ChatState): Promise<FlowResult> {
  const value = action.split("|")[1] ?? "";
  const clean: ChatState = { ...state, lead: { ...state.lead, confirmCancel: false } };
  if (action.startsWith("lead:month|")) return answer(clean, { month: value });
  if (action.startsWith("lead:adults|")) return answer(clean, { adults: value });
  if (action.startsWith("lead:children|")) return answer(clean, { children: value });
  if (action.startsWith("lead:budget|")) return answer(clean, { budget: value });
  // A phone number typed outside the form: start an enquiry with it filled in
  if (action.startsWith("lead:withphone|")) return startEnquiry(clean, undefined, { phone: value });
  // Start the same enquiry again (keeps the package)
  if (action === "lead:restart") return startEnquiry({ ...clean, contact: undefined, profile: {} }, clean.lead.package);
  // Ask for name/phone/email again instead of reusing the earlier ones
  if (action === "lead:newdetails") {
    return askStep("name", { ...clean, contact: undefined, profile: {}, lead: { ...clean.lead, step: "name", draft: {} } });
  }
  if (action === "lead:skip") {
    const step = clean.lead.step;
    if (step === "email" && !clean.lead.draft.phone) return contactDirectly(clean);
    if (step === "email" || step === "notes") return answer(clean, { [step]: "" });
    return { state: clean, replies: [] };
  }
  if (action === "lead:cancel") return cancelEnquiry(clean);
  if (action === "lead:resume") {
    return clean.lead.step ? askStep(clean.lead.step, clean) : runAction("menu", clean);
  }
  if (action === "lead:decline") return clean.lead.step ? declineStep(clean) : declineContact(clean);
  if (action === "lead:noemail") return contactDirectly(clean);
  if (action === "lead:sharephone") {
    const draft = { ...clean.lead.draft };
    delete draft.phone;
    return askStep("phone", { ...clean, lead: { ...clean.lead, draft } });
  }
  if (action === "lead:submit") return submitLead(clean);
  return runAction(action, clean);
}
