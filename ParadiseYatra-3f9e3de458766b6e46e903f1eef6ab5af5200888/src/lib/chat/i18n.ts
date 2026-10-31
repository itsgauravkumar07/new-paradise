// Everything the chat assistant says, in English and Hinglish (Roman Hindi).
// Placeholders like {name} are filled in by t(). Package names, prices and FAQ answers come from
// the website's data and stay as they are.

export type Lang = "en" | "hl";

export const LANGS: { value: Lang; label: string; short: string }[] = [
  { value: "en", label: "English", short: "EN" },
  { value: "hl", label: "Hinglish", short: "Hinglish" },
];

type Entry = Record<Lang, string>;

const S = {
  // ------------------------------------------------------------ persona and welcome
  role: { en: "Virtual travel assistant", hl: "Virtual travel assistant" },
  welcome: {
    en: "Hi there! 👋 I'm {name}, Paradise Yatra's virtual travel assistant.",
    hl: "Namaste! 👋 Main {name} hoon, Paradise Yatra ki virtual travel assistant.",
  },
  welcomeHelp: {
    en: "I can help you find a tour package, check upcoming group departures, answer common questions, or connect you with our travel experts. What would you like to do?\n\n(Prefer Hinglish? Pick it at the top.)",
    hl: "Main aapko tour package dhoondhne, upcoming group tours dekhne, common sawaalon ke jawab dene ya hamare travel expert se baat karwane mein help kar sakti hoon. Aap kya karna chahenge?",
  },
  languageSwitched: {
    en: "Sure, let's continue in English. 🙂",
    hl: "Theek hai, ab hum Hinglish mein baat karte hain. 🙂",
  },

  // ------------------------------------------------------------ menu chips
  chipFind: { en: "🔍 Find a package", hl: "🔍 Package dhoondhein" },
  chipFd: { en: "📅 Fixed departures", hl: "📅 Fixed departures" },
  chipAsk: { en: "❓ Ask a question", hl: "❓ Sawaal poochhein" },
  chipLead: { en: "✍️ Plan a custom trip", hl: "✍️ Custom trip plan karein" },
  chipHandoff: { en: "💬 Talk to an expert", hl: "💬 Expert se baat karein" },
  chipPlanTrip: { en: "Plan a custom trip", hl: "Custom trip plan karein" },
  chipSearchAgain: { en: "Search again", hl: "Phir se search karein" },
  chipTryAnother: { en: "Try another search", hl: "Kuch aur search karein" },
  chipMenu: { en: "Main menu", hl: "Main menu" },
  chipTalkExpert: { en: "Talk to an expert", hl: "Expert se baat karein" },
  chipCallback: { en: "Request a call back", hl: "Call back mangwayein" },
  chipBrowse: { en: "Browse packages", hl: "Packages dekhein" },
  chipAskAnother: { en: "Ask another question", hl: "Ek aur sawaal poochhein" },
  chipCommonQuestions: { en: "❓ Common questions", hl: "❓ Common sawaal" },
  chipTryAgain: { en: "🔄 Try again", hl: "🔄 Phir se try karein" },
  chipWhatsapp: { en: "💬 WhatsApp us instead", hl: "💬 WhatsApp par baat karein" },

  menuPrompt: { en: "What would you like to do next?", hl: "Ab aap kya karna chahenge?" },
  menuShort: { en: "What would you like to do?", hl: "Aap kya karna chahenge?" },

  // ------------------------------------------------------------ hand-off
  handoff: {
    en: "Our travel experts are happy to help you personally. Chat with us on WhatsApp or give us a call.",
    hl: "Hamare travel experts aapki personally help karne ke liye ready hain. WhatsApp par chat karein ya humein call karein.",
  },
  whatsappUs: { en: "WhatsApp us", hl: "WhatsApp karein" },

  // ------------------------------------------------------------ package search
  whereToGo: { en: "Where would you like to go?", hl: "Aap kahan ghoomna chahenge?" },
  withinIndia: { en: "🇮🇳 Within India", hl: "🇮🇳 India mein" },
  international: { en: "🌍 International", hl: "🌍 International" },
  whichState: {
    en: "Lovely! These are the states we cover. Which one would you like to explore? (You can also type the name.)",
    hl: "Bahut badhiya! Ye states hum cover karte hain. Aap kahan jaana chahenge? (Naam type bhi kar sakte hain.)",
  },
  whichCountry: {
    en: "Lovely! These are the countries we cover. Which one would you like to explore? (You can also type the name.)",
    hl: "Bahut badhiya! Ye countries hum cover karte hain. Aap kahan jaana chahenge? (Naam type bhi kar sakte hain.)",
  },
  anyDestination: { en: "Any destination", hl: "Koi bhi jagah" },
  budgetPrompt: {
    en: "What's your budget per person? (You can also type it, e.g. 25k)",
    hl: "Per person aapka budget kitna hai? (Type bhi kar sakte hain, jaise 25k)",
  },
  daysPrompt: { en: "And how many days?", hl: "Aur kitne din?" },
  anyDuration: { en: "Any duration", hl: "Kitne bhi din" },
  daysLabel: { en: "{range} Days", hl: "{range} din" },
  yourSearch: { en: "your search", hl: "aapki search" },
  noPackages: {
    en: "Right now we don't have a ready-made package for {where} in that range{who}, but don't worry: our travel experts will design a custom trip for you, exactly the way you want it.",
    hl: "Abhi {where} ke liye is range mein ready package nahi hai{who}, par chinta mat kijiye: hamare travel experts aapke liye bilkul aapke hisaab se custom trip design kar denge.",
  },
  foundOne: {
    en: "Sure{who}! For {where}, we offer this package:",
    hl: "Haan ji{who}! {where} ke liye hum ye package provide karte hain:",
  },
  foundSome: {
    en: "Sure{who}! For {where}, we offer these {count} packages:",
    hl: "Haan ji{who}! {where} ke liye hum ye {count} packages provide karte hain:",
  },
  foundMany: {
    en: "Sure{who}! We offer {count} packages for {where}. Here are our top {shown}:",
    hl: "Haan ji{who}! {where} ke liye hamare paas {count} packages hain. Ye rahe hamare top {shown}:",
  },
  withinBudget: { en: " (up to ₹{amount} per person)", hl: " (₹{amount} per person tak)" },
  seeAll: { en: "See all", hl: "Sab dekhein" },
  keywordNone: {
    en: "I'm sorry, I don't have the details on that one. Please pick an option below, or our travel experts will be happy to help you directly.",
    hl: "Maaf kijiye, iski jaankari abhi mere paas nahi hai. Neeche se koi option chunein, ya hamare travel experts aapki seedha madad kar denge.",
  },
  keywordFound: {
    en: 'Sure{who}! For "{query}", we offer these packages:',
    hl: 'Haan ji{who}! "{query}" ke liye hum ye packages provide karte hain:',
  },

  // ------------------------------------------------------------ fixed departures and questions
  fdNone: {
    en: "There are no upcoming fixed departures listed right now. Our experts can plan a trip on your dates.",
    hl: "Abhi koi upcoming fixed departure nahi hai. Hamare experts aapki dates par trip plan kar sakte hain.",
  },
  fdFound: {
    en: "Sure{who}! These are our upcoming group departures, with fixed dates and fixed prices:",
    hl: "Haan ji{who}! Ye hamare upcoming group tours hain, fixed dates aur fixed price ke saath:",
  },
  seeAllDepartures: { en: "See all departures", hl: "Saare departures dekhein" },
  perPerson: { en: "Per Person", hl: "Per Person" },
  askPrompt: {
    en: "Type your question below, or pick a topic:",
    hl: "Neeche apna sawaal likhein, ya koi topic chunein:",
  },
  topicPayment: { en: "Payments", hl: "Payment" },
  topicCancellation: { en: "Cancellation & refund", hl: "Cancellation & refund" },
  topicVisa: { en: "Visa & documents", hl: "Visa & documents" },
  topicCustomise: { en: "Customising a trip", hl: "Trip customise karna" },
  topicGroup: { en: "Group tours", hl: "Group tours" },
  topicFallback: {
    en: "The details for {topic} depend on your trip, so our travel experts will confirm them for you.",
    hl: "{topic} ki details aapki trip par depend karti hain, isliye hamare travel experts aapko confirm karenge.",
  },
  faqEnglishNote: { en: "", hl: "(Yeh jawab English mein hai)" },
  fromFaqs: { en: "From our FAQs", hl: "Hamare FAQs se" },

  // ------------------------------------------------------------ small talk and fallbacks
  greeting: {
    en: "Hello{who}! 👋 Welcome to Paradise Yatra. How may I help you today?",
    hl: "Namaste ji{who}! 👋 Paradise Yatra mein aapka swagat hai. Main aapki kya madad kar sakti hoon?",
  },
  niceToMeet: {
    en: "Nice to meet you, {name}! 😊 How may I help you today?",
    hl: "Aapse milkar khushi hui, {name} ji! 😊 Main aapki kya madad kar sakti hoon?",
  },
  thanks: { en: "You're welcome! Is there anything else I can help you with?", hl: "Aapka swagat hai! Kya main aur kuch help kar sakti hoon?" },
  didntCatch: {
    en: "Sorry, I didn't quite catch that. 🙂 You can pick an option below or type your question in a few words.",
    hl: "Sorry, main samajh nahi paayi. 🙂 Neeche se koi option chunein ya apna sawaal kuch words mein likhein.",
  },
  detailedRequest: {
    en: "That sounds like a detailed plan. Our travel experts can help with this best. Would you like to send it as an enquiry or chat with them?",
    hl: "Yeh ek detailed plan lagta hai. Hamare travel experts isme best help kar sakte hain. Kya aap ise enquiry ke roop mein bhejna chahenge ya unse baat karna chahenge?",
  },
  abuse: {
    en: "I'm here to help with your travel plans. If something isn't right, our team would really like to hear about it and sort it out.",
    hl: "Main aapki travel planning mein help ke liye yahan hoon. Agar kuch theek nahi hai, toh hamari team zaroor sunna aur theek karna chahegi.",
  },
  phoneOutsideFlow: {
    en: "Would you like our travel expert to call you on {phone}?",
    hl: "Kya aap chahenge ki hamare travel expert aapko {phone} par call karein?",
  },
  yesCallMe: { en: "📞 Yes, call me", hl: "📞 Haan, call karein" },
  noThanks: { en: "No, thanks", hl: "Nahi, thanks" },

  // ------------------------------------------------------------ connection problems
  connection: {
    en: "I'm having trouble connecting right now. 😕 Please try again, or reach our team on WhatsApp.",
    hl: "Abhi connect karne mein problem ho rahi hai. 😕 Please phir se try karein, ya WhatsApp par hamari team se baat karein.",
  },
  offline: {
    en: "You seem to be offline. 📶 I'll carry on as soon as you're back online.",
    hl: "Lagta hai aap offline hain. 📶 Internet wapas aate hi main aage badhoongi.",
  },
  backOnline: { en: "You're back online. Let's continue! 🙂", hl: "Aap wapas online hain, chaliye aage badhte hain! 🙂" },
  genericError: {
    en: "Sorry, something went wrong. Please try again in a moment.",
    hl: "Sorry, kuch gadbad ho gayi. Please thodi der mein phir try karein.",
  },

  // ------------------------------------------------------------ enquiry steps
  askNameForPackage: {
    en: 'Great choice! Let\'s send an enquiry for "{title}". What\'s your name?',
    hl: 'Badhiya choice! Chaliye "{title}" ke liye enquiry bhejte hain. Aapka naam kya hai?',
  },
  askName: { en: "Great, let's plan your trip! What's your name?", hl: "Badhiya, chaliye aapki trip plan karte hain! Aapka naam kya hai?" },
  askPhone: {
    en: "Thanks, {name}! What's the best phone number to reach you on? (10-digit mobile number)",
    hl: "Thanks, {name}! Aapse contact ke liye best phone number kaunsa hai? (10-digit mobile number)",
  },
  askEmail: { en: "And your email address? (optional)", hl: "Aur aapka email? (optional)" },
  askMonth: { en: "When are you planning to travel?", hl: "Aap kab travel karne ka soch rahe hain?" },
  notDecided: { en: "Not decided yet", hl: "Abhi decide nahi" },
  askAdults: { en: "How many adults (12 years and above)?", hl: "Kitne adults (12 saal aur upar)?" },
  askChildren: { en: "Any children (below 12 years)?", hl: "Koi bachche (12 saal se kam)?" },
  noChildren: { en: "No children", hl: "Koi bachcha nahi" },
  askBudget: { en: "What's your budget per person?", hl: "Per person aapka budget kitna hai?" },
  flexible: { en: "Flexible", hl: "Flexible" },
  askNotesPackage: {
    en: "Any special requests, like hotel category, meal plan or room type? (optional)",
    hl: "Koi special request, jaise hotel category, meal plan ya room type? (optional)",
  },
  askNotes: {
    en: "Which destination do you have in mind? Add any special requests too. (optional)",
    hl: "Aapke mann mein kaunsi jagah hai? Koi special request ho toh woh bhi likhein. (optional)",
  },
  skip: { en: "Skip", hl: "Skip" },
  reuseContact: {
    en: "I already have your details ({details}), so I won't ask for them again.",
    hl: "Aapki details mere paas pehle se hain ({details}), toh main dobara nahi poochhungi.",
  },
  enquiryFor: { en: 'Let\'s send an enquiry for "{title}".', hl: 'Chaliye "{title}" ke liye enquiry bhejte hain.' },
  useDifferentDetails: { en: "Use different details", hl: "Doosri details dein" },

  // validation
  nameEmpty: { en: "Please tell me your name. 🙂", hl: "Please apna naam bataiye. 🙂" },
  nameSentence: {
    en: "Please type just your name, e.g. Rahul Sharma.",
    hl: "Please sirf apna naam likhein, jaise Rahul Sharma.",
  },
  nameDigits: { en: "A name shouldn't have numbers. Please type your name again.", hl: "Naam mein numbers nahi hone chahiye. Please phir se naam likhein." },
  phoneInvalid: {
    en: "That doesn't look like a valid phone number. Please enter a 10-digit mobile number (or include your country code, e.g. +44…).",
    hl: "Yeh sahi phone number nahi lagta. Please 10-digit mobile number likhein (ya country code ke saath, jaise +44…).",
  },
  emailSavedAskPhone: {
    en: "Thanks, I've saved your email. And your phone number? (10-digit mobile number)",
    hl: "Thanks, aapka email save kar liya. Aur aapka phone number? (10-digit mobile number)",
  },
  emailInvalid: { en: "Please enter a valid email address, or tap Skip.", hl: "Please sahi email likhein, ya Skip dabayein." },
  monthPast: {
    en: "That date has already passed. Please pick an upcoming month.",
    hl: "Yeh date nikal chuki hai. Please upcoming month chunein.",
  },
  adultsInvalid: { en: "Please enter the number of adults, e.g. 2.", hl: "Please adults ki ginti likhein, jaise 2." },
  childrenInvalid: { en: "Please enter the number of children, or 0 if none.", hl: "Please bachchon ki ginti likhein, ya koi nahi toh 0." },
  budgetInvalid: {
    en: "Please pick a budget above or type an amount, e.g. ₹30,000 or 30k.",
    hl: "Please upar se budget chunein ya amount likhein, jaise ₹30,000 ya 30k.",
  },
  budgetUpTo: { en: "Up to ₹{amount}", hl: "Up to ₹{amount}" },
  useButtons: {
    en: "Please use the buttons above to send or change your enquiry.",
    hl: "Please enquiry bhejne ya badalne ke liye upar ke buttons use karein.",
  },

  // confirm
  checkDetails: { en: "Please check your details:", hl: "Please apni details check kar lein:" },
  fPackage: { en: "Package", hl: "Package" },
  fName: { en: "Name", hl: "Naam" },
  fPhone: { en: "Phone", hl: "Phone" },
  fEmail: { en: "Email", hl: "Email" },
  fMonth: { en: "Travel month", hl: "Travel month" },
  fTravellers: { en: "Travellers", hl: "Travellers" },
  fBudget: { en: "Budget per person", hl: "Budget per person" },
  fNotes: { en: "Notes", hl: "Notes" },
  notGiven: { en: "Not given", hl: "Nahi diya" },
  adultsCount: { en: "{n} adults", hl: "{n} adults" },
  oneAdult: { en: "1 adult", hl: "1 adult" },
  childrenCount: { en: "{n} children", hl: "{n} bachche" },
  oneChild: { en: "1 child", hl: "1 bachcha" },
  sendEnquiry: { en: "✅ Send enquiry", hl: "✅ Enquiry bhejein" },
  startOver: { en: "Start over", hl: "Phir se shuru karein" },
  cancel: { en: "Cancel", hl: "Cancel" },

  // submit
  submitted: {
    en: "Thank you{who}! 🎉 Your enquiry has been sent. One of our travel experts will contact you on {phone} soon.",
    hl: "Thank you{who}! 🎉 Aapki enquiry bhej di gayi hai. Hamare travel expert jald hi {phone} par aapse contact karenge.",
  },
  submittedByEmail: {
    en: "Thank you{who}! 🎉 Your enquiry has been sent. Our travel expert will email you at {email} soon. You can also call us on {ourPhone} anytime.",
    hl: "Thank you{who}! 🎉 Aapki enquiry bhej di gayi hai. Hamare travel expert jald hi {email} par aapko email karenge. Aap kabhi bhi {ourPhone} par call bhi kar sakte hain.",
  },
  duplicate: {
    en: "Thanks{who}! We already have this enquiry from you, so there's no need to send it again. Our expert will contact you on {phone} soon.",
    hl: "Thanks{who}! Aapki yeh enquiry humein pehle hi mil chuki hai, dobara bhejne ki zaroorat nahi. Hamare expert jald hi {phone} par contact karenge.",
  },
  tooMany: {
    en: "You've already sent several enquiries in a short time, so our team will be in touch soon. For anything urgent, please WhatsApp us.",
    hl: "Aapne thode time mein kai enquiries bheji hain, hamari team jald contact karegi. Kuch urgent ho toh WhatsApp karein.",
  },
  submitError: {
    en: "Sorry, something went wrong while sending your enquiry. Please try again, or reach us on WhatsApp.",
    hl: "Sorry, enquiry bhejne mein problem hui. Please phir try karein, ya WhatsApp par contact karein.",
  },

  // cancel and decline
  confirmCancel: { en: "Do you want to cancel this enquiry?", hl: "Kya aap yeh enquiry cancel karna chahte hain?" },
  yesCancel: { en: "Yes, cancel", hl: "Haan, cancel karein" },
  noContinue: { en: "No, continue", hl: "Nahi, continue karein" },
  cancelled: {
    en: "No problem, I've cancelled it. What would you like to do next?",
    hl: "Koi baat nahi, maine ise cancel kar diya. Ab aap kya karna chahenge?",
  },
  continueEnquiry: { en: "Sure, let's continue.", hl: "Theek hai, aage badhte hain." },
  decline: {
    en: "No problem at all! 😊 You don't have to share any details. You can call us directly on {ourPhone} anytime, or explore our packages and their full details.",
    hl: "Bilkul koi baat nahi! 😊 Aapko koi details dene ki zaroorat nahi hai. Aap kabhi bhi seedha {ourPhone} par call kar sakte hain, ya aaram se hamare packages aur unki poori details dekhiye.",
  },
  declineName: {
    en: "No problem, you don't have to share your name. 🙂",
    hl: "Koi baat nahi, naam batana zaroori nahi hai. 🙂",
  },
  declinePhone: {
    en: "No problem at all! 😊 You don't have to share your number. You can also call us directly on {ourPhone} anytime to get the details.\n\nCould you share your email instead? Our team will send you the package details there.",
    hl: "Bilkul koi baat nahi! 😊 Aapko number dene ki zaroorat nahi hai. Aap kabhi bhi seedha {ourPhone} par call karke details pata kar sakte hain.\n\nKya aap apna email share karenge? Hamari team package details wahan bhej degi.",
  },
  declinePhoneHaveEmail: {
    en: "No problem at all! 😊 We'll reply on your email, and you can also call us directly on {ourPhone} anytime.",
    hl: "Bilkul koi baat nahi! 😊 Hum aapko email par reply karenge, aur aap kabhi bhi seedha {ourPhone} par call kar sakte hain.",
  },
  askEmailInstead: {
    en: "Could you share your email so our team can send you the details?",
    hl: "Kya aap apna email share karenge, taaki hamari team details bhej sake?",
  },
  contactDirectly: {
    en: "That's completely fine! 😊 You can contact our team directly whenever you like:\n• Call / WhatsApp: {ourPhone}\n• Email: {ourEmail}\n\nMeanwhile, feel free to explore our packages.",
    hl: "Bilkul theek hai! 😊 Jab bhi aap chahein, hamari team se seedha contact kar sakte hain:\n• Call / WhatsApp: {ourPhone}\n• Email: {ourEmail}\n\nTab tak aap aaraam se hamare packages dekh sakte hain.",
  },
  declineOptional: { en: "No problem, let's skip that.", hl: "Koi baat nahi, ise chhod dete hain." },
  chipShareNumber: { en: "📞 I'll share my number", hl: "📞 Number share karna hai" },
  chipNoEmail: { en: "Skip email too", hl: "Email bhi nahi" },
  notShared: { en: "Not shared", hl: "Share nahi kiya" },
  viewPackageDetails: { en: "View package details", hl: "Package ki poori details dekhein" },
  browseAllPackages: { en: "Browse all packages", hl: "Saare packages dekhein" },
  whyContact: {
    en: "We only use your number to share your trip quote and answer your questions, never for spam. 🙏 Would you like to share it?",
    hl: "Hum aapka number sirf aapki trip ka quote bhejne aur sawaalon ke jawab dene ke liye use karte hain, kabhi spam ke liye nahi. 🙏 Kya aap ise share karna chahenge?",
  },
  shareNumber: { en: "OK, I'll share it", hl: "OK, share karta/karti hoon" },
  notComfortable: { en: "I'm not comfortable", hl: "Main comfortable nahi hoon" },
  questionMidEnquiry: {
    en: "Good question! Our travel expert will answer that when they get in touch.",
    hl: "Achha sawaal! Hamare travel expert contact karte waqt iska jawab denge.",
  },
  letsContinue: { en: "Let's continue:", hl: "Chaliye aage badhte hain:" },

  // ------------------------------------------------------------ chat window
  placeholderDefault: { en: "Type your question…", hl: "Apna sawaal likhein…" },
  placeholderName: { en: "Type your name…", hl: "Apna naam likhein…" },
  placeholderPhone: { en: "Type your phone number…", hl: "Apna phone number likhein…" },
  placeholderEmail: { en: "Type your email…", hl: "Apna email likhein…" },
  placeholderMonth: { en: "Type your travel month…", hl: "Travel month likhein…" },
  placeholderAdults: { en: "Type number of adults…", hl: "Adults ki ginti likhein…" },
  placeholderChildren: { en: "Type number of children…", hl: "Bachchon ki ginti likhein…" },
  placeholderBudget: { en: "Type your budget per person…", hl: "Per person budget likhein…" },
  placeholderNotes: { en: "Type your requests…", hl: "Apni requests likhein…" },
  enquireNow: { en: "Enquire now", hl: "Enquire karein" },
  view: { en: "View", hl: "Dekhein" },
  enquireAbout: { en: "Enquire about: {title}", hl: "Enquiry: {title}" },
  footer: { en: "Chats are saved to help our team assist you", hl: "Aapki behtar help ke liye chats save hoti hain" },
  privacy: { en: "Privacy policy", hl: "Privacy policy" },
  newChat: { en: "Start a new chat", hl: "Nayi chat shuru karein" },
  closeChat: { en: "Close chat", hl: "Chat band karein" },
  sendMessage: { en: "Send message", hl: "Message bhejein" },
  language: { en: "Language", hl: "Language" },

  // ------------------------------------------------------------ about the company (facts come from company.ts)
  chipAbout: { en: "🏢 About Paradise Yatra", hl: "🏢 Paradise Yatra ke baare mein" },
  chipFounder: { en: "👤 Founder", hl: "👤 Founder kaun hain" },
  chipExperience: { en: "📅 Years in travel", hl: "📅 Kitne saal se" },
  chipLocation: { en: "📍 Office location", hl: "📍 Office kahan hai" },
  chipRegistration: { en: "📜 Registrations", hl: "📜 Registrations" },
  chipContactDetails: { en: "📞 Contact details", hl: "📞 Contact details" },
  readAboutUs: { en: "Read more about us", hl: "Hamare baare mein aur padhein" },
  contactPage: { en: "Contact page", hl: "Contact page" },
  seeCertificates: { en: "See our certificates", hl: "Hamare certificates dekhein" },
  aboutIntro: {
    en: "Paradise Yatra is a travel company based in Dehradun, Uttarakhand, founded by {founder} in {founded}. With {years} years of experience, we've planned trips to {places} places for {clients} happy travellers: India holidays and pilgrimages, international tours, fixed group departures and fully custom trips.",
    hl: "Paradise Yatra Dehradun, Uttarakhand ki travel company hai, jise {founder} ne {founded} mein shuru kiya. {years} saal ke experience ke saath hum {places} jagahon par {clients} khush travellers ki trips plan kar chuke hain: India holidays aur yatras, international tours, fixed group departures aur poori tarah custom trips.",
  },
  aboutFounder: {
    en: "Paradise Yatra was founded by {founder}, our {founderTitle}. {founder} built the company on one promise: travel should feel personal, seamless and unforgettable.\n\nYou can write to {founder} at {founderEmail}.",
    hl: "Paradise Yatra ko {founder} ne shuru kiya, jo hamare {founderTitle} hain. Company ka ek hi vaada hai: travel personal, smooth aur yaadgaar ho.\n\nAap {founder} ko {founderEmail} par likh sakte hain.",
  },
  aboutExperience: {
    en: "Paradise Yatra started in {founded}, so we've been planning trips for {years} years now, covering {places} destinations for {clients} travellers across India and abroad.",
    hl: "Paradise Yatra {founded} mein shuru hua, yaani hum {years} saal se trips plan kar rahe hain, India aur videsh ki {places} jagahon par {clients} travellers ke liye.",
  },
  aboutLocation: {
    en: "Our office is in Dehradun:\n{address}\n\nYou're welcome to visit us. Please call {phone} before you come so the right person is there to meet you.",
    hl: "Hamara office Dehradun mein hai:\n{address}\n\nAap zaroor aaiye. Aane se pehle {phone} par call kar lijiye taaki sahi vyakti aapse mil sake.",
  },
  aboutRegistration: {
    en: "{legalName} is a registered travel company:\n• Uttarakhand Tourism (Travel Agent & Domestic Tour Operator): {tourism}\n• MSME Udyam: {udyam}\n• GSTIN: {gstin}",
    hl: "{legalName} ek registered travel company hai:\n• Uttarakhand Tourism (Travel Agent & Domestic Tour Operator): {tourism}\n• MSME Udyam: {udyam}\n• GSTIN: {gstin}",
  },
  aboutContact: {
    en: "You can reach us here:\n• Phone / WhatsApp: {phone}\n• Email: {email}\n• Office: {address}",
    hl: "Aap humse yahan contact kar sakte hain:\n• Phone / WhatsApp: {phone}\n• Email: {email}\n• Office: {address}",
  },
} satisfies Record<string, Entry>;

export type StringKey = keyof typeof S;

/** The string for `key` in `lang`, with {placeholders} filled in. */
export const t = (lang: Lang, key: StringKey, vars: Record<string, string | number> = {}): string => {
  const entry: Entry = S[key];
  const template = entry[lang] ?? entry.en;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`));
};

export const isLang = (value: unknown): value is Lang => value === "en" || value === "hl";

/**
 * The language to use for a saved chat: chats started while Hindi was offered ("hi") carry on in
 * Hinglish, anything unknown in English.
 */
export const toLang = (value: unknown): Lang => (value === "hl" || value === "hi" ? "hl" : "en");

/** Labels for the listing-filter budget bands (values match PRICES in SearchFilterSidebar). */
export const BUDGET_BAND_LABELS: Record<string, Entry> = {
  all: { en: "Any budget", hl: "Koi bhi budget" },
  "0-10000": { en: "Up to ₹10,000", hl: "₹10,000 tak" },
  "10000-20000": { en: "₹10,000 - ₹20,000", hl: "₹10,000 - ₹20,000" },
  "20000-35000": { en: "₹20,000 - ₹35,000", hl: "₹20,000 - ₹35,000" },
  "35000-50000": { en: "₹35,000 - ₹50,000", hl: "₹35,000 - ₹50,000" },
  "50000+": { en: "Above ₹50,000", hl: "₹50,000 se upar" },
};

/** Month name for a chip, e.g. "December 2026". */
export const monthChipLabel = (date: Date) => date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
