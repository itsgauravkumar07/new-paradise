// Edge-case tests for the chat assistant's conversation logic (no browser, no real server).
// Run: npm run test:chat
//
// A fake fetch() stands in for the website's API, so each case can also simulate a slow, failing,
// rate-limited or duplicate-detecting server.

/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";
import { handleChip, handleText, startPackageEnquiry, switchLanguage } from "@/lib/chat/flows";
import { initialChatState, type ChatState, type FlowResult } from "@/lib/chat/types";

// ---------------------------------------------------------------- fake server

type Mode = "ok" | "down" | "hang" | "rateLimited" | "duplicate";
let mode: Mode = "ok";
const leadsPosted: any[] = [];

const PACKAGES = [
  { _id: "p1", name: "Kerala Backwaters", slug: "kerala-backwaters", price: 18000, duration: "4N/5D", state: "Kerala" },
  { _id: "p2", name: "Kerala Luxury Escape", slug: "kerala-luxury", price: 52000, duration: "6N/7D", state: "Kerala" },
  { _id: "p3", name: "Goa Beach Break", slug: "goa-beach", price: 24000, duration: "3N/4D", state: "Goa" },
  { _id: "p4", name: "Goa Premium", slug: "goa-premium", price: 45000, duration: "3N/4D", state: "Goa" },
];

(globalThis as any).sessionStorage = { getItem: () => null, setItem: () => undefined };
(globalThis as any).fetch = (url: string, init: any = {}) => {
  const json = (data: unknown, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => data } as Response);
  if (mode === "hang") {
    return new Promise((_, reject) => init.signal?.addEventListener("abort", () => reject(new Error("aborted"))));
  }
  if (mode === "down" && !url.startsWith("/api/faq")) return json({ message: "error" }, 500);
  if (url.startsWith("/api/faq")) {
    return json({
      faqs: [
        { _id: "f1", question: "What is your cancellation policy?", answer: "Cancellation charges depend on how close to departure you cancel." },
        { _id: "f2", question: "Do you help with visa?", answer: "Yes, we assist with visa documentation." },
      ],
    });
  }
  if (url.includes("minimal=true")) {
    return json({ packages: url.includes("tourType=india") ? [{ state: "Kerala" }, { state: "Goa" }, { state: "Jammu and Kashmir" }] : [{ country: "Thailand" }, { country: "United Arab Emirates" }] });
  }
  if (url.startsWith("/api/all-packages")) {
    const params = new URL(url, "http://x").searchParams;
    const state = params.get("state")?.toLowerCase();
    return json({ packages: PACKAGES.filter((p) => !state || p.state.toLowerCase() === state) });
  }
  if (url.startsWith("/api/fixed-departures")) return json({ fixedDepartures: [] });
  if (url === "/api/lead-capture") {
    if (mode === "rateLimited") return json({ error: "Too many" }, 429);
    leadsPosted.push(JSON.parse(init.body));
    return json({ success: true, leadId: `L${leadsPosted.length}`, ...(mode === "duplicate" ? { duplicate: true } : {}) });
  }
  return json({}, 404);
};

// ---------------------------------------------------------------- tiny harness

let passed = 0;
const failures: string[] = [];
const results: { name: string; ok: boolean }[] = [];

async function test(name: string, fn: () => Promise<void>) {
  mode = "ok";
  try {
    await fn();
    passed++;
    results.push({ name, ok: true });
  } catch (error) {
    failures.push(`${name}\n    ${(error as Error).message.split("\n").join("\n    ")}`);
    results.push({ name, ok: false });
  }
}

const said = (r: FlowResult) => r.replies.map((x) => x.text).join("\n");
const chips = (r: FlowResult) => r.replies.flatMap((x) => x.options ?? []).map((o) => o.action);

/** Feeds a list of typed messages ("t:") and chip taps ("c:"), returning the last result. */
async function chat(state: ChatState, steps: string[]): Promise<FlowResult> {
  let result: FlowResult = { state, replies: [] };
  for (const step of steps) {
    const value = step.slice(2);
    result = step.startsWith("c:") ? await handleChip(value, result.state) : await handleText(value, result.state);
  }
  return result;
}

const atStep = async (step: string, lang: "en" | "hl" = "en") => {
  const answers: Record<string, string[]> = {
    name: [],
    phone: ["t:Rahul"],
    email: ["t:Rahul", "t:9876543210"],
    month: ["t:Rahul", "t:9876543210", "c:lead:skip"],
    adults: ["t:Rahul", "t:9876543210", "c:lead:skip", "c:lead:month|March 2027"],
    confirm: ["t:Rahul", "t:9876543210", "c:lead:skip", "c:lead:month|March 2027", "c:lead:adults|2", "c:lead:children|0", "c:lead:budget|Flexible", "c:lead:skip"],
  };
  return chat(initialChatState(lang, lang !== "en"), ["c:lead", ...answers[step]]);
};

// ---------------------------------------------------------------- 1. enquiry form

async function main() {
  await test("#1 'cancel' mid-enquiry asks to confirm instead of saving it as the name", async () => {
    const r = await chat((await atStep("name")).state, ["t:cancel"]);
    assert.equal(r.state.lead.draft.name, undefined);
    assert.ok(r.state.lead.confirmCancel);
    assert.match(said(r), /cancel this enquiry/i);
    const yes = await handleText("yes", r.state);
    assert.equal(yes.state.lead.step, null);
    const no = await handleText("no", r.state);
    assert.equal(no.state.lead.step, "name");
  });

  await test("#1 Hinglish 'rehne do' also cancels", async () => {
    const r = await chat((await atStep("phone")).state, ["t:rehne do"]);
    assert.ok(r.state.lead.confirmCancel);
  });

  await test("#2 a question mid-enquiry is answered, then the same question is repeated", async () => {
    const r = await chat((await atStep("adults")).state, ["t:what is your cancellation policy?"]);
    assert.match(said(r), /Cancellation charges/);
    assert.match(said(r), /How many adults/);
    assert.equal(r.state.lead.step, "adults");
  });

  await test("#3 'My name is rahul sharma' saves 'Rahul Sharma'; names with digits are refused", async () => {
    const r = await chat((await atStep("name")).state, ["t:My name is rahul sharma"]);
    assert.equal(r.state.lead.draft.name, "Rahul Sharma");
    const bad = await chat((await atStep("name")).state, ["t:Rahul4"]);
    assert.equal(bad.state.lead.step, "name");
  });

  await test("#4 name and phone in one message skips the phone question", async () => {
    const r = await chat((await atStep("name")).state, ["t:Rahul 98765 43210"]);
    assert.equal(r.state.lead.draft.phone, "+919876543210");
    assert.equal(r.state.lead.step, "email");
  });

  await test("#4 an email typed at the phone step is kept and the phone is asked again", async () => {
    const r = await chat((await atStep("phone")).state, ["t:rahul@gmail.com"]);
    assert.equal(r.state.lead.draft.email, "rahul@gmail.com");
    assert.equal(r.state.lead.step, "phone");
  });

  await test("#5 travellers in words: 'two', 'couple', '2 adults 1 child' (skips children)", async () => {
    assert.equal((await chat((await atStep("adults")).state, ["t:two"])).state.lead.draft.adults, "2");
    assert.equal((await chat((await atStep("adults")).state, ["t:couple"])).state.lead.draft.adults, "2");
    const both = await chat((await atStep("adults")).state, ["t:2 adults 1 child"]);
    assert.deepEqual([both.state.lead.draft.adults, both.state.lead.draft.children, both.state.lead.step], ["2", "1", "budget"]);
  });

  await test("#6 free-typed month is converted; a past month is refused", async () => {
    const r = await chat((await atStep("month")).state, ["t:dec"]);
    assert.match(r.state.lead.draft.month ?? "", /^December 20\d\d$/);
    const past = await chat((await atStep("month")).state, ["t:march 2020"]);
    assert.equal(past.state.lead.step, "month");
    assert.match(said(past), /already passed/);
  });

  await test("#7 the same enquiry sent again gets 'we already have it', not a second thank-you", async () => {
    mode = "duplicate";
    const r = await chat((await atStep("confirm")).state, ["c:lead:submit"]);
    assert.match(said(r), /already have this enquiry/);
  });

  // ---------------------------------------------------------------- 2. understanding typed messages

  await test("#8 typos find the destination: 'kerla trip', 'kashmeer'", async () => {
    const r = await handleText("kerla trip", initialChatState());
    assert.match(said(r), /Kerala/);
    const k = await handleText("kashmeer", initialChatState());
    assert.match(said(k), /Jammu and Kashmir/);
  });

  await test("#9 typed answers inside 'Find a package' (budget then days)", async () => {
    const r = await chat(initialChatState(), ["c:find", "c:tour:india", "c:dest:Kerala", "t:under 20k"]);
    assert.equal(r.state.find.maxPrice, 20000);
    assert.equal(r.state.find.step, "duration");
    const done = await handleText("5 days", r.state);
    const titles = done.replies.flatMap((x) => x.cards ?? []).map((c) => c.title);
    assert.deepEqual(titles, ["Kerala Backwaters"]);
    assert.match(said(done), /up to ₹20,000/);
  });

  await test("#10 destination + budget + days in one sentence", async () => {
    const r = await handleText("goa trip under 30000 for 4 days", initialChatState());
    const titles = r.replies.flatMap((x) => x.cards ?? []).map((c) => c.title);
    assert.deepEqual(titles, ["Goa Beach Break"]);
  });

  await test("#11 emoji / a single letter get 'didn't catch that' instead of a random search", async () => {
    assert.match(said(await handleText("👍👍", initialChatState())), /didn't quite catch/);
    assert.match(said(await handleText("k", initialChatState())), /didn't quite catch/);
  });

  await test("#11 a bare phone number offers a call back, and the enquiry then skips the phone question", async () => {
    const r = await handleText("9876543210", initialChatState());
    assert.ok(chips(r).includes("lead:withphone|+919876543210"));
    const named = await chat(r.state, ["c:lead:withphone|+919876543210", "t:Rahul"]);
    assert.equal(named.state.lead.step, "email");
  });

  await test("#12 abusive message gets a polite reply and the WhatsApp/call buttons", async () => {
    const r = await handleText("you idiot", initialChatState());
    assert.match(said(r), /here to help/);
    assert.ok(r.replies.some((x) => x.kind === "handoff"));
  });

  // ---------------------------------------------------------------- 3. errors and slow network

  await test("#14 server down: 'trouble connecting' with Try again, not 'no packages found'", async () => {
    mode = "down";
    const r = await handleText("kerala", initialChatState());
    assert.match(said(r), /trouble connecting/);
    assert.ok(!/couldn't find a package/.test(said(r)));
    // "Try again" repeats the same search; "WhatsApp us instead" hands off
    assert.equal(chips(r).length, 2);
    assert.ok(chips(r).includes("handoff"));
    const retry = await handleChip(chips(r)[0], r.state);
    assert.match(said(retry), /trouble connecting/); // still down, still honest
    mode = "ok";
    assert.ok(!/trouble connecting/.test(said(await handleChip(chips(r)[0], r.state))));
  });

  await test("#13 server hangs: gives up after the timeout and offers Try again", async () => {
    mode = "hang";
    const started = Date.now();
    const r = await handleChip("duration:all", { ...initialChatState(), find: { tourType: "india", destination: "Kerala" } });
    assert.match(said(r), /trouble connecting/);
    assert.ok(Date.now() - started < 12000);
  });

  // ---------------------------------------------------------------- 4. abuse protection

  await test("#17 rate-limited visitor gets a friendly message (no thank-you, no lead link)", async () => {
    mode = "rateLimited";
    const r = await chat((await atStep("confirm")).state, ["c:lead:submit"]);
    assert.match(said(r), /several enquiries/);
    assert.equal(r.lead, undefined);
  });

  // ---------------------------------------------------------------- not comfortable sharing details

  const keralaCard = { id: "p1", title: "Kerala Backwaters", href: "/package/kerala-backwaters", image: null, price: 18000, priceLabel: "Per Person", subtitle: "" };

  await test("Decline number: shows our number to call, and asks for email instead (enquiry continues)", async () => {
    const pkgStart = await startPackageEnquiry(keralaCard, initialChatState());
    const r = await chat(pkgStart.state, ["t:Rahul", "t:I'm not comfortable sharing my number"]);
    assert.equal(r.state.lead.step, "email");
    assert.match(said(r), /No problem at all/);
    assert.match(said(r), /call us directly on \+91 98733 91733/);
    assert.match(said(r), /share your email instead/);
    assert.deepEqual(chips(r), ["lead:sharephone", "lead:noemail"]);
  });

  await test("Decline number, then give email: the enquiry is sent with the email only", async () => {
    leadsPosted.length = 0;
    const pkgStart = await startPackageEnquiry(keralaCard, initialChatState());
    const r = await chat(pkgStart.state, [
      "t:Rahul", "t:number nahi dunga", "t:rahul@gmail.com", "c:lead:month|March 2027", "c:lead:adults|2",
      "c:lead:children|0", "c:lead:budget|Flexible", "c:lead:skip", "c:lead:submit",
    ]);
    assert.deepEqual([leadsPosted[0].phone, leadsPosted[0].email], ["", "rahul@gmail.com"]);
    assert.match(said(r), /email you at rahul@gmail\.com/);
  });

  await test("Decline number AND email: next message says to contact our team directly", async () => {
    const pkgStart = await startPackageEnquiry(keralaCard, initialChatState());
    for (const noEmail of ["t:no", "t:email bhi nahi dunga", "c:lead:noemail"]) {
      const r = await chat(pkgStart.state, ["t:Rahul", "t:I don't want to share my number", noEmail]);
      assert.equal(r.state.lead.step, null, noEmail);
      assert.match(said(r), /contact our team directly/);
      assert.match(said(r), /\+91 98733 91733/);
      assert.match(said(r), /info@paradiseyatra\.com/);
      assert.equal(r.replies[0].kind, "handoff"); // shows the WhatsApp / call buttons
      assert.equal(r.replies[0].seeAll?.href, "/package/kerala-backwaters");
    }
  });

  await test("Decline number, then change mind: 'I'll share my number' asks for it again", async () => {
    const r = await chat((await atStep("phone")).state, ["t:not comfortable", "c:lead:sharephone"]);
    assert.equal(r.state.lead.step, "phone");
    const done = await handleText("9876543210", r.state);
    assert.equal(done.state.lead.draft.phone, "+919876543210");
  });

  await test("Decline name: carries on without it; the lead is sent as a guest", async () => {
    leadsPosted.length = 0;
    const r = await chat(initialChatState(), ["c:lead", "t:naam nahi batana"]);
    assert.equal(r.state.lead.step, "phone");
    assert.match(said(r), /naam batana zaroori nahi|don't have to share your name/);
    await chat(r.state, ["t:9876543210", "c:lead:skip", "c:lead:month|March 2027", "c:lead:adults|2", "c:lead:children|0", "c:lead:budget|Flexible", "c:lead:skip", "c:lead:submit"]);
    assert.equal(leadsPosted[0].fullName, "Guest (name not shared)");
  });

  await test("Decline an optional detail (budget): skipped, enquiry continues", async () => {
    const r = await chat((await atStep("adults")).state, ["c:lead:adults|2", "c:lead:children|0", "t:I'm not comfortable sharing that"]);
    assert.equal(r.state.lead.step, "notes");
    assert.match(said(r), /let's skip that/);
  });

  await test("Decline in Hinglish (typed in Roman or Hindi script) is answered in Hinglish", async () => {
    const hl = await chat((await atStep("phone", "hl")).state, ["t:number nahi dunga"]);
    assert.match(said(hl), /koi baat nahi/i);
    const devanagari = await chat((await atStep("phone", "hl")).state, ["t:नंबर नहीं दूंगा"]);
    assert.match(said(devanagari), /koi baat nahi/i);
  });

  await test("'Why do you need my number?' gets reassurance with share / not comfortable choices", async () => {
    const r = await chat((await atStep("phone")).state, ["t:why do you need my number?"]);
    assert.match(said(r), /never for spam/);
    assert.deepEqual(chips(r), ["lead:resume", "lead:decline"]);
  });

  // ---------------------------------------------------------------- languages

  await test("Language: 'hindi' or Hindi script switches to Hinglish (there is no Hindi-script mode)", async () => {
    assert.match(said(await handleText("hindi", initialChatState())), /Hinglish mein baat/);
    const auto = await handleText("मुझे केरल जाना है", initialChatState());
    assert.equal(auto.state.lang, "hl");
    assert.match(said(auto), /Kerala ke liye/);
    assert.ok(!/[ऀ-ॿ]/u.test(said(auto)), "no Hindi script in the reply");
  });

  await test("Language: a chat saved while Hindi existed carries on in Hinglish", async () => {
    const old = { ...initialChatState(), lang: "hi" } as unknown as ChatState;
    assert.match(said(await handleChip("find", old)), /Aap kahan ghoomna chahenge/);
  });

  await test("Language: Hinglish is detected from Roman Hindi", async () => {
    const r = await handleText("mujhe goa jana hai", initialChatState());
    assert.equal(r.state.lang, "hl");
    assert.match(said(r), /ke liye/);
  });

  await test("Language: switching mid-enquiry repeats the current question in the new language", async () => {
    const r = switchLanguage("hl", (await atStep("adults")).state);
    assert.match(said(r), /Kitne adults/);
    assert.equal(r.state.lead.step, "adults");
  });

  await test("Language: a Hinglish chat still sends the team an English summary", async () => {
    leadsPosted.length = 0;
    await chat((await atStep("confirm", "hl")).state, ["c:lead:submit"]);
    assert.match(leadsPosted[0].message, /Travel month: March 2027/);
    assert.match(leadsPosted[0].message, /Chat language: Hinglish/);
  });

  // ---------------------------------------------------------------- company details

  await test("Company: founder, years, office, registrations and contact are answered from site facts", async () => {
    assert.match(said(await handleText("who is the founder?", initialChatState())), /Dikshant Sharma/);
    assert.match(said(await handleText("how many years of experience do you have", initialChatState())), /started in 2020.*5\+ years/s);
    assert.match(said(await handleText("where is your office", initialChatState())), /Tagore Villa, Near Natraj Cinema/);
    assert.match(said(await handleText("are you registered? gst?", initialChatState())), /05IYCPS1101L2ZG/);
    assert.match(said(await handleText("contact details", initialChatState())), /info@paradiseyatra\.com/);
  });

  await test("Company: Hinglish questions get Hinglish answers", async () => {
    const r = await handleText("aapki company kitne saal purani hai, kab se ho", initialChatState());
    assert.equal(r.state.lang, "hl");
    assert.match(said(r), /2020 mein shuru hua.*5\+ saal se/s);
    assert.match(said(await handleText("founder kaun hai", initialChatState("hl", true))), /ne shuru kiya/);
  });

  await test("Company: the menu has an About chip, and each answer offers the other topics", async () => {
    assert.ok(chips(await handleChip("menu", initialChatState())).includes("about"));
    const about = await handleChip("about", initialChatState());
    assert.match(said(about), /based in Dehradun/);
    assert.ok(chips(about).includes("about:founder") && chips(about).includes("menu"));
    assert.equal(about.replies[0].seeAll?.href, "/about");
  });

  await test("Company: asking 'office address' mid-enquiry answers it and isn't saved as the name", async () => {
    const r = await chat((await atStep("name")).state, ["t:office address"]);
    assert.equal(r.state.lead.draft.name, undefined);
    assert.equal(r.state.lead.step, "name");
    assert.match(said(r), /Chakrata Road/);
    assert.match(said(r), /What's your name/);
  });

  await test("Company: trips to Dehradun or office trips are not mistaken for company questions", async () => {
    const r = await handleText("office trip to goa for 4 days", initialChatState());
    assert.ok(r.replies.some((x) => x.cards?.length), "shows Goa packages");
  });

  // ---------------------------------------------------------------- remembered details

  const kerala = { id: "p1", title: "Kerala Backwaters", href: "/package/kerala-backwaters", image: null, price: 18000, priceLabel: "Per Person", subtitle: "" };
  const goa = { id: "p3", title: "Goa Beach Break", href: "/package/goa-beach", image: null, price: 24000, priceLabel: "Per Person", subtitle: "" };

  await test("Memory: name given, then 'not comfortable', then Enquire on another package: name isn't asked again", async () => {
    const first = await startPackageEnquiry(kerala, initialChatState());
    const declined = await chat(first.state, ["t:Rahul", "t:I'm not comfortable sharing my number"]);
    const again = await startPackageEnquiry(goa, declined.state);
    assert.equal(again.state.lead.draft.name, "Rahul");
    assert.equal(again.state.lead.step, "phone");
    assert.match(said(again), /already have your details \(Rahul\)/);
  });

  await test("Memory: cancelled halfway, the next enquiry starts after what was already given", async () => {
    const first = await chat(initialChatState(), ["c:lead", "t:Rahul", "t:9876543210", "c:lead:skip", "t:cancel", "t:yes"]);
    assert.equal(first.state.lead.step, null);
    const again = await startPackageEnquiry(goa, first.state);
    assert.equal(again.state.lead.step, "month");
    assert.match(said(again), /Rahul, \+919876543210/);
  });

  await test("Memory: after one enquiry is sent, the next one only asks what's package-specific", async () => {
    const sent = await chat((await atStep("confirm")).state, ["c:lead:submit"]);
    const again = await startPackageEnquiry(goa, sent.state);
    assert.equal(again.state.lead.step, "notes");
    assert.deepEqual(
      [again.state.lead.draft.name, again.state.lead.draft.phone, again.state.lead.draft.month, again.state.lead.draft.adults],
      ["Rahul", "+919876543210", "March 2027", "2"]
    );
    assert.ok(chips(again).includes("lead:newdetails"));
  });

  await test("Memory: 'my name is Rahul' at the start is remembered and used", async () => {
    const hello = await handleText("Hi, my name is Rahul", initialChatState());
    assert.match(said(hello), /Nice to meet you, Rahul/);
    const lead = await handleChip("lead", hello.state);
    assert.equal(lead.state.lead.step, "phone");
    const results = await handleText("kerala", hello.state);
    assert.match(said(results), /^Sure, Rahul! For Kerala, we offer these 2 packages:/);
  });

  await test("Memory: 'Use different details' forgets them and asks again", async () => {
    const sent = await chat((await atStep("confirm")).state, ["c:lead:submit"]);
    const again = await startPackageEnquiry(goa, sent.state);
    const fresh = await handleChip("lead:newdetails", again.state);
    assert.equal(fresh.state.lead.step, "name");
    assert.equal(fresh.state.lead.draft.name, undefined);
  });

  // ---------------------------------------------------------------- customer-care tone

  await test("Tone: results sound like customer care in both languages, never 'I couldn't find'", async () => {
    assert.match(said(await handleText("kerala", initialChatState())), /^Sure! For Kerala, we offer these 2 packages:/);
    const hl = await handleText("kerala packages", initialChatState("hl", true));
    assert.match(said(hl), /^Haan ji! Kerala ke liye hum ye 2 packages provide karte hain:/);
    const none = await chat(initialChatState(), ["c:find", "c:tour:india", "c:dest:Goa", "c:budget:0-10000", "c:duration:all"]);
    assert.match(said(none), /don't have a ready-made package for Goa in that range/);
    assert.ok(!/couldn't find/i.test(said(none)));
  });

  // ---------------------------------------------------------------- report

  for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) {
    console.log(`\n${failures.join("\n\n")}`);
    process.exit(1);
  }
}

main();
