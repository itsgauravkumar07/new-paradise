// Keyword-based understanding of typed messages (no AI).
// respondToText() is the single seam to swap for an AI responder later: it gets the visitor's
// text and returns either replies to show or an action for the guided flows to run.

import { fetchTourLocations } from "@/hooks/useTourLocations";
import type { TourMenuKey } from "@/lib/tourMenus";
import { companyTopic } from "./company";
import { fetchFaqs, withTimeout, type Faq } from "./data";
import { t, type Lang } from "./i18n";
import {
  allowedTypos,
  editDistance,
  extractPhone,
  hasLetters,
  hasPhrase,
  isAbusive,
  isDecline,
  normalize,
  parseAmount,
  parseDays,
} from "./parse";
import type { BotReply } from "./types";

export { normalize } from "./parse";

export interface TextResponse {
  /** A flow action to run, e.g. "handoff", "lead", "go:india|Kerala|25000|5", "q:beach". */
  action?: string;
  replies?: BotReply[];
}

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "am", "was", "do", "does", "did", "you", "your", "i", "me", "my", "we", "our",
  "to", "for", "of", "in", "on", "at", "and", "or", "can", "could", "what", "how", "when", "where", "which",
  "who", "why", "will", "would", "be", "it", "its", "with", "about", "any", "there", "have", "has", "please",
  "tell", "know", "want", "need", "get", "this", "that", "from", "by", "if", "so", "us", "should", "much",
  "hai", "hain", "kya", "ka", "ki", "ke", "ko", "mein", "me", "se", "aur", "bhi", "toh", "to", "ye", "yeh",
]);

const stem = (word: string) => (word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word);

const tokenize = (text: string) =>
  normalize(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .map(stem);

const INTENTS: { action: string; phrases: string[] }[] = [
  {
    action: "handoff",
    phrases: [
      "agent", "human", "person", "call", "call me", "talk", "speak", "whatsapp", "contact", "phone number", "executive",
      "customer care", "baat karni", "baat karna", "baat karao", "call karo", "phone karo", "agent se", "insaan",
      "बात", "कॉल", "संपर्क", "एजेंट",
    ],
  },
  {
    action: "lead",
    phrases: [
      "custom", "customise", "customize", "plan my trip", "plan a trip", "quote", "quotation", "enquiry", "inquiry",
      "book", "booking", "plan karna", "plan karni", "book karna", "book karni", "बुक", "बुकिंग", "प्लान",
    ],
  },
  { action: "fd", phrases: ["fixed departure", "fixed departures", "group tour", "group trip", "departure date", "departures", "ग्रुप टूर"] },
  {
    action: "find",
    phrases: [
      "package", "packages", "tour", "tours", "holiday", "holidays", "trip", "trips", "vacation", "ghumna", "ghoomna",
      "jana hai", "jaana hai", "ghumne", "पैकेज", "टूर", "घूमना", "यात्रा", "ट्रिप", "छुट्टी",
    ],
  },
];

// Place names (incl. Hindi spellings) stored under a different state/country name
const DESTINATION_ALIASES: Record<string, string[]> = {
  kashmir: ["jammu and kashmir", "kashmir"],
  srinagar: ["jammu and kashmir", "kashmir"],
  gulmarg: ["jammu and kashmir", "kashmir"],
  pahalgam: ["jammu and kashmir", "kashmir"],
  dubai: ["united arab emirates", "uae", "dubai"],
  "abu dhabi": ["united arab emirates", "uae"],
  uae: ["united arab emirates", "uae"],
  bali: ["indonesia", "bali"],
  andaman: ["andaman"],
  "port blair": ["andaman"],
  havelock: ["andaman"],
  himachal: ["himachal pradesh"],
  "char dham": ["uttarakhand"],
  chardham: ["uttarakhand"],
  kedarnath: ["uttarakhand"],
  badrinath: ["uttarakhand"],
  rishikesh: ["uttarakhand"],
  nainital: ["uttarakhand"],
  mussoorie: ["uttarakhand"],
  manali: ["himachal pradesh"],
  shimla: ["himachal pradesh"],
  kasol: ["himachal pradesh"],
  leh: ["ladakh"],
  ooty: ["tamil nadu"],
  tamilnadu: ["tamil nadu"],
  munnar: ["kerala"],
  alleppey: ["kerala"],
  jaipur: ["rajasthan"],
  udaipur: ["rajasthan"],
  jaisalmer: ["rajasthan"],
  gangtok: ["sikkim"],
  darjeeling: ["sikkim"],
  phuket: ["thailand"],
  bangkok: ["thailand"],
  pattaya: ["thailand"],
  // Hindi
  केरल: ["kerala"],
  गोवा: ["goa"],
  कश्मीर: ["jammu and kashmir", "kashmir"],
  श्रीनगर: ["jammu and kashmir", "kashmir"],
  मनाली: ["himachal pradesh"],
  शिमला: ["himachal pradesh"],
  हिमाचल: ["himachal pradesh"],
  लद्दाख: ["ladakh"],
  लेह: ["ladakh"],
  सिक्किम: ["sikkim"],
  गंगटोक: ["sikkim"],
  अंडमान: ["andaman"],
  राजस्थान: ["rajasthan"],
  जयपुर: ["rajasthan"],
  उत्तराखंड: ["uttarakhand"],
  केदारनाथ: ["uttarakhand"],
  बद्रीनाथ: ["uttarakhand"],
  चारधाम: ["uttarakhand"],
  "चार धाम": ["uttarakhand"],
  ऋषिकेश: ["uttarakhand"],
  तमिलनाडु: ["tamil nadu"],
  ऊटी: ["tamil nadu"],
  थाईलैंड: ["thailand"],
  दुबई: ["united arab emirates", "uae"],
  बाली: ["indonesia"],
  इंडोनेशिया: ["indonesia"],
  मालदीव: ["maldives"],
  सिंगापुर: ["singapore"],
  मलेशिया: ["malaysia"],
  केन्या: ["kenya"],
  मिस्र: ["egypt"],
};

type Location = { tourType: TourMenuKey; name: string };

const allLocations = async (): Promise<Location[]> => {
  const { indiaStates, internationalCountries } = await withTimeout(fetchTourLocations()).catch(() => ({
    indiaStates: [] as string[],
    internationalCountries: [] as string[],
  }));
  return [
    ...indiaStates.map((name) => ({ tourType: "india" as const, name })),
    ...internationalCountries.map((name) => ({ tourType: "international" as const, name })),
  ];
};

const resolveAlias = (alias: string, all: Location[]) => {
  for (const candidate of DESTINATION_ALIASES[alias] ?? []) {
    const match = all.find((loc) => normalize(loc.name).includes(candidate));
    if (match) return match;
  }
  return null;
};

/** Word groups ("jammu and kashmir") of the given length from the text. */
const nGrams = (words: string[], size: number) =>
  words.length < size ? [] : words.slice(0, words.length - size + 1).map((_, i) => words.slice(i, i + size).join(" "));

/** Finds a state/country we have packages for in the visitor's text: exact, alias, then with a typo or two. */
export async function detectDestination(text: string, locations?: Location[]): Promise<Location | null> {
  const norm = normalize(text);
  if (!norm) return null;
  const padded = ` ${norm} `;
  const all = locations ?? (await allLocations());

  // 1. Exact location names, longest first so "Jammu and Kashmir" beats "Jammu"
  const byLength = [...all].sort((a, b) => b.name.length - a.name.length);
  const direct = byLength.find((loc) => padded.includes(` ${normalize(loc.name)} `));
  if (direct) return direct;

  // 2. Aliases (city, region and Hindi names)
  for (const alias of Object.keys(DESTINATION_ALIASES)) {
    if (!padded.includes(` ${normalize(alias)} `)) continue;
    const match = resolveAlias(alias, all);
    if (match) return match;
  }

  // 3. Small typos ("kerla", "kashmeer", "dubay", "thailend")
  const words = norm.split(" ");
  let best: { loc: Location; distance: number } | null = null;
  const consider = (phrase: string, target: string, loc: Location | null) => {
    if (!loc) return;
    const limit = allowedTypos(target.length);
    if (limit === 0 || Math.abs(phrase.length - target.length) > limit) return;
    const distance = editDistance(phrase, target);
    if (distance <= limit && (!best || distance < best.distance)) best = { loc, distance };
  };
  for (const loc of all) {
    const target = normalize(loc.name);
    for (const phrase of nGrams(words, target.split(" ").length)) consider(phrase, target, loc);
  }
  for (const alias of Object.keys(DESTINATION_ALIASES)) {
    const target = normalize(alias);
    for (const phrase of nGrams(words, target.split(" ").length)) consider(phrase, target, resolveAlias(alias, all));
  }
  return best ? (best as { loc: Location }).loc : null;
}

/** Best FAQ for the text, scored by keyword overlap with the question (and a little with the answer). */
export async function matchFaq(text: string): Promise<{ faq: Faq; score: number } | null> {
  const queryTokens = Array.from(new Set(tokenize(text)));
  if (queryTokens.length === 0) return null;

  const faqs = await fetchFaqs();
  let best: { faq: Faq; score: number } | null = null;
  for (const faq of faqs) {
    const questionTokens = new Set(tokenize(faq.question));
    const answerTokens = new Set(tokenize(faq.answer));
    let points = 0;
    for (const token of queryTokens) {
      if (questionTokens.has(token)) points += 1;
      else if (answerTokens.has(token)) points += 0.4;
    }
    const score = points / queryTokens.length;
    if (!best || score > best.score) best = { faq, score };
  }
  return best;
}

export const faqReply = (faq: Faq, lang: Lang): BotReply => {
  const note = t(lang, "faqEnglishNote");
  return {
    kind: "faq",
    text: note ? `${faq.answer}\n\n${note}` : faq.answer,
    options: [
      { action: "ask", label: t(lang, "chipAskAnother") },
      { action: "handoff", label: t(lang, "chipTalkExpert") },
      { action: "menu", label: t(lang, "chipMenu") },
    ],
  };
};

const menuChips = (lang: Lang) => [
  { action: "find", label: t(lang, "chipFind") },
  { action: "ask", label: t(lang, "chipCommonQuestions") },
  { action: "handoff", label: t(lang, "chipHandoff") },
];

const STRONG_FAQ = 0.6;
const WEAK_FAQ = 0.4;
const LONG_MESSAGE = 200;

const GREETING = /^(hi+|hello|helo|hey|namaste|namaskar|नमस्ते|नमस्कार|hola|good (morning|afternoon|evening))( |$)/;
const THANKS = ["thanks", "thank you", "thankyou", "thx", "ty", "dhanyavad", "dhanyawad", "shukriya", "धन्यवाद", "शुक्रिया"];

/** `who` is ", Rahul" (or " Rahul" in Hinglish) once the visitor's name is known, for a personal greeting. */
export async function respondToText(text: string, lang: Lang = "en", who = ""): Promise<TextResponse> {
  const norm = normalize(text);
  if (!norm) return { replies: [{ kind: "text", text: t(lang, "didntCatch"), options: menuChips(lang) }] };

  // Rude messages: stay polite and offer a person
  if (isAbusive(text)) {
    return { replies: [{ kind: "text", text: t(lang, "abuse") }], action: "handoff" };
  }

  // Numbers, emoji or symbols only: a phone number means "call me", anything else isn't understood
  if (!hasLetters(norm)) {
    const found = extractPhone(text);
    if (found) {
      return {
        replies: [
          {
            kind: "text",
            text: t(lang, "phoneOutsideFlow", { phone: found.phone }),
            options: [
              { action: `lead:withphone|${found.phone}`, label: t(lang, "yesCallMe") },
              { action: "menu", label: t(lang, "noThanks") },
            ],
          },
        ],
      };
    }
    return { replies: [{ kind: "text", text: t(lang, "didntCatch"), options: menuChips(lang) }] };
  }
  if (norm.replace(/\s/g, "").length < 2) {
    return { replies: [{ kind: "text", text: t(lang, "didntCatch"), options: menuChips(lang) }] };
  }

  if (GREETING.test(norm) && norm.split(" ").length <= 4) {
    return { replies: [{ kind: "text", text: t(lang, "greeting", { who }) }], action: "menu:quiet" };
  }
  if (hasPhrase(norm, THANKS)) {
    return { replies: [{ kind: "text", text: t(lang, "thanks") }], action: "menu:quiet" };
  }

  // "I don't want to share my number" said outside an enquiry
  if (isDecline(text)) return { action: "decline" };

  // Questions about the company: founder, years, office, registrations, contact details
  const topic = companyTopic(text);
  if (topic) return { action: `about:${topic}` };

  // Asking for a person always wins
  if (hasPhrase(norm, INTENTS[0].phrases)) return { action: "handoff" };

  const faqMatch = await matchFaq(text);
  if (faqMatch && faqMatch.score >= STRONG_FAQ) return { replies: [faqReply(faqMatch.faq, lang)] };

  const destination = await detectDestination(text);
  if (destination) {
    // "goa trip under 30000 for 4 days": use the budget and length too
    const maxPrice = parseAmount(text) ?? "";
    const days = parseDays(text) ?? "";
    return { action: `go:${destination.tourType}|${destination.name}|${maxPrice}|${days}` };
  }

  for (const intent of INTENTS.slice(1)) {
    if (hasPhrase(norm, intent.phrases)) return { action: intent.action };
  }

  if (faqMatch && faqMatch.score >= WEAK_FAQ) return { replies: [faqReply(faqMatch.faq, lang)] };

  // A long, detailed message is better handled by a person than by keyword search
  if (text.length > LONG_MESSAGE) {
    return {
      replies: [
        {
          kind: "text",
          text: t(lang, "detailedRequest"),
          options: [
            { action: "lead", label: t(lang, "chipPlanTrip") },
            { action: "handoff", label: t(lang, "chipTalkExpert") },
          ],
        },
      ],
    };
  }

  // Last try: keyword search across package names and descriptions
  return { action: `q:${text.trim().slice(0, 60)}` };
}
