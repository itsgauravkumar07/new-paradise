// Company facts the chat assistant can share. Taken from what the website already publishes
// (About page, Contact page, footer): keep them in step when those change.

import { t, type Lang, type StringKey } from "./i18n";
import { hasPhrase, normalize } from "./parse";
import type { BotReply, QuickReply } from "./types";

export const COMPANY = {
  name: "Paradise Yatra",
  legalName: "Paradise Yatra Private Ltd.",
  founder: "Dikshant Sharma",
  founderTitle: "Founder & CEO",
  founderEmail: "dikshant@paradiseyatra.com",
  foundedYear: "2020",
  yearsOfExperience: "5+", // since 2020
  places: "25+", // About page: "25+ Places"
  clients: "1,000+", // About page: "1k+ Clients"
  address: "108, Tagore Villa, Near Natraj Cinema, Chakrata Road, Dehradun, Uttarakhand - 248001",
  phone: "+91 98733 91733",
  email: "info@paradiseyatra.com",
  uttarakhandTourism: "UTTR/DEHRADUN/08-2021/004728",
  udyam: "UDYAM-UK-05-0046271",
  gstin: "05IYCPS1101L2ZG",
} as const;

export type CompanyTopic = "about" | "founder" | "experience" | "location" | "registration" | "contact";

// Checked in this order; phrases are matched as whole words in the normalized message
const TOPIC_PHRASES: [CompanyTopic, string[]][] = [
  [
    "founder",
    [
      "founder", "co founder", "owner", "ceo", "who started", "who founded", "who owns", "who runs", "dikshant",
      "malik", "kisne banaya", "kisne banayi", "kisne shuru", "kiski company", "owner kaun", "founder kaun",
    ],
  ],
  [
    "experience",
    [
      "how old", "how many years", "since when", "years of experience", "how much experience", "how long have you",
      "established", "founded in", "when was paradise", "kitne saal", "kab se", "kitna purana", "kitni purani",
      "kitna experience", "experience kitna",
    ],
  ],
  [
    "location",
    [
      "address", "your office", "office address", "office location", "where is your office", "where are you located",
      "where are you based", "located", "based in", "visit your office", "visit office", "office kahan", "office kaha",
      "aapka office", "kahan se ho", "kahan hai aapka", "aap kahan",
    ],
  ],
  [
    "registration",
    [
      "gst", "gstin", "registered", "registration", "license", "licence", "licensed", "certified", "certificate",
      "certification", "udyam", "msme", "govt approved", "government approved", "genuine", "legit", "legitimate",
      "fake", "fraud", "trustworthy", "can i trust", "trust you", "bharosa",
    ],
  ],
  [
    "contact",
    [
      "contact details", "contact info", "contact information", "email id", "email address", "your email", "your number",
      "your phone", "mobile number", "number kya hai", "email kya hai", "contact kaise",
    ],
  ],
  [
    "about",
    [
      "about you", "about your company", "about the company", "about paradise", "about paradise yatra", "who are you",
      "your company", "company details", "which company", "tell me about paradise", "aapke baare", "company ke baare",
      "aap kaun ho", "kaun ho aap",
    ],
  ],
];

/** Which company question the visitor is asking, if any. */
export const companyTopic = (text: string): CompanyTopic | null => {
  const norm = normalize(text);
  for (const [topic, phrases] of TOPIC_PHRASES) {
    if (hasPhrase(norm, phrases.map(normalize))) return topic;
  }
  return null;
};

const TOPIC_TEXT: Record<CompanyTopic, StringKey> = {
  about: "aboutIntro",
  founder: "aboutFounder",
  experience: "aboutExperience",
  location: "aboutLocation",
  registration: "aboutRegistration",
  contact: "aboutContact",
};

const TOPIC_CHIPS: { topic: CompanyTopic; label: StringKey }[] = [
  { topic: "founder", label: "chipFounder" },
  { topic: "experience", label: "chipExperience" },
  { topic: "location", label: "chipLocation" },
  { topic: "registration", label: "chipRegistration" },
  { topic: "contact", label: "chipContactDetails" },
];

/** Just the answer text (used inside an enquiry, where the form's own question follows). */
export const companyText = (topic: CompanyTopic, lang: Lang) =>
  t(lang, TOPIC_TEXT[topic], {
    founder: COMPANY.founder,
    founderTitle: COMPANY.founderTitle,
    founderEmail: COMPANY.founderEmail,
    years: COMPANY.yearsOfExperience,
    founded: COMPANY.foundedYear,
    places: COMPANY.places,
    clients: COMPANY.clients,
    address: COMPANY.address,
    phone: COMPANY.phone,
    email: COMPANY.email,
    legalName: COMPANY.legalName,
    tourism: COMPANY.uttarakhandTourism,
    udyam: COMPANY.udyam,
    gstin: COMPANY.gstin,
  });

/** The answer with links and chips for the other company topics. */
export const companyReply = (topic: CompanyTopic, lang: Lang): BotReply => {
  const others: QuickReply[] = TOPIC_CHIPS.filter((c) => c.topic !== topic).map((c) => ({
    action: `about:${c.topic}`,
    label: t(lang, c.label),
  }));
  return {
    kind: topic === "contact" ? "handoff" : "text",
    text: companyText(topic, lang),
    seeAll:
      topic === "location" || topic === "contact"
        ? { label: t(lang, "contactPage"), href: "/contact" }
        : topic === "registration"
          ? { label: t(lang, "seeCertificates"), href: "/why-choose-us" }
          : { label: t(lang, "readAboutUs"), href: "/about" },
    options: [...others.slice(0, 3), { action: "menu", label: t(lang, "chipMenu") }],
  };
};
