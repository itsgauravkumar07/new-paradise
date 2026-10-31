"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export default function WhyParadiseDifference() {
    return (
        <section className="bg-white py-12 md:py-16 px-4 md:px-8">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Left Column */}
                <div className="w-full lg:w-5/12">
                    <h3 className="!text-[24px] md:!text-[36px] !font-bold text-[#000945] !leading-[1.1] mb-5 tracking-tight">
                        Why Choose<br />
                        Paradise Yatra
                    </h3>
                    <p className="text-slate-600 font-medium mb-8 leading-relaxed text-[15px] md:text-base max-w-sm">
                        For over a decade, we've been a proud travel partner, earning and maintaining the trust of travelers across India and beyond.
                    </p>
                    <div className="flex flex-wrap items-center gap-6 md:gap-8 font-bold text-[#005beb] text-[15px]">
                        <a href="tel:+919873391733" className="flex items-center gap-1 group">
                            <span className="border-b-2 border-[#005beb] pb-0.5">Call Now</span>
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                        <a href="/contact" className="flex items-center gap-1 group">
                            <span className="border-b-2 border-[#005beb] pb-0.5">Book Free Estimate</span>
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-7/12 relative mt-6 lg:mt-0">
                    <div className="flex flex-col md:flex-row gap-x-8 relative py-2">
                        {/* Vertical Divider */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#d3d3d3] hidden md:block -translate-x-1/2"></div>

                        {/* Left Column (Downwards) */}
                        <div className="flex-1 flex flex-col gap-y-6 md:pt-10">
                            {/* Feature 1 */}
                            <div className="flex gap-3 relative z-10 bg-white py-2">
                                <div className="flex-shrink-0 mt-1">
                                    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M24 10V42" stroke="#000945" strokeWidth="2.5" strokeLinecap="round" />
                                        <path d="M12 20L36 16" stroke="#000945" strokeWidth="2.5" strokeLinecap="round" />
                                        <path d="M9 20L15 20L12 28Z" fill="#60a5fa" stroke="#000945" strokeWidth="2.5" strokeLinejoin="round" />
                                        <path d="M33 16L39 16L36 24Z" fill="#60a5fa" stroke="#000945" strokeWidth="2.5" strokeLinejoin="round" />
                                        <path d="M18 42H30" stroke="#000945" strokeWidth="2.5" strokeLinecap="round" />
                                        <circle cx="36" cy="12" r="5" fill="#60a5fa" stroke="#000945" strokeWidth="2" />
                                        <path d="M36 10V14M34 12H38" stroke="#000945" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="!font-bold !text-[20px] text-[#000945] mb-0.5 leading-snug">
                                        Competitive Pricing
                                    </h3>
                                    <p className="text-[13px] text-slate-600 leading-[1.6] font-medium pr-2">
                                        Experience world-class travel with our unbeatable market rates. Explore our <a href="/package/theme/trending" className="text-[#005beb] border-b border-[#005beb]">trending packages</a> to grab the best deals today.
                                    </p>
                                </div>
                            </div>

                            {/* Horizontal Divider Left */}
                            <div className="h-[1px] bg-[#d3d3d3] w-full hidden md:block"></div>

                            {/* Feature 3 */}
                            <div className="flex gap-3 relative z-10 bg-white py-2">
                                <div className="flex-shrink-0 mt-1">
                                    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="24" cy="20" r="10" fill="#60a5fa" stroke="#000945" strokeWidth="2.5" />
                                        <path d="M18 28L16 40L24 36L32 40L30 28" fill="#60a5fa" stroke="#000945" strokeWidth="2.5" strokeLinejoin="round" />
                                        <path d="M20 20L23 23L28 17" stroke="#000945" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="!font-bold !text-[20px] text-[#000945] mb-0.5 leading-snug">
                                        Certified Experts
                                    </h3>
                                    <p className="text-[13px] text-slate-600 leading-[1.6] font-medium pr-2">
                                        Our tours are led by highly skilled professionals with years of experience. Discover why travelers trust our <a href="/why-choose-us" className="text-[#005beb] border-b border-[#005beb]">certified experts</a>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Upwards) */}
                        <div className="flex-1 flex flex-col gap-y-6">
                            {/* Feature 2 */}
                            <div className="flex gap-3 relative z-10 bg-white py-2">
                                <div className="flex-shrink-0 mt-1">
                                    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="12" y="8" width="20" height="28" rx="2" fill="#60a5fa" stroke="#000945" strokeWidth="2.5" />
                                        <path d="M18 6H26V10H18V6Z" fill="white" stroke="#000945" strokeWidth="2.5" strokeLinejoin="round" />
                                        <path d="M16 16H24M16 22H28M16 28H24" stroke="#000945" strokeWidth="2.5" strokeLinecap="round" />
                                        <rect x="22" y="24" width="18" height="12" rx="1" fill="#60a5fa" stroke="#000945" strokeWidth="2.5" />
                                        <circle cx="31" cy="30" r="3" fill="white" stroke="#000945" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="!font-bold !text-[20px] text-[#000945] mb-0.5 leading-snug">
                                        Easy Financing
                                    </h3>
                                    <p className="text-[13px] text-slate-600 leading-[1.6] font-medium pr-2">
                                        Book with confidence using our 100% secure and versatile payment gateway. Enjoy a seamless <a href="/payment" className="text-[#005beb] border-b border-[#005beb]">payment setup</a> designed for you.
                                    </p>
                                </div>
                            </div>

                            {/* Horizontal Divider Right */}
                            <div className="h-[1px] bg-[#d3d3d3] w-full hidden md:block"></div>

                            {/* Feature 4 */}
                            <div className="flex gap-3 relative z-10 bg-white py-2">
                                <div className="flex-shrink-0 mt-1">
                                    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 32C10 26 15 22 24 22C33 22 38 26 38 32H10Z" fill="#60a5fa" stroke="#000945" strokeWidth="2.5" strokeLinejoin="round" />
                                        <circle cx="24" cy="14" r="6" fill="#60a5fa" stroke="#000945" strokeWidth="2.5" />
                                        <path d="M8 12L9 15L12 16L9 17L8 20L7 17L4 16L7 15L8 12Z" fill="#60a5fa" stroke="#000945" strokeWidth="1.5" strokeLinejoin="round" />
                                        <path d="M40 16L41 19L44 20L41 21L40 24L39 21L36 20L39 19L40 16Z" fill="#60a5fa" stroke="#000945" strokeWidth="1.5" strokeLinejoin="round" />
                                        <path d="M24 34L26 38L30 38L27 41L28 45L24 43L20 45L21 41L18 38L22 38L24 34Z" fill="#60a5fa" stroke="#000945" strokeWidth="2" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="!font-bold !text-[20px] text-[#000945] mb-0.5 leading-snug">
                                        94.7% Satisfaction
                                    </h3>
                                    <p className="text-[13px] text-slate-600 leading-[1.6] font-medium pr-2">
                                        Join thousands of happy travelers who have rated us for excellence. See what they say on our <a href="https://share.google/xqIaXXEvCwo3YdKTw" target="_blank" rel="noopener noreferrer" className="text-[#005beb] border-b border-[#005beb]">Google Business page</a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
