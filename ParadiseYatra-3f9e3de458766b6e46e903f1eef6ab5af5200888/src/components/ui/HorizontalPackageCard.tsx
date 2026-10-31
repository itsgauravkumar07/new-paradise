"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, ArrowRight, Hotel, Utensils, Car, Camera, ChevronLeft, ChevronRight, User, Mail, Phone, MessageSquare, Loader2, Send } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-toastify";

interface HorizontalPackageCardProps {
    id: string;
    title: string;
    destination: string;
    duration: string;
    description: string;
    price: number;
    priceLabel?: string;
    image?: string;
    images?: string[];
    imageAlt?: string;
    detailUrl: string;
    itinerary?: any[];
}

const formatDurationDisplay = (duration: string) => {
    if (!duration) return "";
    const nightsDaysMatch = duration.match(/^\s*(\d+)\s*N\s*\/\s*(\d+)\s*D\s*$/i);
    if (nightsDaysMatch) {
        const nights = nightsDaysMatch[1];
        const days = nightsDaysMatch[2];
        return `${nights} night/${days} days`;
    }
    return duration;
};

const HorizontalPackageCard: React.FC<HorizontalPackageCardProps> = ({
    id,
    title,
    destination,
    duration,
    description,
    price,
    priceLabel = "Starting From",
    image,
    images = [],
    imageAlt,
    detailUrl,
    itinerary,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const unitLabel = /couple/i.test(priceLabel) ? "per couple" : "per person";
    const altText = imageAlt?.trim() || title || destination || "Package image";

    // Dynamic destination sequence from itinerary
    const formatDestinations = (itin?: any[], fallback?: string) => {
        if (!itin || itin.length === 0) return fallback || "";
        
        const stopWords = [
            /arrival in/gi, /arrival at/gi, /arrival/gi, /departure from/gi, /departure/gi,
            /sightseeing/gi, /exploration/gi, /transfer to/gi, /transfer/gi, /tour/gi,
            /culture & nature/gi, /culture and nature/gi, /& beaches/gi, /and beaches/gi,
            /leisure/gi, /day at/gi, /trip to/gi, /excursion to/gi, /visit to/gi, /approx\.?/gi,
            /\bday\s*\d+\b/gi, /\bday\b/gi, /\b\d+\s*kms?\b/gi, /\b\d+\s*km\b/gi,
            /\b\d+\s*hrs?\b/gi, /\b\d+\s*hours?\b/gi, /\b\d+\s*hr\b/gi
        ];

        const extractName = (t: string) => {
            let cleaned = t;
            // First remove anything in parentheses, including unclosed ones at the end of the string
            cleaned = cleaned.replace(/\([^)]*(?:\)|$)/g, '');
            stopWords.forEach(re => { cleaned = cleaned.replace(re, ''); });
            // Clean up any remaining loose slashes or numbers surrounded by slashes if any
            cleaned = cleaned.replace(/\b\d+\s*\/\s*\d+\b/g, ''); // "7 / 7"
            cleaned = cleaned.replace(/\/\s*\d+/g, ''); // "/ 7"
            cleaned = cleaned.replace(/\d+\s*\//g, ''); // "7 /"
            return cleaned.replace(/[–\-:\/]/g, ' ').replace(/\s+/g, ' ').trim();
        };

        const places = itin.map(day => extractName(day.title || "")).filter(t => t.length > 0);
        const sequence: string[] = [];
        
        places.forEach(place => {
            const parts = place.split(/\s+to\s+/i).map(p => p.trim());
            parts.forEach(p => {
                if (p) {
                    const last = sequence[sequence.length - 1];
                    if (!last || (last.toLowerCase() !== p.toLowerCase() && !p.toLowerCase().includes(last.toLowerCase()))) {
                        sequence.push(p);
                    } else if (last && p.toLowerCase().includes(last.toLowerCase())) {
                        sequence[sequence.length - 1] = p;
                    }
                }
            });
        });

        const finalSequence = sequence.filter((item, pos, self) => self.indexOf(item) === pos);
        return finalSequence.length > 0 ? finalSequence.join(" → ") : fallback || "";
    };

    const displayDestinations = formatDestinations(itinerary, destination);

    const allImages = images && images.length > 0 ? images : image ? [image] : [];

    const handlePrevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    };

    const optimizedImageUrl = getImageUrl(allImages[currentImageIndex], {
        width: "auto",
        height: 640,
        crop: "fill",
        gravity: "auto",
        quality: "good",
    });

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !email || !phoneNumber || !message) {
            toast.error('Please fill in all fields.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    email,
                    phone: phoneNumber,
                    destination: destination || "Not specified",
                    message,
                    packageTitle: title,
                    packagePrice: price ? String(price) : "",
                    newsletterConsent: false,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                toast.success("Query sent successfully! We'll contact you soon.");
                setIsQueryModalOpen(false);
                setFullName('');
                setEmail('');
                setPhoneNumber('');
                setMessage('');
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to send query. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred while sending your query.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="group relative bg-white rounded-[20px] border border-[#dfe1df] transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,9,69,0.15)] hover:-translate-y-1 overflow-hidden h-auto flex flex-col sm:flex-row">
            {/* Image Placeholder or Optimized Image */}
            <div className="relative w-full h-48 sm:w-2/5 sm:h-auto overflow-hidden shrink-0 group/slider">
                {optimizedImageUrl ? (
                    <>
                        <Image
                            key={currentImageIndex} // force re-render for smooth transition or just let it swap src
                            src={optimizedImageUrl}
                            alt={altText}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            unoptimized={true}
                        />
                        {/* Slider Controls */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-10 shadow-md"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-10 shadow-md"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                
                                {/* Pagination Dots */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                                    {allImages.map((_, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-slate-200" />
                    </div>
                )}

            </div>

            {/* Content Section */}
            <div className="flex-1 p-4 flex flex-col min-w-0">
                <div className="block">
                    <div className="inline-flex items-center bg-[#EFF6FF] text-[#314594] text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-1.5">
                        {formatDurationDisplay(duration)}
                    </div>

                    <Link href={detailUrl} className="block group/title">
                        <h3 className="!text-lg sm:!text-[18px] !font-bold text-[#000945] leading-tight mb-1.5 transition-colors line-clamp-1 group-hover/title:underline">
                            {title}
                        </h3>
                    </Link>

                    {/* New code start here ------ */}
                    <div className="flex items-center gap-3 sm:flex-wrap sm:gap-x-4 sm:gap-y-2 mb-2 mt-3">
                        <div className="flex items-center gap-1.5 text-[#000945] transition-colors" title="Hotel Included">
                            <Hotel className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline text-[11px] font-semibold leading-none">Hotels</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#000945] transition-colors" title="Meals Included">
                            <Utensils className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline text-[11px] font-semibold leading-none">Meals</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#000945] transition-colors" title="Transfers Included">
                            <Car className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline text-[11px] font-semibold leading-none">Transport</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#000945] transition-colors" title="Sightseeing Included">
                            <Camera className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline text-[11px] font-semibold leading-none">Sightseeing</span>
                        </div>
                        <span className="text-[11px] text-[#000945] font-semibold sm:border-l sm:border-slate-200 sm:pl-3 leading-none" title="Insurance & Local Guide included">
                            +2
                        </span>
                    </div>
                    {/* New code end here ----  */}

                </div>

                <div className="flex flex-col gap-3 min-[1181px]:flex-row min-[1181px]:items-end min-[1181px]:justify-between mt-3 pt-3 border-t border-dashed border-slate-200">
                    <div>
                        {/* <p className="text-[12px] text-[#000945] mb-0.5">from</p> */}
                        <div className="flex items-baseline whitespace-nowrap">
                            <span className="text-xl min-[640px]:max-[845px]:text-lg min-[846px]:max-[1180px]:text-lg !font-black text-[#155dfc] whitespace-nowrap">
                                ₹ {(price || 0).toLocaleString()}
                            </span>
                            <span className="text-[12px] text-[#000945] ml-1 font-medium whitespace-nowrap">
                                /{unitLabel}
                            </span>
                        </div>
                    </div>

                   <div className="grid grid-cols-2 gap-2 w-full min-[1181px]:w-auto min-[1181px]:flex min-[1181px]:items-center">
                        <button
                            onClick={(e) => { e.preventDefault(); setIsQueryModalOpen(true); }}
                            className="bg-white border border-[#155dfc] text-[#155dfc] hover:bg-[#155dfc] hover:text-white text-[12px] font-bold py-2.5 px-3 min-[1181px]:px-5 rounded-[10px] transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                        >
                            Enquire Now
                        </button>
                        <Link
                            href={detailUrl}
                            className="bg-gradient-to-r from-[#155dfc] to-[#000945] hover:opacity-90 text-white text-[12px] font-bold py-2.5 px-3 min-[1181px]:px-6 rounded-[10px] transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-md shadow-[#155dfc]/30 whitespace-nowrap"
                        >
                            View Details
                            <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Query Modal */}
            <Dialog open={isQueryModalOpen} onOpenChange={setIsQueryModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border border-slate-200 shadow-xl rounded-xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                    <DialogHeader className="bg-gradient-to-r from-[#155dfc] to-[#000945] p-5 shrink-0">
                        <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                            <Send className="w-5 h-5" /> Enquire About This Package
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="mb-4">
                            <h4 className="text-[15px] font-bold text-[#000945] leading-tight mb-1">{title}</h4>
                            <p className="text-[13px] text-slate-500 font-medium">₹ {(price || 0).toLocaleString()} {unitLabel}</p>
                        </div>
                        <form onSubmit={handleQuerySubmit} className="flex flex-col gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-[#000945] flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-blue-600" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-white border border-[#dfe1df] rounded-[8px] h-10 px-3 py-2 text-sm text-[#000945] shadow-sm outline-none focus:ring-2 focus:ring-[#155dfc]/50 focus:border-[#155dfc] transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-[#000945] flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white border border-[#dfe1df] rounded-[8px] h-10 px-3 py-2 text-sm text-[#000945] shadow-sm outline-none focus:ring-2 focus:ring-[#155dfc]/50 focus:border-[#155dfc] transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-[#000945] flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Enter your number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full bg-white border border-[#dfe1df] rounded-[8px] h-10 px-3 py-2 text-sm text-[#000945] shadow-sm outline-none focus:ring-2 focus:ring-[#155dfc]/50 focus:border-[#155dfc] transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-[#000945] flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Message
                                </label>
                                <textarea
                                    required
                                    placeholder="Any special requirements?"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-white border border-[#dfe1df] rounded-[8px] px-3 py-2 text-sm text-[#000945] shadow-sm outline-none focus:ring-2 focus:ring-[#155dfc]/50 focus:border-[#155dfc] transition-all placeholder:text-slate-400 min-h-[80px] resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-2 w-full bg-[#155dfc] hover:bg-[#0d45c5] text-white font-bold h-11 rounded-[8px] transition-colors flex items-center justify-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending Query...</>
                                ) : (
                                    "Submit Query"
                                )}
                            </button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HorizontalPackageCard;
