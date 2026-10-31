"use client";

import { useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const TestimonialVideoCard = memo(({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Only try to play if we actually enter the viewport
            videoElement.play().catch(() => {
              // Ignore DOMException for play() requests interrupted by pause()
            });
          } else {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.1 } // Trigger when at least 10% of the video is visible
    );

    observer.observe(videoElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      preload="none"
      className="w-full h-auto object-cover"
    />
  );
});

TestimonialVideoCard.displayName = "TestimonialVideoCard";

const CustomVideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100 || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = (videoRef.current.duration / 100) * value;
      setProgress(value);
    }
  };

  return (
    <div
      className="relative max-h-[85vh] flex items-center justify-center overflow-hidden rounded-lg shadow-2xl group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="max-h-[85vh] w-auto max-w-full object-contain"
      />

      {/* Dark gradient overlay for bottom controls */}
      <div
        className={`absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Play/Pause Center Giant Button (Visible only when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/30 rounded-full p-5 backdrop-blur-sm border border-white/10 transition-transform scale-100">
            <svg className="w-12 h-12 text-white ml-2 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Custom Controls Bar */}
      <div
        className={`absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2 transition-all duration-300 ease-out ${isHovering ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 w-full px-4 mb-2">
          {/* Play/Pause Button */}
          <button onClick={togglePlay} className="text-white hover:text-blue-300 transition transform hover:scale-110">
            {isPlaying ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 group/bar relative flex items-center h-8 cursor-pointer group hover:h-8">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
            />
            {/* Visual Bar Background */}
            <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden transition-all duration-300 group-hover/bar:h-2">
              {/* Visual Progress */}
              <div className="h-full bg-[#1aa18e] transition-all" style={{ width: `${progress}%` }} />
            </div>
            {/* Playhead thumb */}
            <div
              className="absolute h-4 w-4 bg-white rounded-full shadow-md transition-transform scale-0 group-hover/bar:scale-100 pointer-events-none"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>

          {/* Mute/Unmute Button */}
          <button onClick={toggleMute} className="text-white hover:text-blue-300 transition transform hover:scale-110">
            {isMuted ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: string; src: string } | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroTransition, setHeroTransition] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  
  // Premium, elegant gradients for the rotating text
  const heroItems = [
    { text: "1000 Happy Travelers", bgClass: "from-[#155dfc] to-[#000945]" },
    { text: "45 Destinations", bgClass: "from-[#155dfc] to-[#000945]" },
    { text: "150 Trips Completed", bgClass: "from-[#155dfc] to-[#000945]" }
  ];
  // Clone first item at end for seamless loop
  const heroDisplay = [...heroItems, heroItems[0]];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedMedia(null);
      }
    };

    if (selectedMedia) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedMedia]);

  useEffect(() => {
    if (!mounted) return;
    const interval = window.setInterval(() => {
      setHeroIndex((prev) => {
        const next = prev + 1;
        if (next > heroItems.length) {
          return 1;
        }
        return next;
      });
    }, 2800); // Relaxed reading time
    return () => window.clearInterval(interval);
  }, [mounted, heroItems.length]);

  useEffect(() => {
    if (heroIndex === heroItems.length) {
      const timer = window.setTimeout(() => {
        setHeroTransition(false);
        setHeroIndex(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setHeroTransition(true);
          });
        });
      }, 540);
      return () => window.clearTimeout(timer);
    }
  }, [heroIndex, heroItems.length]);

  // Real testimonial assets (64 images + 17 videos)
  const OPT = "f_auto,q_auto:eco,w_500,dpr_auto,c_limit";
  const V_OPT = "q_auto:eco,f_auto,vc_auto,w_500";
  const allCards = [
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508040/Image_Testimonial_25_uxj3li.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508052/Image_Testimonial_55_qibijw.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508039/Image_Testimonial_13_cuimxf.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508076/Video_Testimonial_18_vtmkd1.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508047/Image_Testimonial_41_dw1let.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508064/Image_Testimonial_6_muovpc.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT},c_fill,g_auto,ar_9:16/v1774508074/Video_Testimonial_1_ducwll.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508038/Image_Testimonial_19_yzl92p.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508041/Image_Testimonial_36_xgta9u.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508074/Video_Testimonial_15_ey8nyr.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508057/Image_Testimonial_63_zksw9a.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508042/Image_Testimonial_33_rlunla.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508073/Video_Testimonial_14_duxanb.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508038/Image_Testimonial_10_aqf4wg.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508040/Image_Testimonial_16_qiglmd.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508072/Video_Testimonial_17_nize4l.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508059/Image_Testimonial_2_g4fzr5.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508047/Image_Testimonial_44_sxnxeb.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508071/Video_Testimonial_5_kuestu.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508041/Image_Testimonial_29_gj5ozh.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508052/Image_Testimonial_51_l4wh6p.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508068/Video_Testimonial_13_s1be2m.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508039/Image_Testimonial_21_a3nwuo.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508057/Image_Testimonial_60_snkhsz.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508067/Video_Testimonial_12_nxsmh6.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508038/Image_Testimonial_8_slcqkx.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508048/Image_Testimonial_45_z632df.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508067/Video_Testimonial_4_f4fhia.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508040/Image_Testimonial_22_qypr6c.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508052/Image_Testimonial_56_entswt.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508067/Video_Testimonial_7_vvh8bz.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508064/Image_Testimonial_7_lr46a2.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508041/Image_Testimonial_35_m2u21b.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508066/Video_Testimonial_11_xf3ceo.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508040/Image_Testimonial_24_lrsbam.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508039/Image_Testimonial_14_mvk3oc.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508066/Video_Testimonial_9_fcqxnz.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508047/Image_Testimonial_42_hkugce.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508052/Image_Testimonial_54_uwg0de.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508038/Image_Testimonial_18_vsczjb.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508057/Image_Testimonial_64_lic91c.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508065/Video_Testimonial_3_h0uzap.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508059/Image_Testimonial_3_rijbpi.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508047/Image_Testimonial_40_ip7gzk.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508065/Video_Testimonial_6_glwdrz.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508040/Image_Testimonial_17_crgbhq.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508042/Image_Testimonial_37_dlzfka.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508059/Video_Testimonial_16_bmoa6w.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508051/Image_Testimonial_49_ugoweq.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508039/Image_Testimonial_20_ffne79.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508058/Video_Testimonial_10_eesoa5.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508041/Image_Testimonial_34_fvhvzi.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508057/Image_Testimonial_61_f5eufh.jpg` },
    { type: "video", src: `https://res.cloudinary.com/dop1mi4lg/video/upload/${V_OPT}/v1774508058/Video_Testimonial_2_cpos4n.mp4` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508060/Image_Testimonial_5_bbbbhs.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508052/Image_Testimonial_52_tathvr.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508040/Image_Testimonial_26_p5s74k.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508048/Image_Testimonial_47_lcunwr.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508039/Image_Testimonial_11_ftmp9b.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508058/Image_Testimonial_1_wxk1ip.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508041/Image_Testimonial_28_aj2nbn.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508047/Image_Testimonial_43_atokx6.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508052/Image_Testimonial_53_oqi04f.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508038/Image_Testimonial_12_rceih6.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508042/Image_Testimonial_32_l5f2eb.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508057/Image_Testimonial_62_mmxb2n.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508059/Image_Testimonial_4_hmqvnz.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508040/Image_Testimonial_23_cya2qq.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508051/Image_Testimonial_48_czvxee.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508040/Image_Testimonial_27_ppduff.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508041/Image_Testimonial_30_zhi6bi.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508052/Image_Testimonial_50_bu2zhj.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508038/Image_Testimonial_9_ct488c.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508049/Image_Testimonial_46_d1j0jt.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508042/Image_Testimonial_38_ml01eq.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508057/Image_Testimonial_57_lirpy9.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508041/Image_Testimonial_31_ighrr6.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508040/Image_Testimonial_15_bqcgyr.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508053/Image_Testimonial_59_l61agw.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508047/Image_Testimonial_39_atkpxk.jpg` },
    { type: "image", src: `https://res.cloudinary.com/dop1mi4lg/image/upload/${OPT}/v1774508052/Image_Testimonial_58_nhy2i1.jpg` },
  ];
  const visibleCards = allCards.slice(0, visibleCount);
  const [maxHeight, setMaxHeight] = useState(850);
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalHeight, setTotalHeight] = useState(0);
  const canLoadMore = visibleCount < allCards.length || maxHeight < totalHeight;

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const container = containerRef.current;
    const updateHeight = () => setTotalHeight(container.scrollHeight);

    updateHeight();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateHeight);
    observer.observe(container);

    return () => observer.disconnect();
  }, [mounted, visibleCards.length]);

  const handleLoadMore = () => {
    const step =
      mounted && window.innerWidth < 640
        ? 6
        : mounted && window.innerWidth < 1024
          ? 8
          : 12;

    setVisibleCount((prev) => Math.min(prev + step, allCards.length));
    setMaxHeight((prev) => prev + 1200);
  };

  return (
    <section className="relative overflow-hidden bg-white text-slate-900 selection:bg-blue-500/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-blue-100/70 blur-[100px]" />
        <div className="absolute top-[30%] -right-[10%] w-[35%] h-[50%] rounded-full bg-blue-50 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[40%] rounded-full bg-slate-100/80 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 pb-20 pt-20 sm:pt-28 lg:px-8 z-10">
        <div className="flex flex-col items-center gap-12 text-center">
          
          {/* Enhanced Title Section */}
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm mx-auto"
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#155dfc] animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-widest text-[#155dfc] uppercase">Our Global Community</span>
            </motion.div>
            
            <h1 className="w-full font-unbounded text-[#000945] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black flex flex-col items-center justify-center gap-y-2 sm:flex-row sm:gap-x-4">
              <span className="flex-shrink-0">More Than</span>
              
              {/* Rotator Container */}
              <div className="hero-rotator relative h-[1.2em] overflow-hidden flex items-center justify-start min-w-[300px] sm:min-w-[400px] md:min-w-[500px]">
                <span
                  suppressHydrationWarning
                  className={`hero-rotator-inner${heroTransition ? '' : ' no-transition'} flex flex-col items-center sm:items-start w-full`}
                  style={{ transform: `translateY(${heroIndex * -1.2}em)` }}
                >
                  {heroDisplay.map((item, i) => (
                    <span
                      key={`${item.text}-${i}`}
                      className={`hero-rotator-item h-[1.2em] flex items-center justify-center sm:justify-start w-full bg-gradient-to-r ${item.bgClass} bg-clip-text text-transparent pb-1`}
                    >
                      {item.text}
                    </span>
                  ))}
                </span>
              </div>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed mt-4"
            >
              Join thousands of discerning travelers who have trusted us to curate their perfect, unforgettable journeys across the globe. Explore our gallery of genuine memories.
            </motion.p>
          </div>

          {/* Masonry Gallery Section */}
          <div className="relative w-full mt-6">
            <motion.div
              animate={{ maxHeight: maxHeight }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden"
            >
              <div ref={containerRef} className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5 space-y-3 pb-32">
                {visibleCards.map((card, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "50px" }}
                    transition={{ duration: 0.5, delay: (index % 10) * 0.05 }}
                    key={`${card.type}-${index}`}
                    className="break-inside-avoid cursor-pointer group rounded-2xl overflow-hidden shadow-sm border border-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 hover:border-blue-200 bg-white"
                    onClick={() => setSelectedMedia({ type: card.type, src: card.src })}
                  >
                    {card.type === "video" ? (
                      <div className="relative w-full overflow-hidden bg-[#000945]">
                        <TestimonialVideoCard src={card.src} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000945]/60 via-transparent to-transparent pointer-events-none transition-opacity group-hover:opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-90 group-hover:scale-100">
                          <div className="bg-white/10 p-4 rounded-full shadow-lg text-white backdrop-blur-md border border-white/20 transition-transform">
                            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full overflow-hidden bg-[#000945]">
                        <img
                          src={card.src}
                          alt="Happy travelers"
                          className="w-full h-auto object-cover block transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000945]/40 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Seamless Fade & Load More Button */}
              {canLoadMore && (
                <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center justify-end h-64 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
                  <button
                    onClick={handleLoadMore}
                    className="pointer-events-auto flex items-center gap-2 cursor-pointer rounded-full bg-[#155dfc] px-8 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#0f4bce] hover:-translate-y-0.5 mb-8"
                  >
                    Load More Memories
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox / Media Viewer */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedMedia && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 p-4 md:p-8 backdrop-blur-xl"
              onClick={() => setSelectedMedia(null)}
            >
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 cursor-pointer text-slate-400 hover:text-white hover:bg-white/10 transition-all rounded-full bg-white/5 border border-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative max-h-full max-w-6xl w-full rounded-2xl overflow-hidden flex items-center justify-center bg-transparent ring-1 ring-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedMedia.type === "video" ? (
                  <CustomVideoPlayer src={selectedMedia.src.replace("w_500", "w_1200")} />
                ) : (
                  <img
                    src={selectedMedia.src.replace("w_500", "w_1200")}
                    alt="Full view testimonial"
                    className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain"
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
