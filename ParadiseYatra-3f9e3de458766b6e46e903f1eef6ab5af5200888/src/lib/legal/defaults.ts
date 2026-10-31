// The published wording of each legal page as of its last code update. Used until the legal team saves
// that page in Admin → Legal Pages (after that the saved version is shown), and offered there as
// "Restore original wording".
import type { LegalKind, LegalPageData } from "./types";

const EMAIL = "[info@paradiseyatra.com](mailto:info@paradiseyatra.com)";
const PHONE = "[+91 8979396413](tel:+918979396413)";

const privacy: LegalPageData = {
  kind: "privacy",
  title: "Privacy Policy",
  description:
    "Learn how Paradise Yatra collects, uses, and protects your personal information when you browse our website or plan a trip with us.",
  lastUpdated: "2026-03-02",
  glance: [
    { icon: "ShieldCheck", title: "We don't sell your data", text: "SPDI is shared only with consent or for a lawful purpose." },
    { icon: "CreditCard", title: "No full card data stored", text: "Payments are collected through our payment providers." },
    { icon: "UserCheck", title: "You stay in control", text: "Access, correct, update or delete your data, or withdraw consent." },
    { icon: "FileText", title: "Grievance Officer", text: "For questions or complaints about how your data is processed." },
  ],
  sections: [
    {
      id: "scope",
      title: "Scope",
      icon: "Eye",
      blocks: [
        {
          type: "paragraph",
          text: "This policy applies to personal data collected through our website, contact forms, bookings, customer support, marketing communications, and related online services. It does not apply to third-party websites or services that we do not control.",
        },
      ],
    },
    {
      id: "definitions",
      title: "Key Definitions",
      icon: "BookOpen",
      blocks: [
        {
          type: "paragraph",
          text: '"Personal data" means any data about an individual who is identifiable by or in relation to such data. "Sensitive personal data or information" (SPDI) under the SPDI Rules includes passwords, financial information (such as bank account or card details), physical, physiological and mental health condition, sexual orientation, medical records and history, and biometric information.',
        },
      ],
    },
    {
      id: "collection",
      title: "Information We Collect",
      icon: "Database",
      blocks: [
        {
          type: "cards",
          columns: 2,
          items: [
            { icon: "UserRound", title: "", text: "**Account and contact details:** name, email address, phone number, and communication preferences." },
            { icon: "Plane", title: "", text: "**Booking and travel details:** destination, dates, traveler details (including for co-travelers you share with us), special requests, and service history." },
            { icon: "CreditCard", title: "", text: "**Payment information:** collected via our payment providers. We do not store full card data on our servers. Limited references/tokens may be stored for refunds and reconciliation." },
            { icon: "HeartPulse", title: "", text: "**Optional SPDI:** only where necessary and with explicit consent, such as health information relevant to travel (e.g., accessibility needs), government ID for bookings (as legally required), and limited biometric data only if mandated by a carrier or authority." },
            { icon: "MonitorSmartphone", title: "", text: "**Device and usage data:** IP address, device identifiers, browser type, pages visited, and interactions collected via analytics and cookies." },
            { icon: "MessagesSquare", title: "", text: "**Communications:** queries, feedback, and support interactions." },
            { icon: "MessageCircle", title: "", text: "**Website chat:** messages you send to our chat assistant, the page you chatted from, and any contact details you share in the chat. We store these conversations so our team can follow up on your enquiry and improve our service." },
            { icon: "Megaphone", title: "", text: "**Marketing preferences:** opt-ins, unsubscribe choices, and campaign engagement." },
          ],
        },
        {
          type: "note",
          tone: "warning",
          icon: "Info",
          text: "Note: Please avoid sharing SPDI unless specifically requested for a lawful booking purpose. If you share SPDI inadvertently, you may request deletion using the process below.",
        },
      ],
    },
    {
      id: "use",
      title: "How we use your information",
      icon: "Target",
      blocks: [
        {
          type: "list",
          items: [
            "Provide, personalize, and manage bookings, itineraries, and related services.",
            "Communicate about inquiries, confirmations, updates, and support.",
            "Process payments, refunds, and prevent fraud or misuse.",
            "Comply with legal obligations, including KYC/ID requirements of partners or authorities.",
            "Improve site performance, user experience, and service quality.",
            "Send marketing communications with your consent; you can opt out anytime.",
          ],
        },
        {
          type: "note",
          tone: "info",
          icon: "Scale",
          text: "Legal grounds include consent (particularly for SPDI and marketing), performance of a contract, compliance with law, and legitimate interests such as improving services and ensuring security.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: "Cookie",
      blocks: [
        {
          type: "paragraph",
          text: "We use cookies and similar technologies for essential site functions, analytics, and to remember your preferences. Where required, we seek your consent. You can manage cookies in your browser settings. Disabling certain cookies may impact site functionality.",
        },
        { type: "paragraph", text: "More detail is in our [Cookie Policy](/cookie-policy)." },
      ],
    },
    {
      id: "sharing",
      title: "Sharing and Disclosure",
      icon: "Share2",
      blocks: [
        {
          type: "cards",
          columns: 3,
          items: [
            { icon: "Handshake", title: "", text: "**Service providers and partners:** hotels, airlines, local operators, payment gateways, CRM and analytics providers who process data under appropriate safeguards." },
            { icon: "Scale", title: "", text: "**Legal and compliance:** to law enforcement, regulators, or courts when legally required or to protect our rights, users, or the public." },
            { icon: "Building2", title: "", text: "**Business transfers:** in connection with mergers, acquisitions, or restructuring, subject to this policy or equivalent safeguards." },
          ],
        },
        {
          type: "note",
          tone: "success",
          icon: "ShieldCheck",
          text: "We do not sell personal data. We share SPDI only with consent or as required for a lawful purpose and on a need-to-know basis per the SPDI Rules.",
        },
      ],
    },
    {
      id: "transfer",
      title: "International Transfers",
      icon: "Earth",
      blocks: [
        {
          type: "paragraph",
          text: "Your data may be transferred to and processed in countries outside India where our partners or service providers operate. Such transfers are made with your consent where required and with reasonable security practices and contractual safeguards to protect your information.",
        },
      ],
    },
    {
      id: "security",
      title: "Security Practices",
      icon: "Lock",
      blocks: [
        {
          type: "paragraph",
          text: "We implement reasonable security practices and procedures as required under Rule 8 of the SPDI Rules, including organizational, technical, and physical measures to protect data against unauthorized access, alteration, disclosure, or destruction. We follow industry-standard controls, encryption in transit, access controls, and regular reviews of security measures.",
        },
        {
          type: "chips",
          items: [
            { icon: "Lock", label: "Encryption in transit" },
            { icon: "KeyRound", label: "Access controls" },
            { icon: "RefreshCw", label: "Regular security reviews" },
          ],
        },
      ],
    },
    {
      id: "retention",
      title: "Data Retention",
      icon: "Archive",
      blocks: [
        {
          type: "paragraph",
          text: "We retain personal data for as long as needed to fulfill the purposes outlined in this policy, comply with legal, accounting, or reporting requirements, resolve disputes, and enforce agreements. When no longer needed, data is deleted or de-identified per our retention schedule.",
        },
      ],
    },
    {
      id: "rights",
      title: "Your Rights & Choices",
      icon: "UserCheck",
      blocks: [
        {
          type: "paragraph",
          text: "Subject to applicable law, including the DPDP Act, you may have the right to access, correct, update, or delete your data; withdraw consent; and register a grievance. To exercise these rights, please contact us using the details below. We will verify your request and respond within reasonable timelines. You may also opt out of marketing communications using the unsubscribe option in our emails.",
        },
        {
          type: "chips",
          items: [
            { icon: "Eye", label: "Access" },
            { icon: "Pencil", label: "Correct or update" },
            { icon: "Trash2", label: "Delete" },
            { icon: "Undo2", label: "Withdraw consent" },
            { icon: "Scale", label: "Register a grievance" },
          ],
        },
      ],
    },
    {
      id: "children",
      title: "Children's Privacy",
      icon: "Baby",
      blocks: [
        {
          type: "paragraph",
          text: "Our services are not directed to children under 18. We do not knowingly collect personal data from children without appropriate consent from a parent or guardian where required by law. If you believe a child has provided us data without consent, please contact us to request deletion.",
        },
      ],
    },
    {
      id: "grievance",
      title: "Grievance Redressal",
      icon: "Scale",
      blocks: [
        {
          type: "paragraph",
          text: "In accordance with Rule 5(9) of the SPDI Rules, you may contact our Grievance Officer for any questions or complaints regarding the processing of your personal data or this policy.",
        },
        {
          type: "contact",
          title: "Grievance Officer",
          subtitle: "Paradise Yatra",
          lines: [
            { icon: "MapPin", text: "Dehradun, Uttarakhand, India" },
            { icon: "Phone", text: `Phone: ${PHONE}` },
            { icon: "Mail", text: `Email: ${EMAIL}` },
          ],
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this Policy",
      icon: "RefreshCw",
      blocks: [
        {
          type: "paragraph",
          text: "We may update this policy to reflect changes in legal requirements or our practices. Material changes will be notified by updating the effective date above and, where appropriate, through website notices or direct communication.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: "Mail",
      blocks: [{ type: "paragraph", text: `For privacy-related queries, rights requests, or concerns, contact us at ${EMAIL} or call ${PHONE}.` }],
    },
  ],
};

const cookie: LegalPageData = {
  kind: "cookie",
  title: "Cookie Policy",
  description:
    "Find out how cookies and similar technologies help our website function, understand site usage, and improve your travel-planning experience.",
  lastUpdated: "2026-03-05",
  glance: [
    { icon: "Cookie", title: "Small text files", text: "They remember your actions and preferences on our website." },
    { icon: "Layers", title: "Three types", text: "Essential, analytics and third-party cookies." },
    { icon: "SlidersHorizontal", title: "Your browser, your choice", text: "Clear or block cookies in your browser settings at any time." },
    { icon: "BadgeCheck", title: "Browsing means accepting", text: "Continued use of the website accepts these cookie practices." },
  ],
  sections: [
    {
      id: "scope",
      title: "Scope",
      icon: "FileText",
      blocks: [
        {
          type: "paragraph",
          text: "This Cookie Policy explains how Paradise Yatra uses cookies and similar technologies on our website. It should be read together with our [Privacy Policy](/privacy-policy).",
        },
      ],
    },
    {
      id: "what-are-cookies",
      title: "What Are Cookies?",
      icon: "Cookie",
      blocks: [
        {
          type: "paragraph",
          text: "Cookies are small text files stored on your device when you visit a website. They help websites remember your actions and preferences, improve functionality, and understand how users interact with pages.",
        },
      ],
    },
    {
      id: "types",
      title: "Types of Cookies We Use",
      icon: "Layers",
      blocks: [
        {
          type: "cards",
          columns: 3,
          items: [
            { icon: "Lock", title: "Essential cookies", text: "Needed for security, navigation, and core site functionality." },
            { icon: "ChartColumn", title: "Analytics cookies", text: "Help us measure traffic, understand usage patterns, and improve user experience." },
            { icon: "Puzzle", title: "Third-party cookies", text: "May be set by external providers such as analytics, social media, and embedded content services." },
          ],
        },
      ],
    },
    {
      id: "consent",
      title: "Consent and Choices",
      icon: "BadgeCheck",
      blocks: [
        {
          type: "paragraph",
          text: "By continuing to use our website, you acknowledge and accept the use of cookies as described in this policy. Our cookie notice is informational and reminds users that browsing the site means accepting these cookie terms.",
        },
      ],
    },
    {
      id: "manage",
      title: "Managing Cookies",
      icon: "SlidersHorizontal",
      blocks: [
        {
          type: "list",
          items: [
            "You can clear or block cookies from your browser settings at any time.",
            "Some site features, analytics, or embedded services may not function properly if cookies are blocked.",
            "Continued use of this website indicates acceptance of the cookie practices outlined here.",
          ],
        },
      ],
    },
    {
      id: "updates",
      title: "Changes to This Policy",
      icon: "RefreshCw",
      blocks: [
        {
          type: "paragraph",
          text: "We may update this Cookie Policy from time to time to reflect legal, technical, or operational changes. We will update the date shown above when changes are made.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: "Mail",
      blocks: [{ type: "note", tone: "info", icon: "Mail", text: `For questions about this Cookie Policy, contact us at ${EMAIL}.` }],
    },
  ],
};

const terms: LegalPageData = {
  kind: "terms",
  title: "Terms & Conditions",
  description: "Please review the terms that apply when you use our website, request travel services, or make a booking with Paradise Yatra.",
  lastUpdated: "2026-03-02",
  glance: [
    { icon: "Handshake", title: "A binding agreement", text: "Using our website or Services means you accept these Terms." },
    { icon: "RefreshCw", title: "Terms can change", text: "We may update them at any time, so please review them periodically." },
    { icon: "Landmark", title: "Laws of India", text: "These Terms are governed by the laws of India." },
    { icon: "Gavel", title: "Courts in Dehradun", text: "Disputes fall under the courts of Dehradun, Uttarakhand." },
  ],
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      icon: "Handshake",
      blocks: [
        {
          type: "paragraph",
          text: 'These Terms and Conditions, along with our [Privacy Policy](/privacy-policy) or other terms ("Terms") constitute a binding agreement by and between **PARADISE YATRA** ("Website Owner", "we", "us", or "our") and you ("you" or "your") and relate to your use of our website, goods or services (collectively, "Services").',
        },
        {
          type: "paragraph",
          text: "By using our website and availing the Services, you acknowledge that you have read, understood, and accepted these Terms. We reserve the right to modify these Terms at any time without prior notice. It remains your responsibility to periodically review these Terms to stay informed of any updates.",
        },
        { type: "note", tone: "info", icon: "Scale", text: "*The use of this website or availing of our Services is strictly subject to the following terms of use.*" },
      ],
    },
    {
      id: "registration",
      title: "Registration & Account Use",
      icon: "UserRound",
      blocks: [
        {
          type: "paragraph",
          text: "To access and use our premium Services, you may be required to register an account. You agree to provide true, accurate, current, and complete information to us during and after the registration process.",
        },
        {
          type: "paragraph",
          text: "You shall be solely responsible for maintaining the confidentiality of your account credentials and for all acts done through the use of your registered account. Any unauthorized use must be immediately reported to our support team.",
        },
      ],
    },
    {
      id: "warranties",
      title: "Warranties & Accuracy",
      icon: "TriangleAlert",
      blocks: [
        {
          type: "paragraph",
          text: "Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials offered on this website or through the Services for any specific purpose.",
        },
        {
          type: "paragraph",
          text: "You acknowledge that such information and materials may contain inaccuracies or errors, and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law. Your use of our Services and the website is solely at your own risk and discretion.",
        },
        {
          type: "cards",
          columns: 2,
          items: [
            {
              icon: "Copyright",
              title: "Intellectual Property",
              text: "The contents of the Website and the Services are proprietary to Us. You do not have authority to claim any intellectual property rights, title, or interest in its contents.",
            },
            {
              icon: "Ban",
              title: "Unauthorized Use",
              text: "Unauthorized use of the Website or Services may lead to legal action against you as per these Terms or applicable laws.",
            },
          ],
        },
      ],
    },
    {
      id: "legal",
      title: "Legal & Jurisdiction",
      icon: "Landmark",
      blocks: [
        {
          type: "cards",
          columns: 3,
          items: [
            {
              icon: "CloudLightning",
              title: "Force Majeure",
              text: "Notwithstanding anything contained in these Terms, the parties shall not be liable for any failure to perform an obligation if execution is prevented or delayed by a force majeure event.",
            },
            {
              icon: "Landmark",
              title: "Governing Law",
              text: "These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and construed strictly in accordance with the laws of India.",
            },
            {
              icon: "Gavel",
              title: "Jurisdiction",
              text: "All disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts located in DEHRADUN, UTTARAKHAND.",
            },
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: "Mail",
      blocks: [
        {
          type: "paragraph",
          text: "All concerns or communications relating to these Terms must be communicated to our primary office using the contact information provided on this website.",
        },
        { type: "paragraph", text: "Office address and phone numbers are on our [Contact page](/contact)." },
      ],
    },
  ],
};

const refund: LegalPageData = {
  kind: "refund",
  title: "Refund Policy",
  description: "Review how cancellations, supplier rules, and eligible refunds are handled for Paradise Yatra bookings.",
  lastUpdated: "2026-03-02",
  glance: [
    { icon: "Wallet", title: "Advance payment confirms", text: "The balance must be cleared before travel begins." },
    { icon: "MessageSquareText", title: "Cancel in writing", text: "By official email or our registered WhatsApp number." },
    { icon: "Repeat", title: "Charges depend on timing", text: "25%, 50% or 100% of the total package cost." },
    { icon: "Timer", title: "Refunds within 45 working days", text: "Paid back through the original mode of payment." },
  ],
  sections: [
    {
      id: "confirmation",
      title: "Booking Confirmation",
      icon: "BadgeCheck",
      blocks: [
        {
          type: "list",
          items: [
            "A booking shall be considered confirmed only after receipt of the required advance payment.",
            "The balance amount must be cleared before the commencement of travel.",
            "By making any payment, the customer agrees to this Cancellation & Refund Policy.",
          ],
        },
      ],
    },
    {
      id: "cancellation",
      title: "Cancellation by Customer",
      icon: "CalendarX",
      blocks: [
        { type: "paragraph", text: "All cancellation requests must be submitted in writing via official email or registered WhatsApp number of Paradise Yatra." },
        { type: "heading", text: "Holiday Packages (Domestic & International)" },
        {
          type: "fees",
          items: [
            { label: "30 days or more before departure", percent: 25, text: "25% of total package cost will be charged as cancellation fee." },
            { label: "15–20 days before departure", percent: 50, text: "50% of total package cost will be charged as cancellation fee." },
            { label: "Within 15 days of departure / No Show", percent: 100, text: "100% cancellation charges (No Refund)." },
          ],
        },
        { type: "note", tone: "warning", icon: "Percent", text: "*Cancellation charges are calculated on total package cost and not on advance amount.*" },
      ],
    },
    {
      id: "flights",
      title: "Flight Tickets",
      icon: "Plane",
      blocks: [
        {
          type: "list",
          items: [
            "Flight ticket cancellations are strictly subject to the airline’s cancellation policy.",
            "Paradise Yatra will refund only the amount received from the airline after deducting applicable service charges.",
          ],
        },
      ],
    },
    {
      id: "hotels",
      title: "Hotel Bookings",
      icon: "BedDouble",
      blocks: [
        {
          type: "list",
          items: ["Refund eligibility depends entirely on the respective hotel’s cancellation policy.", "Non-refundable hotel bookings are not eligible for any refund."],
        },
      ],
    },
    {
      id: "visa",
      title: "Visa, Insurance & Processing Charges",
      icon: "Stamp",
      blocks: [
        {
          type: "note",
          tone: "warning",
          icon: "FileWarning",
          text: "Visa fees, travel insurance charges, documentation charges, and service fees are strictly non-refundable, even in case of visa rejection or cancellation by the customer.",
        },
      ],
    },
    {
      id: "no-show",
      title: "No Show Policy",
      icon: "UserX",
      blocks: [{ type: "paragraph", text: "Failure to report on the date of departure will be treated as a No Show and 100% cancellation charges will apply." }],
    },
    {
      id: "timeline",
      title: "Refund Processing Timeline",
      icon: "Timer",
      blocks: [
        {
          type: "steps",
          items: [
            { icon: "Timer", text: "All eligible refunds will be processed within 45 working days from the date of cancellation approval." },
            { icon: "CreditCard", text: "Refunds will be issued through the original mode of payment." },
            { icon: "ReceiptIndianRupee", text: "Bank charges, payment gateway fees, and supplier deductions (if any) will be applicable." },
          ],
        },
      ],
    },
    {
      id: "cancellation-paradiseyatra",
      title: "Cancellation by Paradise Yatra",
      icon: "Building2",
      blocks: [
        {
          type: "paragraph",
          text: "In case of unavoidable circumstances such as natural calamities, government restrictions, operational issues, strikes, or force majeure events, Paradise Yatra reserves the right to cancel the booking.",
        },
        { type: "heading", text: "Customers will be offered:" },
        {
          type: "choices",
          items: [
            { icon: "Route", text: "An alternative travel option" },
            { icon: "Wallet", text: "Refund subject to supplier policies" },
          ],
        },
        { type: "paragraph", text: "Paradise Yatra shall not be liable for any additional compensation." },
      ],
    },
    {
      id: "amendments",
      title: "Amendments / Date Changes",
      icon: "CalendarClock",
      blocks: [{ type: "list", items: ["All amendments are subject to availability and supplier approval.", "Fare difference and amendment charges will apply."] }],
    },
    {
      id: "force-majeure",
      title: "Force Majeure",
      icon: "CloudLightning",
      blocks: [
        {
          type: "paragraph",
          text: "Paradise Yatra shall not be held responsible for delays or cancellations caused by events beyond control including natural disasters, pandemics, war, weather disruptions, or government orders.",
        },
      ],
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      icon: "Info",
      blocks: [
        {
          type: "note",
          tone: "info",
          icon: "Info",
          text: "Paradise Yatra acts solely as a travel service facilitator. All services are provided by third-party suppliers such as airlines, hotels, transport providers, and visa authorities. Refunds and cancellations are ultimately subject to supplier terms and conditions.",
        },
      ],
    },
  ],
};

export const LEGAL_DEFAULTS: Record<LegalKind, LegalPageData> = { privacy, terms, cookie, refund };
