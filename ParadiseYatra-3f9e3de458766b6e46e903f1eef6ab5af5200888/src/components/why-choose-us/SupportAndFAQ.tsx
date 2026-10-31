'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SupportAndFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Will the price increase after I book?",
      answer: "No. Once your package is confirmed and payment is received, the price is locked. Seasonal demand or hotel rate hikes won't be pushed onto you later."
    },
    {
      question: "Are the hotel photos and locations genuine?",
      answer: "Yes. We share the exact hotel name, Google Maps location, and real photos/videos before confirmation. If you're not satisfied, the hotel can be changed before booking, not after arrival."
    },
    {
      question: "Who supports us if something goes wrong during the trip?",
      answer: "Paradise Yatra provides direct on-trip support via call and WhatsApp. Any issue—hotel, driver, timing, or service—is handled by our team. You don't have to argue with vendors."
    },
    {
      question: "What happens to my money if the trip gets canceled?",
      answer: "Refunds depend on hotel and transport cancellation policies. We do not make fake promises of 100% refunds. All terms are clearly explained before payment so there are no surprises later."
    },
    {
      question: "What if the driver skips sightseeing or asks for extra money?",
      answer: "All drivers are pre-briefed with your itinerary. Unapproved route changes, extra demands, or misbehavior are not acceptable. If an issue arises, we intervene immediately or arrange a replacement."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="w-full bg-white min-h-screen py-12">
      {/* FAQ Section - Replicating State Page Design */}
      <section className="bg-white py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          {/* Left Column: FAQ Content */}
          <div className="w-full lg:w-1/2">
            <h2 className="!text-[24px] md:!text-[36px] !font-bold text-[#000945] !leading-[1.1] mb-8 tracking-tight">
              Got Questions? We Have<br />Got Answers
            </h2>

            <div className="max-w-xl">
              {faqs.map((faq, index) => (
                <div key={index} className="mb-4">
                  <button
                    className={`w-full flex items-center justify-between p-4 md:p-5 rounded-[6px] transition-all border border-[#dfe1df] cursor-pointer ${
                      openFaq === index ? 'bg-white' : 'bg-white hover:bg-slate-50/50'
                    }`}
                    onClick={() => toggleFaq(index)}
                  >
                    <span className={`font-bold transition-colors text-[15px] md:text-base pr-4 text-left ${
                      openFaq === index ? 'text-[#155dfc]' : 'text-[#000945]'
                    }`}>
                      {faq.question}
                    </span>
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                      openFaq === index ? 'border-[#155dfc] text-[#155dfc] rotate-180' : 'border-slate-200 text-slate-500'
                    }`}>
                      {openFaq === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 py-4 text-slate-600 text-[14px] md:text-[15px] leading-relaxed font-medium border-x border-b border-[#dfe1df] rounded-b-[6px] -mt-1 bg-white">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Image (Matching State Page style) */}
          <div className="hidden lg:block w-full lg:w-1/2 relative h-[539.2px] rounded-[6px] overflow-hidden">
            <Image
              src="/Destination Pages/Faq/Image.webp"
              alt="Paradise Yatra Travel"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-transparent" />
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="px-4 lg:px-6 py-8 md:py-16 mb-4 max-w-6xl mx-auto">
        <div className="bg-[#08213d] rounded-[6px] p-6 sm:p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-24 !shadow-none !border-none">
          
          <div className="w-full lg:w-[55%] flex flex-col items-start gap-5 lg:gap-6">
            <h2 className="text-white tracking-tight text-[34px] md:text-[48px]" style={{ fontWeight: '900', lineHeight: '1.1' }}>
              Ready to get <br className="hidden md:inline" /> started ?
            </h2>
            <div className="text-white/90 text-[15px] lg:text-[17px] leading-relaxed mt-1">
              No chatbots, no automated menus. <br />
              Have doubts? <a href="https://share.google/S4dPaG2OsWTy0N1YJ" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-white/60 hover:decoration-white font-medium transition-colors">Read 150+ reviews here.</a>
            </div>
            
            <a 
              href="https://wa.me/9873391733" 
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 bg-[#155dfc] hover:bg-[#0f4bce] text-white font-bold text-[14px] px-5 py-2.5 rounded-full !shadow-none transition-colors"
              style={{ boxShadow: 'none' }}
            >
              Chat with Support
            </a>
          </div>

          <div className="w-full lg:w-[45%] flex flex-col gap-4 lg:gap-6">
            {[
              "24/7 dedicated on-trip support",
              "Direct access to travel experts",
              "Quick and reliable issue resolution"
            ].map((text, i) => (
              <div key={i} className="flex items-start lg:items-center gap-3 lg:gap-4">
                <svg className="w-[18px] h-[18px] text-white mt-1 lg:mt-0 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span className="text-white font-medium text-[15px] lg:text-[16px] leading-snug tracking-wide">{text}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      <style jsx>{`
        @keyframes float-1 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(5px);
          }
        }
        
        @keyframes float-2 {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(-8px);
          }
        }
        
        .animate-float-1 {
          animation: float-1 4s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float-2 5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}