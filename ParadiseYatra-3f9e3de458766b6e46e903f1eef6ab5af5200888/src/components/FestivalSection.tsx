"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface FestivalDestination {
    id: number;
    name: string;
    price: number;
    image: string;
    href: string;
    location: string;
}

const FESTIVAL_DESTINATIONS: FestivalDestination[] = [
    {
        id: 1,
        name: "Rio Carnival",
        price: 45000,
        image: "https://images.unsplash.com/photo-1522008629172-0c17aa47d1ee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
        location: "Brazil",
    },
    {
        id: 2,
        name: "Cherry Blossom",
        price: 35000,
        image: "https://images.unsplash.com/photo-1526344966-89049886b28d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
        location: "Japan",
    },
    {
        id: 3,
        name: "Lantern Festival",
        price: 25000,
        image: "https://images.unsplash.com/photo-1523296066596-7ff8bb6e6d29?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
        location: "Thailand",
    },
    {
        id: 4,
        name: "Oktoberfest",
        price: 28000,
        image: "https://images.unsplash.com/photo-1729467067923-78d629125e3e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
        location: "Germany",
    },
    {
        id: 5,
        name: "Day of the Dead",
        price: 32000,
        image: "https://images.unsplash.com/photo-1667090762902-bd8ee938d3d5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
        location: "Mexico",
    },
    {
        id: 6,
        name: "Loy Krathong",
        price: 18000,
        image: "https://images.unsplash.com/photo-1763818693963-bac021e7b739?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        href: "/coming-soon",
        location: "Thailand",
    },
];

const FestivalSection = () => {
    return (
        <section className="bg-[#fcfbf9] py-12 md:py-16 px-4 md:px-8 font-sans relative">
            <div className="mx-auto max-w-[1200px]">
                
                {/* Ultra-Minimal Luxury Header */}
                <div className="flex flex-col items-center justify-center text-center mb-10 md:mb-14">
                    <span className="text-black tracking-[0.2em] uppercase text-[10px] md:text-xs font-semibold mb-3">
                        Curated Global Experiences
                    </span>
                    {/* Using Playfair Display or a generic serif for an editorial look */}
                    <h2 className="text-3xl md:text-4xl font-serif text-[#1c1b1a] mb-4 font-normal">
                        Iconic Celebrations
                    </h2>
                    <div className="w-12 h-[1px] bg-[#d5d1c8]"></div>
                    <p className="mt-4 text-black font-light max-w-lg text-xs md:text-sm leading-relaxed">
                        Journey to the heart of the world's most vibrant traditions. Experience celebrations that define cultures and transcend borders.
                    </p>
                </div>

                {/* Editorial Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {FESTIVAL_DESTINATIONS.map((dest) => (
                        <Link 
                            key={dest.id} 
                            href={dest.href} 
                            className="group cursor-pointer block transition-transform duration-700 bg-white p-3 md:p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#f0efeb] hover:-translate-y-1"
                        >
                            {/* Image Container */}
                            <div className="relative overflow-hidden w-full aspect-[4/3] mb-4 rounded-lg">
                                <Image 
                                    src={dest.image} 
                                    alt={dest.name}
                                    fill 
                                    className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105" 
                                />
                                {/* Subtle overlay that fades out on hover */}
                                <div className="absolute inset-0 bg-[#3a352d]/5 group-hover:bg-transparent transition-colors duration-1000 mix-blend-multiply"></div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex flex-col items-center text-center">
                                <span className="text-[#a09c95] text-[10px] tracking-[0.1em] uppercase mb-1 font-semibold transition-colors duration-500 group-hover:text-[#bda474]">
                                    {dest.location}
                                </span>
                                
                                <h3 className="text-lg md:text-xl font-serif text-[#1c1b1a] mb-2 transition-colors duration-500">
                                    {dest.name}
                                </h3>
                                
                                <div className="flex items-center gap-2">
                                    <p className="text-[#1c1b1a] font-medium text-sm">
                                        ₹{dest.price.toLocaleString('en-IN')}
                                    </p>
                                    <div className="w-5 h-5 rounded-full border border-[#d5d1c8] flex items-center justify-center text-[#1c1b1a] group-hover:bg-[#1c1b1a] group-hover:text-white transition-colors duration-500">
                                        <ArrowRight className="w-2.5 h-2.5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {/* View All button at the bottom */}
                <div className="mt-10 md:mt-12 flex justify-center">
                    <Link
                        href="/package/theme/cultural"
                        className="group relative flex items-center gap-4 text-[#1c1b1a] font-light text-sm tracking-widest uppercase overflow-hidden"
                    >
                        <span className="relative z-10">Discover All Tours</span>
                        <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
                        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#1c1b1a] transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500"></span>
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default FestivalSection;
