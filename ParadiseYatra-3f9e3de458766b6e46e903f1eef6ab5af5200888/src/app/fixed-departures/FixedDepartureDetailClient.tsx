"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Shield,
  Users,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import PastTripsSection from "@/components/PastTripsSection";
import LoginAlertModal from "@/components/LoginAlertModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { preserveRichTextSpacing } from "@/lib/richText";

interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  meals?: string;
  hotel?: string;
}

interface Departure {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  duration: string;
  price: number;
  originalPrice?: number | null;
  availableSeats: number;
  totalSeats: number;
  image: string;
  tag: string;
  shortDescription: string;
  longDescription: string;
  highlights: string[];
  itinerary: ItineraryItem[];
  inclusions: string[];
  exclusions: string[];
  departures?: { date: string; price: number; seats: number; status: string }[];
}

interface FixedDepartureDetailClientProps {
  departure: Departure;
}

const containsHtml = (value: string = ""): boolean => /<\/?[a-z][\s\S]*>/i.test(value);

const parseFlexibleDate = (value?: string) => {
  if (!value) return null;
  const raw = String(value).trim();

  // Support dd/mm/yyyy input from admin forms.
  const ddmmyyyy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    const parsed = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return null;
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const parsed = parseFlexibleDate(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const toDateInput = (value?: string) => {
  if (!value) return "";
  const parsed = parseFlexibleDate(value);
  if (!parsed) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// const formatPrice = (amount: number) => `₹${(amount || 0).toLocaleString("en-IN")}`;


const formatPrice = (amount: number) => `₹${(amount || 0).toLocaleString("en-IN")}`;

const isPastBatchDate = (value?: string) => {
  const parsed = parseFlexibleDate(value);
  if (!parsed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return parsed.getTime() < today.getTime();
};


export default function FixedDepartureDetailClient({ departure }: FixedDepartureDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [openDay, setOpenDay] = useState<number | null>(0);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const availableBatches = useMemo(
    () =>
      (departure.departures || []).filter((d) => {
        const status = String(d.status || "").toLowerCase().replace(/\s+/g, "");
        return status !== "soldout";
      }),
    [departure.departures]
  );

    const defaultBatch = useMemo(() => {
    if (availableBatches.length > 0) {
      return availableBatches[0];
    }
    return null;
  }, [availableBatches]);

  const [selectedBatchDate, setSelectedBatchDate] = useState<string>(
    toDateInput(defaultBatch?.date) || toDateInput(departure.departureDate) || ""
  );
  // const [selectedPrice, setSelectedPrice] = useState<number>(defaultBatch?.price || departure.price);

  const [selectedPrice, setSelectedPrice] = useState<number>(defaultBatch?.price || departure.price);
  const [selectedSeats, setSelectedSeats] = useState<number>(
    defaultBatch ? Number(defaultBatch.seats) : departure.availableSeats
  );

  const shortDescription = departure.shortDescription || departure.subtitle || "";

  const discount =
    departure.originalPrice && departure.originalPrice > selectedPrice
      ? Math.round(((departure.originalPrice - selectedPrice) / departure.originalPrice) * 100)
      : 0;

  const handleBatchSelect = (date: string, price: number, seats?: number, openEnquiry = false) => {
    const normalizedDate = toDateInput(date);
    setSelectedBatchDate(normalizedDate || "");
    setSelectedPrice(Number(price || departure.price));
    if (typeof seats === "number" && !Number.isNaN(seats)) {
      setSelectedSeats(seats);
    }
    if (openEnquiry) {
      setIsLeadFormOpen(true);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    setSubmitting(true);
    const query = new URLSearchParams({
      type: "fixed-departure",
      slug: departure.slug,
      departureDate: selectedBatchDate || toDateInput(departure.departureDate),
    });
    router.push(`/checkout?${query.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-background"
    >
      <Header />

      <section className="relative pt-6 sm:pt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="relative overflow-hidden rounded-3xl shadow-xl h-[350px] sm:h-[420px] lg:h-[500px]">
            <img src={departure.image} alt={departure.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="inline-flex items-center px-2 py-1 bg-primary-light text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100 mb-3">
                <MapPin className="h-3.5 w-3.5 mr-2" />
                {departure.destination}
              </div>
              <h1 className="!text-2xl sm:!text-3xl md:!text-4xl !font-extrabold text-white leading-tight">
                {departure.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-14">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {containsHtml(shortDescription) ? (
                <div
                  className="!text-md !text-slate-500 font-medium max-w-2xl leading-relaxed [&_p]:!m-0 [&_p]:!text-slate-500 [&_h1]:!m-0 [&_h1]:!text-lg [&_h1]:!font-bold [&_h2]:!m-0 [&_h2]:!text-base [&_h2]:!font-bold [&_h3]:!m-0 [&_h3]:!text-sm [&_h3]:!font-semibold [&_ul]:!m-0 [&_ul]:!list-disc [&_ul]:!pl-5 [&_ol]:!m-0 [&_ol]:!list-decimal [&_ol]:!pl-5 [&_li]:!m-0 [&_li_p]:!m-0 [&_ul_li::marker]:!text-blue-500 [&_ol_li::marker]:!text-blue-500 [&_a]:!text-blue-600 [&_a]:!underline"
                  dangerouslySetInnerHTML={{ __html: preserveRichTextSpacing(shortDescription) }}
                />
              ) : (
                <p className="!text-md !text-slate-500 font-medium max-w-2xl leading-relaxed">
                  {shortDescription}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 sm:gap-8 py-6 border-y border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center border border-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold !text-slate-700 uppercase tracking-tighter">Duration</p>
                    <p className="!text-slate-900 font-bold">{departure.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold !text-slate-700 uppercase tracking-tighter">Departure</p>
                    <p className="!text-slate-900 font-bold">{formatDate(selectedBatchDate || departure.departureDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold !text-slate-700 uppercase tracking-tighter">Seats</p>
                    <p className="!text-slate-900 font-bold">{departure.availableSeats} / {departure.totalSeats}</p>
                  </div>
                </div>

              </div>
            </motion.div>

            <section>
              <h2 className="!text-2xl !font-bold text-slate-900 mb-4">Trip Overview</h2>
              {containsHtml(departure.longDescription || "") ? (
                <div
                  className="!text-slate-700 !leading-relaxed overflow-x-auto [&_p]:!m-0 [&_ul]:!m-0 [&_ul]:!list-disc [&_ul]:!pl-5 [&_ol]:!m-0 [&_ol]:!list-decimal [&_ol]:!pl-5 [&_li]:!m-0 [&_li_p]:!m-0"
                  dangerouslySetInnerHTML={{ __html: preserveRichTextSpacing(departure.longDescription || "") }}
                />
              ) : (
                <p className="!text-slate-700 !leading-relaxed">{departure.longDescription}</p>
              )}
            </section>

            <section>
              <h2 className="!text-2xl !font-bold text-slate-900 mb-4">About {departure.destination}</h2>
              <div className="bg-primary-light/50 p-6 rounded-xl border border-blue-100">
                <p className="!text-slate-700 !leading-relaxed">
                  {(departure as any).aboutDestination || `Discover the breathtaking beauty, rich culture, and serene landscapes of ${departure.destination}. Whether you are seeking spiritual peace, thrilling adventures, or simply a refreshing escape from the ordinary, ${departure.destination} offers an unforgettable experience that will leave you with cherished memories for a lifetime.`}
                </p>
              </div>
            </section>

            {departure.highlights?.length > 0 && (
              <section>
                <h2 className="!text-2xl !font-bold text-slate-900 mb-6">Experience Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departure.highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-primary-light/50 border border-blue-100/50 rounded-2xl"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center">
                        <Check className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="!text-md text-slate-700 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {departure.itinerary?.length > 0 && (
              <section>
                <h2 className="!text-2xl !font-bold text-slate-900 mb-6">Detailed Itinerary</h2>
                <div className="space-y-4">
                  {departure.itinerary.map((day, index) => (
                    <div key={index} className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => setOpenDay(openDay === index ? null : index)}
                        className="w-full flex items-center gap-4 p-4 text-left bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={`flex-shrink-0 w-14 h-11 rounded-xl flex items-center justify-center font-bold !text-sm border ${
                            openDay === index
                              ? "bg-primary text-white border-blue-600"
                              : "bg-white border-slate-200 text-slate-500"
                          }`}
                        >
                          Day {day.day}
                        </div>
                        <div className="flex-grow">
                          <h3 className={`!text-base sm:!text-lg !font-semibold ${openDay === index ? "text-blue-700" : "text-slate-800"}`}>
                            {day.title}
                          </h3>
                        </div>
                        <ChevronDown className={`w-5 h-5 ${openDay === index ? "text-blue-600 rotate-180" : "text-slate-400"}`} />
                      </button>
                      <AnimatePresence>
                        {openDay === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-5 pt-4 border-t border-slate-100 space-y-3">
                              {containsHtml(day.description || "") ? (
                                <div
                                  className="!text-slate-700 overflow-x-auto [&_p]:!m-0 [&_ul]:!m-0 [&_ul]:!list-disc [&_ul]:!pl-5 [&_ol]:!m-0 [&_ol]:!list-decimal [&_ol]:!pl-5 [&_li]:!m-0 [&_li_p]:!m-0"
                                  dangerouslySetInnerHTML={{ __html: preserveRichTextSpacing(day.description || "") }}
                                />
                              ) : (
                                <p className="!text-slate-700 leading-relaxed">{day.description}</p>
                              )}
                              {(day.meals || day.hotel) && (
                                <div className="flex flex-wrap gap-3 pt-2">
                                  {day.meals && (
                                    <span className="text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">
                                      Meals: {day.meals}
                                    </span>
                                  )}
                                  {day.hotel && (
                                    <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">
                                      Stay: {day.hotel}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                  <h3 className="!text-2xl !font-bold text-slate-900 mb-6">What&apos;s Included</h3>
                  <ul className="space-y-4">
                    {departure.inclusions?.map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="mt-1 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-slate-600 !text-md">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                  <h3 className="!text-2xl !font-bold text-slate-900 mb-6">What&apos;s Excluded</h3>
                  <ul className="space-y-4">
                    {departure.exclusions?.map((item, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="mt-1 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <X className="h-3 w-3 text-red-600" />
                        </div>
                        <span className="text-slate-600 !text-md">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>


          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-28">
              <Card className="p-0 border-none shadow-[0_32px_64px_-16px_rgba(37,99,235,0.2)] rounded-3xl overflow-hidden bg-white">
                <div className="bg-primary p-8 text-white text-center">
                  <p className="!text-blue-100 !font-bold uppercase tracking-widest text-xs mb-2">Fixed Departure</p>
                  <div className="text-4xl font-extrabold mb-1">{formatPrice(selectedPrice)}</div>
                  <p className="!text-blue-100/80 !text-sm !font-medium">Per Person</p>
                  {discount > 0 && (
                    <div className="mt-4 bg-white/20 rounded-full py-1 px-4 inline-block text-xs font-bold">
                      Special {discount}% Off
                    </div>
                  )}
                </div>

                <CardContent className="p-6 space-y-5">


                  <Button
                    onClick={() => setIsLeadFormOpen(true)}

                    className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-full !text-lg !font-extrabold"
                  >
                    Enquiry <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <div className="rounded-xl border border-blue-100 bg-primary-light p-3 text-xs text-blue-700 font-semibold flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                    Secure payment checkout with instant receipt confirmation.
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <PastTripsSection variant="feature" destination={departure?.destination} className="mt-10 border-t border-slate-100" />

      <LeadCaptureForm
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        packageTitle={departure?.title}
        packagePrice={formatPrice(selectedPrice)}
        departureDate={formatDate(selectedBatchDate || departure.departureDate)}
        bannerImage={departure.image}
        bannerTitle={departure.title}
        bannerSubtitle={departure.duration ? `Fixed Departure · ${departure.duration}` : "Fixed Departure"}
        heading="Enquire About This Departure"
        subheading="Share your details and our travel expert will call you with seat availability, pricing and inclusions for this departure."
        submitLabel="Submit"
        emailRequired={false}
      />
      
    </motion.div>
  );
}
