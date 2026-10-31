"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const IMAGES = [
    "/Home/Why%20Choose%20Us/1.jpg",
    "/Home/Why%20Choose%20Us/2.jpg",
    "/Home/Why%20Choose%20Us/3.jpg",
    "/Home/Why%20Choose%20Us/4.jpg",
    "/Home/Why%20Choose%20Us/5.jpg",
    "/Home/Why%20Choose%20Us/6.jpg",
];

const WhyChooseParadiseYatra = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
        }, 3500); // Slower, more elegant transitions

        return () => clearInterval(timer);
    }, []);

    return (
        <section className="bg-white px-4 py-16 md:py-24 text-gray-900 md:px-8 relative overflow-hidden">
            <div className="mx-auto max-w-7xl relative z-10">
                <div className="bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f] rounded-[2rem] overflow-hidden flex flex-col md:flex-row relative shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 group">
                    
                    {/* Decorative glowing orb in the background */}
                    <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-blue-500/20 blur-[100px] pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
                    
                    {/* Left side - Image Slider */}
                    <div className="w-full md:w-1/2 p-4 md:p-6 lg:p-8">
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[4/5] lg:aspect-[4/3] shadow-2xl bg-[#0a192f] border border-white/10 group/slider">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={IMAGES[currentImageIndex]}
                                        alt={`Travelers enjoying Paradise Yatra experience ${currentImageIndex + 1}`}
                                        fill
                                        className="object-cover object-top"
                                        priority={currentImageIndex === 0}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Gradient Overlay for better readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 pointer-events-none"></div>

                            {/* Overlay Badge */}
                            <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20 z-10 transform transition-all duration-300 hover:scale-105 hover:bg-black/60 cursor-pointer">
                                <span className="text-white/90 font-semibold text-xs tracking-wider uppercase">
                                    @paradiseyatra
                                </span>
                            </div>

                            {/* Slide Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10 bg-black/30 backdrop-blur-md px-5 py-3 rounded-full border border-white/10 shadow-xl">
                                {IMAGES.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`h-2 rounded-full transition-all duration-500 ease-out ${currentImageIndex === index
                                            ? "bg-white w-8"
                                            : "bg-white/40 hover:bg-white/80 w-2"
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right side - Content */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:py-0 md:px-12 lg:px-16 text-center md:text-left relative z-10">
                        {/* Vertical divider line */}
                        <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-2/3 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

                        <div className="max-w-lg mx-auto md:mx-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white leading-tight tracking-tight mb-6 drop-shadow-sm">
                                    Why Choose Paradise Yatra
                                </h2>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <p className="text-sm md:text-base !text-white font-medium mb-10 leading-relaxed">
                                    Handpicked experiences, trusted stays, and seamless journeys
                                    crafted for unforgettable memories. We turn your dream vacations into reality with meticulous planning and care.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Link href="/why-choose-us">
                                    <button className="group bg-white hover:bg-blue-50 text-[#0a192f] text-base font-bold px-8 py-4 rounded-full inline-flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1">
                                        Explore Now
                                        <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseParadiseYatra;

