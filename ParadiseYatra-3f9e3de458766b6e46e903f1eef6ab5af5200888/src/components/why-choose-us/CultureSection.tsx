"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function CultureSection() {
  const lifeSectionRef = useRef<HTMLElement | null>(null);
  const [playLifeVideos, setPlayLifeVideos] = useState(false);
  const [loadLifeVideos, setLoadLifeVideos] = useState(false);

  useEffect(() => {
    const section = lifeSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadLifeVideos(true);
        }
        setPlayLifeVideos(entry.isIntersecting);
      },
      { threshold: 0.35, rootMargin: "250px 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = lifeSectionRef.current;
    if (!section) return;
    const videos = Array.from(section.querySelectorAll<HTMLVideoElement>("video[data-life-reel='true']"));
    videos.forEach((video) => {
      if (playLifeVideos) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [playLifeVideos]);

  return (
    <section ref={lifeSectionRef} className="w-full bg-white py-12 md:py-16 border-t border-slate-100">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8 md:mb-10">
          <h2 
            className="text-[24px] md:text-[36px] font-[700] text-[#000945] text-left tracking-tight" 
            style={{ fontWeight: 700 }}
          >
            Life At Paradise Yatra
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Main Photo & Bottom Photos */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
            <div className="h-[250px] w-full overflow-hidden rounded-[6px] sm:col-span-2 md:h-[360px]">
              <Image
                src="/About/Life At Paradise Yatra/Image 1.jpeg"
                alt="Paradise Yatra team collaborating"
                width={1200}
                height={800}
                loading="lazy"
                className="block h-full w-full object-cover"
              />
            </div>

            {/* Mobile Video Reels (visible on small screens) */}
            <div className="grid grid-cols-2 gap-5 md:hidden sm:col-span-2">
              <div className="aspect-[9/16] w-full overflow-hidden rounded-[6px]">
                <video
                  data-life-reel="true"
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload={loadLifeVideos ? "metadata" : "none"}
                >
                  {loadLifeVideos ? (
                    <source src="/About/Life At Paradise Yatra/Reel 1.mp4" type="video/mp4" />
                  ) : null}
                </video>
              </div>

              <div className="aspect-[9/16] w-full overflow-hidden rounded-[6px]">
                <video
                  data-life-reel="true"
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload={loadLifeVideos ? "metadata" : "none"}
                >
                  {loadLifeVideos ? (
                    <source src="/About/Life At Paradise Yatra/Reel 2.mp4" type="video/mp4" />
                  ) : null}
                </video>
              </div>
            </div>

            <div className="h-[260px] w-full overflow-hidden rounded-[6px]">
              <Image
                src="/About/Life At Paradise Yatra/Image 2.jpg"
                alt="Paradise Yatra field experience"
                width={700}
                height={900}
                loading="lazy"
                className="block h-full w-full object-cover"
              />
            </div>

            <div className="h-[260px] w-full overflow-hidden rounded-[6px]">
              <Image
                src="/About/Life At Paradise Yatra/Image 3.jpg"
                alt="Paradise Yatra travel moments"
                width={700}
                height={900}
                loading="lazy"
                className="block h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Desktop Video Reels & Statement */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-5">
            <div className="hidden h-[250px] w-full overflow-hidden rounded-[6px] md:block md:h-[360px]">
              <video
                data-life-reel="true"
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                preload={loadLifeVideos ? "metadata" : "none"}
              >
                {loadLifeVideos ? (
                  <source src="/About/Life At Paradise Yatra/Reel 1.mp4" type="video/mp4" />
                ) : null}
              </video>
            </div>

            <div className="hidden h-[250px] w-full overflow-hidden rounded-[6px] md:block md:h-[360px]">
              <video
                data-life-reel="true"
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                preload={loadLifeVideos ? "metadata" : "none"}
              >
                {loadLifeVideos ? (
                  <source src="/About/Life At Paradise Yatra/Reel 2.mp4" type="video/mp4" />
                ) : null}
              </video>
            </div>

            <div className="relative h-[260px] sm:col-span-2 overflow-hidden rounded-[6px] border border-[#1b2f5f] bg-black p-5 md:p-7">
              {/* Animated Gradients */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, rgba(56,189,248,0.95), rgba(56,189,248,0) 65%)",
                }}
                animate={{ x: [0, 120, -70, 0], y: [0, 65, -35, 0], scale: [1, 1.35, 0.82, 1], rotate: [0, 12, -8, 0] }}
                transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 60% 40%, rgba(59,130,246,0.95), rgba(59,130,246,0) 65%)",
                }}
                animate={{ x: [0, -95, 45, 0], y: [0, 70, -25, 0], scale: [1, 0.85, 1.25, 1], rotate: [0, -10, 7, 0] }}
                transition={{ duration: 7.1, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 45% 45%, rgba(21,93,252,0.9), rgba(21,93,252,0) 65%)",
                }}
                animate={{ x: [0, -70, 60, 0], y: [0, -55, 30, 0], scale: [1, 1.2, 0.88, 1], rotate: [0, 8, -6, 0] }}
                transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <div className="relative z-10 flex h-full items-center">
                <p className="font-unbounded text-[18px] leading-[1.4] !text-white md:text-[22px]" style={{ color: "#ffffff" }}>
                  Every frame here is a glimpse of the energy, creativity, and teamwork behind Paradise Yatra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
