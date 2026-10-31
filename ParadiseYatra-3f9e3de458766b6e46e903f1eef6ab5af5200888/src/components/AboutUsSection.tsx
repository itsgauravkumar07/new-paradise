"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AboutUsSection() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = [
        "/About/Hero/Untitled design.png",
        "/About/Life At Paradise Yatra/Image 1.jpeg",
        "/About/Life At Paradise Yatra/Image 2.jpg",
        "/About/Life At Paradise Yatra/Image 3.jpg"
    ];

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        
        let animationFrameId: number;
        let isHovered = false;

        const scroll = () => {
            if (!isHovered && el) {
                el.scrollTop += 0.5; // Auto-scroll speed
                if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
                    // Slight delay before snapping back to top, or just snap
                    el.scrollTop = 0; 
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        const handleMouseEnter = () => (isHovered = true);
        const handleMouseLeave = () => (isHovered = false);
        const handleTouchStart = () => (isHovered = true);
        const handleTouchEnd = () => (isHovered = false);

        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);
        el.addEventListener("touchstart", handleTouchStart);
        el.addEventListener("touchend", handleTouchEnd);

        animationFrameId = requestAnimationFrame(scroll);

        return () => {
            cancelAnimationFrame(animationFrameId);
            el.removeEventListener("mouseenter", handleMouseEnter);
            el.removeEventListener("mouseleave", handleMouseLeave);
            el.removeEventListener("touchstart", handleTouchStart);
            el.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    return (
        <section className="bg-white py-16 md:py-24 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Column - Image & Stats */}
                    <div className="space-y-8">
                        {/* Main Image */}
                        {/* Main Image Carousel */}
                        <div className="relative h-[350px] sm:h-[400px] w-full rounded-[2rem] overflow-hidden shadow-lg group">
                            <div 
                                id="about-image-carousel"
                                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                onScroll={(e) => {
                                    const scrollLeft = e.currentTarget.scrollLeft;
                                    const width = e.currentTarget.clientWidth;
                                    const index = Math.round(scrollLeft / width);
                                    setCurrentImageIndex(index);
                                }}
                            >
                                {images.map((src, i) => (
                                    <div key={i} className="relative h-full w-full flex-shrink-0 snap-center">
                                        <Image
                                            src={src}
                                            alt={`Travel story ${i + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Arrows */}
                            <button 
                                onClick={() => {
                                    const container = document.getElementById('about-image-carousel');
                                    if(container) container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/50"
                            >
                                ‹
                            </button>
                            <button 
                                onClick={() => {
                                    const container = document.getElementById('about-image-carousel');
                                    if(container) container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/50"
                            >
                                ›
                            </button>

                            {/* Pagination Dots */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                {images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            const container = document.getElementById('about-image-carousel');
                                            if(container) container.scrollTo({ left: container.clientWidth * i, behavior: 'smooth' });
                                        }}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            currentImageIndex === i ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 sm:p-6 text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
                                <div className="text-3xl sm:text-4xl font-black text-[#005beb] mb-1">6+</div>
                                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Years Experience</div>
                            </div>
                            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 sm:p-6 text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
                                <div className="text-3xl sm:text-4xl font-black text-[#005beb] mb-1">50k+</div>
                                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Happy Travelers</div>
                            </div>
                            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 sm:p-6 text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
                                <div className="text-3xl sm:text-4xl font-black text-[#005beb] mb-1">100%</div>
                                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Tailored Tours</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Text Content */}
                    <div className="flex flex-col h-full max-h-[600px]">
                        <span className="text-[13px] font-bold uppercase tracking-widest text-[#005beb] mb-4 flex-shrink-0">
                            Who We Are
                        </span>
                        
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-[1.15] mb-6 tracking-tight flex-shrink-0">
                            Crafting Unforgettable Travel Stories Since 2020
                        </h2>
                        
                        {/* Auto-scrolling SEO Content Container */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto pr-4 space-y-4 text-black leading-relaxed text-[14px] sm:text-[15px] mb-8 font-medium scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300"
                            style={{ 
                                scrollBehavior: 'auto',
                                maskImage: 'linear-gradient(to bottom, transparent, black 15px, black calc(100% - 15px), transparent)',
                                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15px, black calc(100% - 15px), transparent)'
                            }}
                        >
                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900">Travel Agency in Dehradun, India – Paradise Yatra</h3>
                            <p>
                                Planning a holiday is exciting, but choosing the right travel partner is equally important. Most travellers begin with simple questions: Which travel agency can I trust? Who will plan my trip properly? Where can I get affordable tour packages in India? How do I know what is included and what is not?
                            </p>
                            <p>
                                At Paradise Yatra, a trusted travel agency in Dehradun, we help travellers plan smooth, practical, and memorable holidays across India and abroad. Our focus is simple: clear communication, well-planned itineraries, honest guidance, and dependable travel support from the first call to the end of your journey.
                            </p>
                            <p>
                                Whether you are planning a family vacation, honeymoon, group tour, corporate trip, pilgrimage, adventure holiday, or international getaway, Paradise Yatra creates travel plans that match your budget, comfort, and travel style.
                            </p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">Tour Operators in India – What Should Travellers Expect Today?</h3>
                            <p>
                                Travel today is not just about booking hotels and transport. A good tour operator understands your travel purpose, your group type, your comfort level, your budget, and the seasonality of the destination.
                            </p>
                            <p>
                                A family with children may need relaxed sightseeing and comfortable stays. A senior couple may prefer easy transfers and slower-paced itineraries. Young travellers may look for adventure, local experiences, nightlife, and scenic stays. Honeymoon couples may prefer privacy, premium hotels, and romantic experiences.
                            </p>
                            <p>
                                At Paradise Yatra, we listen first and plan later. This helps us design tour packages that are practical on the ground and comfortable for the traveller.
                            </p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">How to Choose a Reliable Travel Agent in India?</h3>
                            <p>
                                A reliable travel agent should not simply sell a package. They should understand your needs, explain what is possible, and guide you honestly.
                            </p>
                            <p>Before booking with any travel company, check the following:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Does the agency explain the itinerary clearly?</li>
                                <li>Are hotel names and categories shared in advance?</li>
                                <li>Are inclusions and exclusions mentioned properly?</li>
                                <li>Is the sightseeing private or shared?</li>
                                <li>Are cancellation and refund rules explained before payment?</li>
                                <li>Is there a contact person available for support during the trip?</li>
                            </ul>
                            <p>
                                Paradise Yatra believes that a good holiday starts with clarity. We make sure travellers know what they are booking, what is included, what is excluded, and what to expect at every stage of the journey.
                            </p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">Affordable Tour Packages in India</h3>
                            <p>
                                Travellers often search for affordable tour packages in India, but affordability should never mean confusion or poor planning. A good budget-friendly package should balance cost, comfort, location, and experience.
                            </p>
                            <p>Paradise Yatra offers customised and affordable holiday packages for popular destinations such as:</p>
                            <p className="font-semibold text-black">
                                Kashmir • Ladakh • Himachal Pradesh • Uttarakhand • Rajasthan • Kerala • Goa • Andaman • North East India • Chardham Yatra • Golden Triangle • Dubai • Maldives • Bali • Thailand • Singapore • Vietnam • Sri Lanka
                            </p>
                            <p>
                                Our team helps you choose the right package according to season, duration, travel group, and budget.
                            </p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">What Is Included in Tour Packages?</h3>
                            <p>Every travel package is different, but most well-planned tour packages may include:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Hotel accommodation with selected meal plan</li>
                                <li>Airport, railway station, or point-to-point transfers</li>
                                <li>Local sightseeing as per itinerary</li>
                                <li>Driver charges, fuel, tolls, parking, and state taxes where applicable</li>
                                <li>Monument entry tickets or activities, if mentioned</li>
                                <li>Guide services, if included in the package</li>
                                <li>Applicable taxes and service charges</li>
                            </ul>
                            <p className="mt-4">Items usually not included unless mentioned:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Flights or train tickets</li>
                                <li>Early check-in or late check-out</li>
                                <li>Meals not mentioned in the itinerary</li>
                                <li>Personal expenses such as laundry, tips, room service, mini-bar, or shopping</li>
                                <li>Optional activities booked on the spot</li>
                                <li>Travel insurance</li>
                                <li>Visa charges for international travel</li>
                                <li>Emergency medical expenses</li>
                                <li>Peak-season surcharges</li>
                            </ul>
                            <p>
                                At Paradise Yatra, we provide clear package details so travellers can compare options properly before confirming their booking.
                            </p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">Documents, Payments, Cancellations, and Travel Insurance</h3>
                            <p>
                                Before booking a tour package, every traveller should keep basic documents ready. For domestic travel, government-issued photo ID is usually required for all travellers. For children, age proof may be required where child rates apply. For restricted areas such as Ladakh, North East, or certain border regions, special permits may be needed.
                            </p>
                            <p>For international travel, travellers may require:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Valid passport</li>
                                <li>Visa documents</li>
                                <li>Passport-size photographs</li>
                                <li>Travel insurance</li>
                                <li>Flight tickets</li>
                                <li>Hotel vouchers</li>
                                <li>Financial documents where required</li>
                                <li>Health or vaccination certificate if applicable</li>
                            </ul>
                            <p>
                                Paradise Yatra guides travellers with the required documentation and provides proper booking vouchers, hotel details, transfer information, and support contacts before departure.
                            </p>
                            <p>
                                Cancellation rules vary depending on hotels, transport, flights, and activities. That is why we recommend checking cancellation policies before final payment. Travel insurance is also advisable, especially for international holidays, adventure tours, high-altitude destinations, and expensive bookings.
                            </p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">Why Customised Travel Itineraries Matter</h3>
                            <p>
                                Ready-made packages are convenient, but they do not always suit every traveller. A customised itinerary gives you better control over your holiday.
                            </p>
                            <p>With a customised package, you can decide:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Travel dates</li>
                                <li>Hotel category</li>
                                <li>Meal plan</li>
                                <li>Sightseeing pace</li>
                                <li>Number of nights</li>
                                <li>Private or shared transfers</li>
                                <li>Adventure activities</li>
                                <li>Honeymoon arrangements</li>
                                <li>Family-friendly options</li>
                                <li>Budget range</li>
                            </ul>
                            <p>
                                Paradise Yatra creates customised travel plans so your holiday feels comfortable, balanced, and meaningful. We avoid over-packed schedules and focus on realistic travel planning.
                            </p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">Popular Domestic Tour Packages by Paradise Yatra</h3>
                            <ul className="space-y-2">
                                <li><strong>Himachal Tour Packages:</strong> Perfect for mountain lovers, honeymoon couples, families, and adventure seekers. Packages for Shimla, Manali, Kasol, Dharamshala, Dalhousie, Kullu, Spiti, and more.</li>
                                <li><strong>Uttarakhand Tour Packages:</strong> Being based in Dehradun, we have strong destination understanding of Uttarakhand. Tours for Mussoorie, Rishikesh, Haridwar, Nainital, Jim Corbett, Auli, Chopta, Kedarnath, Badrinath, Gangotri, Yamunotri, and Chardham Yatra.</li>
                                <li><strong>Kashmir Tour Packages:</strong> Ideal for couples, families, and nature lovers. Includes Srinagar, Gulmarg, Pahalgam, Sonmarg, houseboat stays, shikara rides, and scenic valley tours.</li>
                                <li><strong>Rajasthan Tour Packages:</strong> Known for forts, palaces, heritage hotels, desert experiences, and royal culture. Packages for Jaipur, Udaipur, Jodhpur, Jaisalmer, Pushkar, Mount Abu, and Bikaner.</li>
                                <li><strong>Kerala Tour Packages:</strong> Offers backwaters, beaches, Ayurveda, hill stations, and nature stays. Popular destinations include Munnar, Alleppey, Thekkady, Kochi, Kovalam, and Wayanad.</li>
                                <li><strong>Goa Tour Packages:</strong> Ideal for beach lovers, couples, friends, and short holidays. Budget, premium, and customised Goa packages.</li>
                                <li><strong>Chardham Yatra Packages:</strong> Organised from Dehradun, Haridwar, and Rishikesh. Routes planned carefully with proper halts, comfortable stays, and travel support.</li>
                            </ul>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">International Holiday Packages</h3>
                            <p>
                                Paradise Yatra also offers international tour packages for travellers looking for easy, well-planned holidays abroad. Popular destinations include: Dubai, Maldives, Bali, Thailand, Singapore, Vietnam, Sri Lanka, Mauritius, Europe, Bhutan, and Nepal.
                            </p>
                            <p>
                                From visa guidance to hotel booking, sightseeing, transfers, and complete itinerary planning, our team helps make your international holiday smooth and stress-free.
                            </p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">How to Book a Holiday with Paradise Yatra</h3>
                            <ol className="list-decimal pl-5 space-y-1">
                                <li>Share your travel dates, destination, number of travellers, and budget.</li>
                                <li>Our travel expert will understand your requirements.</li>
                                <li>We will prepare a suitable itinerary with hotel and transport options.</li>
                                <li>You can request changes according to your comfort.</li>
                                <li>Once finalised, you can confirm the booking with payment.</li>
                                <li>Before travel, we share vouchers, contact details, and important travel notes.</li>
                            </ol>
                            <p>Our aim is to make the entire booking process simple, transparent, and comfortable.</p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">Why Choose Paradise Yatra?</h3>
                            <p>Paradise Yatra is a Dehradun-based travel agency offering domestic and international tour packages for all types of travellers. You should choose us because:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>We create customised tour packages.</li>
                                <li>We provide clear inclusions and exclusions.</li>
                                <li>We offer budget-friendly and premium options.</li>
                                <li>We plan practical itineraries, not rushed schedules.</li>
                                <li>We help with hotels, transport, sightseeing, and activities.</li>
                                <li>We provide support before and during the trip.</li>
                                <li>We understand Uttarakhand, Himachal, Kashmir, and North India routes well.</li>
                                <li>We offer packages for families, couples, groups, solo travellers, and corporate clients.</li>
                            </ul>
                            <p>For us, travel is not just a booking. It is an experience that should feel smooth, safe, and memorable.</p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">Travel Agency in Dehradun for Domestic and International Tours</h3>
                            <p>
                                Paradise Yatra is one of the growing travel agencies in Dehradun, helping travellers explore India and the world with confidence. From peaceful mountain holidays to luxury beach vacations, from pilgrimage tours to adventure trips, from honeymoon packages to family holidays, we plan every journey with care.
                            </p>
                            <p>
                                Our team focuses on practical travel planning, trusted hotel options, comfortable transport, and honest guidance. Whether you are travelling from Dehradun, Haridwar, Rishikesh, Delhi NCR, or any other city in India, Paradise Yatra can help you plan a complete holiday package.
                            </p>

                            <h3 style={{ WebkitTextStroke: '0.7px currentColor' }} className="text-2xl font-black text-slate-900 mt-6">Plan Your Next Holiday with Paradise Yatra</h3>
                            <p>
                                If you are looking for a trusted tour and travel agency in Dehradun, Paradise Yatra is here to help you plan your next journey. Tell us where you want to go, how you want to travel, and what kind of experience you are looking for.
                            </p>
                            <p>We will help you create a travel plan that fits your budget, comfort, and expectations.</p>
                            <p className="font-bold text-[#005beb]">Paradise Yatra – Your trusted travel partner in Dehradun for domestic and international tour packages.</p>
                            
                            <div className="py-4"></div> {/* Bottom padding to allow reading last line fully before loop */}
                        </div>

                        {/* Feature List (Fixed at bottom) */}
                        <div className="space-y-4 pt-4 border-t border-slate-100 flex-shrink-0">
                            {[
                                "Handpicked Premium Accommodations",
                                "24/7 Global On-Trip Support & Assistance",
                                "Flexible Payment Options & Simple Installments"
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-[#005beb] stroke-[3]" />
                                    </div>
                                    <span className="text-black font-bold text-sm sm:text-[15px]">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
