"use client";
import { useEffect, useState } from "react";

export function StatsDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="bg-white border-y border-slate-200 mb-12">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-[200px]" /> {/* Placeholder height */}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border-y border-slate-200 mb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
            <div className="flex flex-col gap-1">
              <span className="text-6xl font-black text-slate-900 leading-none tracking-tighter">4.4</span>
              <div className="flex text-yellow-400">
                {/* 4 full stars */}
                {[...Array(4)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
                {/* 0.4 partial star (40% filled) */}
                <div className="relative w-5 h-5">
                  <svg className="absolute w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <svg className="absolute w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24" style={{ clipPath: 'inset(0 60% 0 0)' }}>
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              </div>
              <span className="text-sm text-slate-500 font-medium">Based on 151 reviews</span>
            </div>
            <div className="flex-1 w-full max-w-xs space-y-2">
              {[
                { stars: 5, percent: 74 },
                { stars: 4, percent: 18 },
                { stars: 3, percent: 5 },
                { stars: 2, percent: 2 },
                { stars: 1, percent: 1 }
              ].map((item) => (
                <div key={item.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-3 text-right font-medium text-slate-600">{item.stars}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${item.percent}%` }}></div>
                  </div>
                  <span className="w-8 text-right text-slate-500">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Trips Planned', value: '150+' },
              { label: 'Travelers', value: '1k+' },
              { label: 'Destinations', value: '45+' }
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm font-medium !text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold !text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}