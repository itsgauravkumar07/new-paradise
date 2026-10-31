'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, ArrowRight } from 'lucide-react';

export function LatestReviews() {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollPosition / width);
      setActiveTab(index);
    }
  };

  useEffect(() => {
    const current = scrollRef.current;
    if (current) {
      current.addEventListener('scroll', handleScroll);
      return () => current.removeEventListener('scroll', handleScroll);
    }
  }, []);
  const reviews = [
    {
      name: "babul dutta",
      avatar: "https://lh3.googleusercontent.com/a-/ALV-UjUu7I4PAUwK1I3z4TLYdu_YFV9wBMAQ5K6U-3LnMvCxxh_LvES4=w144-h144-p-rp-mo-ba2-br100",
      rating: 5,
      review: "Whatever commitment was made, I got it. The car driver was good, he drove very carefully, the hotel was also better than expected, a big thank you to Paradise Yatra from my side.",
      timeAgo: "2 days ago",
      verified: true
    },
    {
      name: "prasanna ghurde",
      avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXlhUCPz4P4FxnwOf2IZQH1RnOCLMdbQtSAvPKsQvXvwjeqq823=w144-h144-p-rp-mo-br100",
      rating: 5,
      review: "Our 7-night, 8-day Kerala trip with Paradise Yatra was simply amazing! A special thanks to Shivani, who did all the planning and perfectly customized our itinerary as per our preferences.",
      timeAgo: "1 week ago",
      verified: true
    },
    {
      name: "Madhu Mita",
      avatar: "https://lh3.googleusercontent.com/a-/ALV-UjV9INzuYfxGCYtjOFcN4y980uN8A53XxfYP3CeJxNSW8jeQE6XO=w144-h144-p-rp-mo-br100",
      rating: 5,
      review: "I recently made a tour to Uttarakhand, while planning for an expedition I came across with paradise yatra and put a try on it and made a query about their packages and itinerary. After completion of tour, My Experience was Awesome in terms …",
      timeAgo: "2 weeks ago",
      verified: true
    }
  ];

  return (
    <section className="w-full bg-white py-12 md:py-16 border-t border-slate-100">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <h2 className="text-[24px] md:text-[36px] font-[700] text-[#000945] text-left tracking-tight" style={{ fontWeight: 700 }}>
            Latest Reviews
          </h2>

          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://share.google/S4dPaG2OsWTy0N1YJ"
            className="group flex items-center gap-2 text-blue-600 font-bold text-sm transition-all duration-300 w-fit shrink-0"
          >
            View All Reviews
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>


        {/* Reviews Container */}
        <div className="relative group/carousel">
          <div 
            ref={scrollRef}
            className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 overflow-x-auto md:overflow-hidden scrollbar-hide snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0"
          >
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[88vw] sm:w-[400px] md:w-full snap-center md:snap-align-none"
              >
                <div className="bg-white rounded-[6px] p-6 border border-slate-200 flex flex-col h-full">
                  {/* User Info */}
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-full bg-cover bg-center ring-4 ring-blue-50 transition-all duration-300"
                      style={{ backgroundImage: `url("${review.avatar}")` }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 capitalize">
                        {review.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>

                    {/* Google Logo using SVG */}
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="!text-slate-700 text-base leading-relaxed flex-grow mb-6 italic">
                    "{review.review}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator (Mobile Only) */}
          <div className="flex justify-center gap-2 mt-6 md:hidden">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeTab === idx ? 'w-6 bg-[#155dfc]' : 'w-1.5 bg-slate-200'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}