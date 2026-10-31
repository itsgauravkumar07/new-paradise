// Pure helpers that read what a visitor typed: names, phone numbers, months, budgets, traveller counts,
// and signals such as "cancel", "I don't want to share my number" or a question.
// Inputs can be English, Hinglish (Roman Hindi) or Hindi (Devanagari).

// ---------------------------------------------------------------- basics

const DEVANAGARI_DIGITS = "०१२३४५६७८९";

/** Devanagari digits to ASCII ("२" -> "2"). */
export const toAsciiDigits = (text: string) =>
  text.replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)));

/** Lower-case, punctuation removed; keeps letters of any script (incl. Hindi vowel signs) and digits. */
export const normalize = (text: string) =>
  toAsciiDigits(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export const hasDevanagari = (text: string) => /[ऀ-ॿ]/.test(text);
export const hasLetters = (text: string) => /\p{L}/u.test(text);

/** Whether any phrase appears as whole words in already-normalized text. */
export const hasPhrase = (norm: string, phrases: string[]) => phrases.some((p) => ` ${norm} `.includes(` ${p} `));

/** Common Roman-Hindi words: two or more in a message means the visitor is writing Hinglish. */
const HINGLISH_MARKERS = [
  "hai", "hain", "kya", "mujhe", "muje", "chahiye", "nahi", "nahin", "karna", "karni", "kaise", "kitna", "kitne",
  "mein", "aur", "jana", "jaana", "ghumna", "ghoomna", "batao", "bataye", "bhai", "kab", "kahan", "kyun", "acha",
  "accha", "theek", "thik", "haan", "hum", "humko", "hamein", "apka", "aapka", "aap", "chahte", "wala", "wali",
];
export const looksHinglish = (text: string) => {
  const words = new Set(normalize(text).split(" "));
  return HINGLISH_MARKERS.filter((m) => words.has(m)).length >= 2;
};

// ---------------------------------------------------------------- signals

/**
 * A whole-word regex that also works for Hindi: JavaScript's \b only understands Latin letters,
 * so Devanagari words ("दिन", "जनवरी") need these Unicode-aware boundaries instead.
 */
export const wordRe = (alternatives: string) =>
  new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{M}\\p{N}])`, "u");

/** Whole-message phrases that mean "stop this enquiry". */
const EXIT_PHRASES = [
  "cancel", "cancel it", "cancel this", "cancel enquiry", "cancel the enquiry", "stop", "exit", "quit", "menu",
  "main menu", "back", "go back", "leave it", "forget it", "never mind", "nevermind",
  "rehne do", "rehnedo", "chhodo", "chodo", "chhod do", "band karo", "cancel karo", "nahi chahiye", "mat karo",
  "रद्द", "रद्द करो", "बंद करो", "रहने दो", "छोड़ो", "छोड़ दो", "मेनू", "कैंसल", "नहीं चाहिए",
];
export const isExit = (text: string) => {
  const norm = normalize(text);
  return EXIT_PHRASES.some((p) => norm === normalize(p));
};

/** The visitor doesn't want to give contact details. */
const DECLINE_PHRASES = [
  "not comfortable", "not comfy", "uncomfortable", "dont want to share", "don t want to share", "do not want to share",
  "dont want to give", "don t want to give", "do not want to give", "wont share", "won t share", "will not share",
  "wont give", "won t give", "will not give", "not share", "not give my", "no number", "no phone", "skip number",
  "skip phone", "without number", "without phone", "without my number", "privacy", "dont call", "don t call", "no calls",
  "do not call", "no spam", "not now", "later maybe", "maybe later",
  "number nahi", "number nhi", "nahi dunga", "nahi dungi", "nhi dunga", "nhi dungi", "share nahi", "nahi dena",
  "nahi batana", "nahi bataunga", "nahi bataungi", "call mat", "call nahi", "phone mat", "comfortable nahi",
  "नंबर नहीं", "नहीं दूंगा", "नहीं दूंगी", "नहीं देना", "शेयर नहीं", "कॉल मत", "फोन मत", "नहीं बताना",
];
export const isDecline = (text: string) => hasPhrase(normalize(text), DECLINE_PHRASES.map(normalize));

/** "Why do you need my number?" */
export const asksWhyContact = (text: string) => {
  const norm = normalize(text);
  return (
    wordRe("why|kyun|kyu|kyon|क्यों").test(norm) &&
    wordRe("number|phone|mobile|contact|email|details|नंबर|फोन|ईमेल").test(norm)
  );
};

const QUESTION_STARTERS = [
  "what", "how", "when", "where", "which", "why", "who", "is", "are", "can", "could", "do", "does", "will", "would",
  "should", "kya", "kaise", "kitna", "kitne", "kitni", "kab", "kahan", "kahaan", "kyun", "kaun", "kaunsa",
  "क्या", "कैसे", "कितना", "कितने", "कितनी", "कब", "कहाँ", "कहां", "क्यों", "कौन",
];
/** A question rather than an answer ("what is the price?", "kya visa milega"). */
export const looksLikeQuestion = (text: string) => {
  if (text.includes("?")) return true;
  const first = normalize(text).split(" ")[0];
  return QUESTION_STARTERS.includes(first) && normalize(text).split(" ").length >= 3;
};

// Kept short and neutral: enough to recognise clear abuse, not a moderation system
const ABUSIVE_WORDS = [
  "fuck", "fucking", "fuck off", "shit", "bullshit", "bitch", "bastard", "asshole", "idiot", "stupid", "dumb", "moron",
  "chutiya", "chutiye", "madarchod", "bhenchod", "behenchod", "bhosdike", "gandu", "harami", "kamina", "kamine",
  "saala", "sala kutta", "bc", "mc", "bkl", "mkc",
];
export const isAbusive = (text: string) => hasPhrase(normalize(text), ABUSIVE_WORDS);

const SKIP_WORDS = [
  "skip", "no", "nope", "none", "nothing", "na", "nah", "not needed", "no thanks", "nahi", "nahin", "nhi", "kuch nahi",
  "koi nahi", "nil", "-", "नहीं", "कुछ नहीं", "कोई नहीं",
];
/** "Skip", "no", "kuch nahi"... for the optional email and notes steps. */
export const isSkip = (text: string) => SKIP_WORDS.includes(normalize(text) || text.trim());

const YES_WORDS = ["yes", "y", "yeah", "yep", "sure", "ok", "okay", "haan", "ha", "han", "ji", "haan ji", "हाँ", "हां", "जी"];
const NO_WORDS = ["no", "n", "nope", "nahi", "nahin", "nhi", "na", "नहीं", "ना"];
export const isYes = (text: string) => YES_WORDS.includes(normalize(text));
export const isNo = (text: string) => NO_WORDS.includes(normalize(text));

const GREETING_WORDS = ["hi", "hii", "hiii", "hello", "hey", "namaste", "namaskar", "नमस्ते", "नमस्कार", "hola", "yo"];

// ---------------------------------------------------------------- contact details

/** "+91XXXXXXXXXX" for an Indian mobile, "+<digits>" for an international number, or null. */
export const normalizePhone = (value: string): string | null => {
  const ascii = toAsciiDigits(value);
  const hasPlus = ascii.trim().startsWith("+");
  const digits = ascii.replace(/\D/g, "");
  if (!hasPlus && /^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (!hasPlus && /^0[6-9]\d{9}$/.test(digits)) return `+91${digits.slice(1)}`;
  if (!hasPlus && /^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;
  if (hasPlus && /^[1-9]\d{7,14}$/.test(digits)) return `+${digits}`;
  return null;
};

/** A phone number anywhere in the text ("Rahul 98765 43210", "call me on +44 7700 900123"). */
export const extractPhone = (text: string): { phone: string; rest: string } | null => {
  const ascii = toAsciiDigits(text);
  const candidates = ascii.match(/\+?\d[\d\s-]{7,16}\d/g) || [];
  for (const candidate of candidates) {
    const phone = normalizePhone(candidate);
    if (phone) return { phone, rest: ascii.replace(candidate, " ").replace(/\s+/g, " ").trim() };
  }
  return null;
};

const EMAIL_RE = /[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}/i;
export const extractEmail = (text: string): string | null => text.match(EMAIL_RE)?.[0].toLowerCase() ?? null;
export const isEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(text.trim());

const NAME_PREFIXES = [
  /^(hi|hello|hey)[,!.\s]+/i,
  /^(my name is|my name's|name is|name|i am|i'm|im|this is|it's|its|myself|me)\s+/i,
  /^(mera naam|mera nam|naam|nam|main|mai)\s+/i,
  /^(मेरा नाम|नाम|मैं)\s+/,
];
const NAME_SUFFIXES = [/\s+(hai|hun|hoon|here|है|हूँ|हूं)$/i];

const titleCase = (value: string) =>
  value
    .split(" ")
    .map((w) => (/^[a-z]/i.test(w) ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");

/**
 * The visitor's name from what they typed: strips "my name is" / "mera naam ... hai", and pulls out a phone
 * number or email given in the same message. `problem` is set when it doesn't look like a name.
 */
export const parseName = (
  input: string
): { name?: string; phone?: string; email?: string; problem?: "empty" | "sentence" | "digits" | "greeting" } => {
  let rest = input.trim();
  const email = extractEmail(rest) ?? undefined;
  if (email) rest = rest.replace(EMAIL_RE, " ");
  const found = extractPhone(rest);
  const phone = found?.phone;
  if (found) rest = found.rest;

  rest = rest.replace(/[,.;:!]+/g, " ").replace(/\s+/g, " ").trim();
  for (let pass = 0; pass < 2; pass++) {
    for (const re of NAME_PREFIXES) rest = rest.replace(re, "").trim();
    for (const re of NAME_SUFFIXES) rest = rest.replace(re, "").trim();
  }
  rest = rest.replace(/\b(and|aur|my number|number|phone|mobile|email|is|hai)\b/gi, " ").replace(/\s+/g, " ").trim();

  if (!rest || rest.length < 2) return { phone, email, problem: "empty" };
  if (GREETING_WORDS.includes(normalize(rest)) || isYes(rest) || isNo(rest)) return { phone, email, problem: "greeting" };
  if (/\d/.test(rest)) return { phone, email, problem: "digits" };
  if (rest.split(" ").length > 4 || rest.length > 40) return { phone, email, problem: "sentence" };
  return { name: titleCase(rest).slice(0, 60), phone, email };
};

/** "My name is Rahul" / "mera naam Priya hai" said outside the enquiry form: the name (and any number/email given with it). */
export const statedName = (text: string): { name: string; phone?: string; email?: string } | null => {
  const explicit = /^(?:(?:hi|hello|hey|namaste)[,!.\s]+)?(?:my name is|my name's|mera naam|mera nam|मेरा नाम)\s+/i;
  if (!explicit.test(text.trim())) return null;
  const parsed = parseName(text);
  return parsed.name ? { name: parsed.name, phone: parsed.phone, email: parsed.email } : null;
};

// ---------------------------------------------------------------- numbers and travellers

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
  ek: 1, do: 2, teen: 3, tin: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6, che: 6, chah: 6, saat: 7, sat: 7,
  aath: 8, ath: 8, nau: 9, das: 10, gyarah: 11, barah: 12,
  एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, पाँच: 5, छह: 6, छः: 6, सात: 7, आठ: 8, नौ: 9, दस: 10,
};

/** First number in the text, as digits or words ("2", "two", "do", "दो"). */
const ENGLISH_NUMBER_WORDS = new Set(["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "fifteen", "twenty"]);

export const parseCount = (text: string): number | null => {
  const norm = normalize(text);
  const digits = norm.match(/\d+/);
  if (digits) return parseInt(digits[0], 10);
  const words = norm.split(" ");
  // Hindi number words ("do", "sat") are also ordinary English words, so only trust them in short replies
  const short = words.length <= 3;
  for (const word of words) {
    if (word in NUMBER_WORDS && (short || ENGLISH_NUMBER_WORDS.has(word))) return NUMBER_WORDS[word];
  }
  return null;
};

const NO_CHILDREN = ["no", "none", "nil", "zero", "no kids", "no children", "no child", "nahi", "nahin", "nhi", "koi nahi", "nahi hai", "नहीं", "कोई नहीं"];

/** Adults and/or children from text like "2 adults 1 child", "couple", "just me", "family of 4". */
export const parseTravellers = (text: string): { adults?: number; children?: number } => {
  const norm = normalize(text);
  const result: { adults?: number; children?: number } = {};

  const word = "(\\d+|[a-z\\u0900-\\u097F]+)\\s+";
  const childMatch = norm.match(
    new RegExp(`${word}(?:children|child|kids|kid|bachche|bachhe|bacche|baccha|bachcha|बच्चे|बच्चा)(?![\\p{L}\\p{M}])`, "u")
  );
  if (childMatch) {
    const n = parseCount(childMatch[1]);
    if (n !== null) result.children = n;
  }
  const adultMatch = norm.match(
    new RegExp(`${word}(?:adults|adult|people|persons|person|log|vyakti|बड़े|लोग|व्यक्ति)(?![\\p{L}\\p{M}])`, "u")
  );
  if (adultMatch) {
    const n = parseCount(adultMatch[1]);
    if (n !== null) result.adults = n;
  }
  if (result.adults === undefined) {
    if (wordRe("couple|husband and wife|wife and me|me and my wife|me and my husband|honeymoon|hum do|dono|हम दो|दोनों").test(norm)) {
      result.adults = 2;
    } else if (wordRe("solo|just me|only me|alone|myself|akela|akeli|main akela|मैं अकेला|अकेला|अकेली").test(norm)) {
      result.adults = 1;
    } else {
      const family = norm.match(/family of (\d+|[a-z]+)/);
      if (family) result.adults = parseCount(family[1]) ?? undefined;
    }
  }
  return result;
};

export const parseChildren = (text: string): number | null => {
  if (NO_CHILDREN.includes(normalize(text))) return 0;
  const both = parseTravellers(text);
  if (both.children !== undefined) return both.children;
  return parseCount(text);
};

// ---------------------------------------------------------------- money and days

/** Rupee amount in the text: "30000", "₹30,000", "25k", "30 hazar", "1.5 lakh". Small numbers without a unit are ignored. */
const THOUSAND_UNITS = ["k", "thousand", "hazar", "hazaar", "hajar", "हज़ार", "हजार"];
const LAKH_UNITS = ["lakhs", "lakh", "lacs", "lac", "लाख"];
const AMOUNT_RE = new RegExp(
  `(\\d+(?:\\.\\d+)?)\\s*(${[...THOUSAND_UNITS, ...LAKH_UNITS].join("|")})?(?![\\p{L}\\p{M}\\p{N}])`,
  "gu"
);

export const parseAmount = (text: string): number | null => {
  const ascii = toAsciiDigits(text).toLowerCase().replace(/(\d),(\d)/g, "$1$2");
  for (const match of ascii.matchAll(AMOUNT_RE)) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    if (unit && THOUSAND_UNITS.includes(unit)) return Math.round(value * 1000);
    if (unit) return Math.round(value * 100000);
    if (value >= 1000) return Math.round(value);
  }
  return null;
};

const FLEXIBLE_WORDS = ["any", "anything", "flexible", "no limit", "no budget", "koi bhi", "kuch bhi", "jo bhi", "कोई भी", "फ्लेक्सिबल"];
export const isFlexible = (text: string) => hasPhrase(normalize(text), FLEXIBLE_WORDS);

/** Trip length in days: "5 days", "4 nights" (= 5 days), "5N/6D", "a week", "5 din". */
export const parseDays = (text: string): number | null => {
  const norm = normalize(toAsciiDigits(text).replace(/(\d+)\s*n\s*\/?\s*(\d+)\s*d/i, "$2 days"));
  const end = "(?![\\p{L}\\p{M}\\p{N}])";
  for (const match of norm.matchAll(new RegExp(`(\\d+|[a-z\\u0900-\\u097F]+)\\s*(?:days|day|din|दिन|d)${end}`, "gu"))) {
    const n = parseCount(match[1]);
    if (n) return n;
  }
  for (const match of norm.matchAll(new RegExp(`(\\d+|[a-z\\u0900-\\u097F]+)\\s*(?:nights|night|raat|रात|n)${end}`, "gu"))) {
    const n = parseCount(match[1]);
    if (n) return n + 1;
  }
  if (wordRe("a week|one week|1 week|ek hafta|hafta|week|एक हफ्ता|हफ्ता").test(norm)) return 7;
  if (wordRe("weekend").test(norm)) return 2;
  return null;
};

/** The listing-filter duration band ("4-6", "13+") for a number of days. */
export const durationBandFor = (days: number) =>
  days <= 3 ? "1-3" : days <= 6 ? "4-6" : days <= 9 ? "7-9" : days <= 12 ? "10-12" : "13+";

// ---------------------------------------------------------------- travel month

const MONTHS: [RegExp, number][] = [
  [wordRe("jan|january|janvari|जनवरी"), 0],
  [wordRe("feb|february|farvari|फरवरी"), 1],
  [wordRe("mar|march|मार्च"), 2],
  [wordRe("apr|april|अप्रैल"), 3],
  [wordRe("may|मई"), 4],
  [wordRe("jun|june|जून"), 5],
  [wordRe("jul|july|जुलाई"), 6],
  [wordRe("aug|august|अगस्त"), 7],
  [wordRe("sep|sept|september|सितंबर|सितम्बर"), 8],
  [wordRe("oct|october|अक्टूबर|अक्तूबर"), 9],
  [wordRe("nov|november|नवंबर|नवम्बर"), 10],
  [wordRe("dec|december|दिसंबर|दिसम्बर"), 11],
];

const monthLabel = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export const NOT_DECIDED = "Not decided yet";
const UNDECIDED = ["not sure", "not decided", "dont know", "don t know", "undecided", "flexible", "any time", "anytime", "pata nahi", "decide nahi", "abhi pata nahi", "pakka nahi", "पता नहीं", "तय नहीं"];

/**
 * A travel month from free text: "dec", "15 Jan", "next month", "agle mahine", "दिसंबर 2026".
 * Returns { month: "December 2026" }, { past: true } for a date already gone, or null when it can't tell.
 */
export const parseMonth = (text: string, now = new Date()): { month: string } | { past: true } | null => {
  const norm = normalize(text);
  if (UNDECIDED.some((p) => ` ${norm} `.includes(` ${normalize(p)} `))) return { month: NOT_DECIDED };

  const year = now.getFullYear();
  const current = now.getMonth();
  if (wordRe("this month|is mahine|isi mahine|इस महीने").test(norm)) return { month: monthLabel(year, current) };
  if (wordRe("next month|agle mahine|agla mahina|अगले महीने").test(norm)) {
    const d = new Date(year, current + 1, 1);
    return { month: monthLabel(d.getFullYear(), d.getMonth()) };
  }

  const found = MONTHS.find(([re]) => re.test(norm));
  if (!found) return null;
  const month = found[1];
  const yearMatch = norm.match(/(?<!\d)(20\d{2})(?!\d)/);
  if (yearMatch) {
    const y = parseInt(yearMatch[1], 10);
    if (y < year || (y === year && month < current)) return { past: true };
    return { month: monthLabel(y, month) };
  }
  // No year given: the next time that month comes round
  return { month: monthLabel(month < current ? year + 1 : year, month) };
};

// ---------------------------------------------------------------- fuzzy matching

/** Edit distance between two short strings (for typos like "kerla" vs "kerala"). */
export const editDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = temp;
    }
  }
  return prev[b.length];
};

/**
 * Typos allowed for a place name of this length: none up to 4 letters (so "baki" never becomes "Bali"),
 * 1 for 5–6 letters ("kerla" → Kerala), 2 for longer ("thailend" → Thailand).
 */
export const allowedTypos = (length: number) => (length <= 4 ? 0 : length <= 6 ? 1 : 2);
