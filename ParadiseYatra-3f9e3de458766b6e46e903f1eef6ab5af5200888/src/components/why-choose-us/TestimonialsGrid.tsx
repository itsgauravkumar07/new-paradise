'use client';

import { useState, useEffect } from 'react';
import {
  Play,
  Clock,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Shield,
  EllipsisVertical,
  X,
  ZoomIn
} from 'lucide-react';

interface Message {
  type: 'sent' | 'received';
  text: string;
  time: string;
}

interface WhatsAppChatProps {
  avatar: string;
  name: string;
  messages: Message[];
}

interface VideoItem {
  type: 'video';
  id: number;
  url: string;
  title: string;
  subtitle: string;
  duration: string;
  thumbnail?: string;
}

interface PhotoItem {
  type: 'photo';
  id: number;
  location: string;
  img: string;
}

export function TestimonialsGrid() {
  const [visibleCount, setVisibleCount] = useState(7);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simplified data structure for easier rendering
  const allTestimonials = [
    { type: 'whatsapp', id: 1 },
    {
      type: 'video',
      id: 1,
      url: "https://res.cloudinary.com/dwuwpxu0y/video/upload/q_auto:eco,f_auto,vc_auto,w_1280/v1767763881/Sardar_Ji_Review_xjorqh.mp4",
    },
    { type: 'photo', id: 10 },
    { type: 'photo', id: 11 },
    { type: 'photo', id: 12 },
    { type: 'photo', id: 1 },
    { type: 'text', id: 1 },
    { type: 'whatsapp', id: 2 },
    { type: 'photo', id: 2 },
    {
      type: 'video',
      id: 2,
      url: "https://res.cloudinary.com/dwuwpxu0y/video/upload/q_auto:eco,f_auto,vc_auto,w_1280/v1767779623/Video_Testimonial_2_mypkf8.mp4",
      title: "Paris Girls Trip",
    },
    { type: 'photo', id: 13 },
    { type: 'photo', id: 14 },
    { type: 'text', id: 2 },
    { type: 'photo', id: 3 },
    { type: 'whatsapp', id: 3 },
    {
      type: 'video',
      id: 3,
      url: "https://res.cloudinary.com/dwuwpxu0y/video/upload/q_auto:eco,f_auto,vc_auto,w_1280/v1767783817/Video_Testimonial_9_rjvcfy.mp4",
      title: "Paris Girls Trip",
    },
    { type: 'text', id: 3 },
    { type: 'whatsapp', id: 4 },
    {
      type: 'video',
      id: 4,
      url: "https://res.cloudinary.com/dwuwpxu0y/video/upload/q_auto:eco,f_auto,vc_auto,w_1280/v1767783726/Video_Testimonial_8_n20d0f.mp4",
      title: "Paris Girls Trip",
    },
    { type: 'photo', id: 4 },
    {
      type: 'video',
      id: 5,
      url: "https://res.cloudinary.com/dwuwpxu0y/video/upload/q_auto:eco,f_auto,vc_auto,w_1280/v1767782676/Video_Testimonial_5_cmw9wg.mp4",
      title: "Paris Girls Trip",
    },
    { type: 'photo', id: 4 },
    {
      type: 'video',
      id: 6,
      url: "https://res.cloudinary.com/dwuwpxu0y/video/upload/q_auto:eco,f_auto,vc_auto,w_1280/v1767783373/Video_Testimonial_6_fqi18i.mp4",
      title: "Paris Girls Trip",
    },
    { type: 'photo', id: 15 },
    { type: 'photo', id: 16 },
    {
      type: 'video',
      id: 7,
      url: "https://res.cloudinary.com/dwuwpxu0y/video/upload/q_auto:eco,f_auto,vc_auto,w_1280/v1767782325/Video_Testimonial_4_xxzxvh.mp4",
      title: "Paris Girls Trip",
    },
    { type: 'photo', id: 17 },
    { type: 'photo', id: 18 },
    { type: 'photo', id: 19 },
    { type: 'photo', id: 9 },
    { type: 'photo', id: 8 },
    { type: 'photo', id: 20 },
    {
      type: 'video',
      id: 7,
      url: "https://res.cloudinary.com/dwuwpxu0y/video/upload/q_auto:eco,f_auto,vc_auto,w_1280/v1767782300/Video_Testimonial_3_fisxcc.mp4",
      title: "Paris Girls Trip",
    },
    { type: 'photo', id: 5 },
    { type: 'photo', id: 6 },
    { type: 'photo', id: 7 },
  ];

  const loadMore = () => {
    setIsLoading(true);
    const incrementAmount = isMobile ? 3 : 5;
    const currentCount = visibleCount;
    const newCount = Math.min(currentCount + incrementAmount, allTestimonials.length);

    // Mark new items for animation
    const newIndices = new Set<number>();
    for (let i = currentCount; i < newCount; i++) {
      newIndices.add(i);
    }

    setTimeout(() => {
      setVisibleCount(newCount);
      setAnimatingIndices(newIndices);
      setIsLoading(false);

      // Clear animation markers after animation completes
      setTimeout(() => {
        setAnimatingIndices(new Set());
      }, 600);
    }, 300);
  };

  const showLess = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(7);
      setAnimatingIndices(new Set());
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const renderTestimonial = (item: any, index: number) => {
    const isNewItem = animatingIndices.has(index);

    switch (item.type) {
      case 'whatsapp':
        return <WhatsAppChatWrapper id={item.id} isNewItem={isNewItem} />;

      case 'video':
        return (
          <div
            key={`video-${item.id}`}
            onClick={() => setSelectedVideo(item)}
            className={`cursor-pointer break-inside-avoid group relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 hover:-translate-y-2 transition-all duration-500 ${isNewItem ? 'animate-fadeInUp opacity-0' : ''
              }`}
            style={{
              aspectRatio: item.id === 1 ? '9/16' : 'auto',
              animationDelay: isNewItem ? `${(index - visibleCount + (isMobile ? 3 : 5)) * 100}ms` : '0ms'
            }}
          >
            {item.thumbnail ? (
              <div className="relative h-56 w-full">
                <img
                  alt={item.title}
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-500"
                  src={item.thumbnail}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-14 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="fill-white w-6 h-6 ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <video className="w-full h-full object-cover" src={item.url} autoPlay loop muted playsInline preload="none" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Play overlay hint */}
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-1.5">
              <Play className="w-3 h-3 fill-white" />
              Play
            </div>
          </div>
        );

      case 'photo':
        return <PhotoCard id={item.id} onClick={setSelectedPhoto} isNewItem={isNewItem} index={index} visibleCount={visibleCount} isMobile={isMobile} />;

      default:
        return null;
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {allTestimonials.slice(0, visibleCount).map((item, index) => (
          <div key={`${item.type}-${item.id}-${index}`}>
            {renderTestimonial(item, index)}
          </div>
        ))}
      </div>

      {/* Load More Controls */}
      <div className="mt-10 flex justify-center gap-4">
        {visibleCount < allTestimonials.length && (
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="group flex items-center gap-2 px-8 py-3.5 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Loading...' : 'Load More Stories'}
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        )}
        {visibleCount > 7 && (
          <button
            onClick={showLess}
            disabled={isLoading}
            className="group flex items-center gap-2 px-8 py-3.5 border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Show Less
            <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          </button>
        )}
      </div>

      {/* VIDEO MODAL */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/20 bg-white/10 p-2 rounded-full transition-all z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo.url}
              className="max-h-[80vh] rounded-2xl border border-white/10"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}

      {/* IMAGE MODAL */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/20 bg-white/10 p-2 rounded-full transition-all z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="relative max-w-6xl max-h-[90vh] flex flex-col items-center animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.img}
              alt={selectedPhoto.location}
              className="max-h-[85vh] max-w-full rounded-2xl border border-white/10 object-contain"
            />
            <div className="mt-4 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              {selectedPhoto.location}
            </div>
          </div>
        </div>
      )}

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }

        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-messageSlide {
          animation: messageSlide 0.3s ease-out forwards;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        .delay-75 {
          animation-delay: 75ms;
        }

        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </section>
  );
}

// Helper components to keep the main code clean
function WhatsAppChatWrapper({ id, isNewItem }: { id: number; isNewItem: boolean }) {
  const data: Record<number, any> = {
    1: {
      name: "(Client) Mrs. Mamta",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJJ4tIHyY7GjJwoycb4Igv1ITnv_JCQrXUt0_zDcjh9xpZx3INlLxi7OMq15xglk5uWQp-LnhyYgKB4aKgD_tgBD0xLnMunuUnkHB8T17EYiDbgG0jSqNAuc5CghNPhgVcLGhvDaWMqBL1YGst755tNuYn5r6dIEZQbtzIgNzkgvUb1udqvzSi-qE1u3NtkEZ4WJS0ajU04QQ0-I5et8VfSJRb7eZ6UnjVfTIE2YwGTF1taHtfRzw6PHYEhDzR1PBTBNSJszQIu7w",
      messages: [
        { type: 'received', text: 'Trip overall kaafi achi rahi. Hotels clean the aur drivers time pe the.', time: '10:42 AM' },
        { type: 'sent', text: 'Thank you for the feedback, Rohan. Glad to know the trip was comfortable.', time: '10:45 AM' }
      ]
    },
    2: {
      name: "(Client) Mr. Rajesh",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAan1SeAg2H3FnKSKmLOKEL8tySQOvRKbwVfnRcTNxIJ7-3GADn4CpS7ndTqp52xQnbt3E43pebiQB_bXdLUGKe92clb9iz1ZJZoO2FUiiitZiHExTqXyD8QaPlkp_WiD5voTG4aqSzf6EEufgCWZf7-xeD7Ex1KjZF7J9LFX9p5neOHtWiiIlSPvDMhisMKJcjphPr9IVhJ48sM5tXQQ6zwy0oax6l-Qq61F7hXqZEc1Y06orUeEnPeWiZrSttPQSZlcziOJEdzyg",
      messages: [
        { type: 'received', text: 'The trip was smooth and well organised. No issues during the stay', time: '2:15 PM' },
        { type: 'sent', text: "Thanks for sharing your feedback. Happy to hear you enjoyed the experience.", time: '2:17 PM' },

      ]
    },
    3: {
      name: "(Client) Mr. Abhishek",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJJ4tIHyY7GjJwoycb4Igv1ITnv_JCQrXUt0_zDcjh9xpZx3INlLxi7OMq15xglk5uWQp-LnhyYgKB4aKgD_tgBD0xLnMunuUnkHB8T17EYiDbgG0jSqNAuc5CghNPhgVcLGhvDaWMqBL1YGst755tNuYn5r6dIEZQbtzIgNzkgvUb1udqvzSi-qE1u3NtkEZ4WJS0ajU04QQ0-I5et8VfSJRb7eZ6UnjVfTIE2YwGTF1taHtfRzw6PHYEhDzR1PBTBNSJszQIu7w",
      messages: [
        { type: 'received', text: 'Family ke saath travel easy raha. Planning achi thi, sab manage ho gaya.', time: '8:30 PM' },
        { type: 'sent', text: "Thank you for trusting us. We're glad your family had a good experience.", time: '8:32 PM' }
      ]
    },
    4: {
      name: "(Client) Mrs. Anjali",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJJ4tIHyY7GjJwoycb4Igv1ITnv_JCQrXUt0_zDcjh9xpZx3INlLxi7OMq15xglk5uWQp-LnhyYgKB4aKgD_tgBD0xLnMunuUnkHB8T17EYiDbgG0jSqNAuc5CghNPhgVcLGhvDaWMqBL1YGst755tNuYn5r6dIEZQbtzIgNzkgvUb1udqvzSi-qE1u3NtkEZ4WJS0ajU04QQ0-I5et8VfSJRb7eZ6UnjVfTIE2YwGTF1taHtfRzw6PHYEhDzR1PBTBNSJszQIu7w",
      messages: [
        { type: 'received', text: 'Overall very satisfied. The itinerary and hotels matched what was discussed.', time: '8:30 PM' },
        { type: 'sent', text: "Thank you for your feedback. We're happy everything went as planned.", time: '8:32 PM' }
      ]
    }
  };
  const chat = data[id] || data[1];
  return <WhatsAppChat avatar={chat.avatar} name={chat.name} messages={chat.messages} isNewItem={isNewItem} />;
}

function PhotoCard({
  id,
  onClick,
  isNewItem,
  index,
  visibleCount,
  isMobile
}: {
  id: number;
  onClick: (photo: PhotoItem) => void;
  isNewItem: boolean;
  index: number;
  visibleCount: number;
  isMobile: boolean;
}) {
  const photos: Record<number, any> = {
    1: { location: "Kerala, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767778704/Photo_Testimonial_4_ojrqb3.webp" },
    2: { location: "Jammu & Kashmir, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767778704/Photo_Testimonial_2_qll0zb.webp" },
    3: { location: "Manali, Himachal Pradesh", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767778704/Photo_Testimonial_3_el3rrl.webp" },
    4: { location: "Kerala, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767779423/Photo_Testimonial_6_zlvdfl.webp" },
    5: { location: "Himachal Pradesh, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767778705/Photo_Testimonial_5_gkvahk.webp" },
    6: { location: "Sikkim, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767778704/Photo_Testimonial_1_tqhr0g.webp" },
    7: { location: "Sikkim, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767782192/Photo_Testimonial_17_jsiqkn.webp" },
    8: { location: "Sikkim, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767781996/Photo_Testimonial_16_blmyx4.webp" },
    9: { location: "Jammu & Kashmir, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767781899/Photo_Testimonial_14_trlwjc.webp" },
    10: { location: "Himachal Pradesh, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767783178/Photo_Testimonial_19_j2t8xl.webp" },
    11: { location: "Himachal Pradesh, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767783167/Photo_Testimonial_18_v9agyj.webp" },
    12: { location: "Sikkim, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767781907/Photo_Testimonial_15_i6w6d4.webp" },
    13: { location: "Sikkim, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767781494/Photo_Testimonial_12_hqwgyc.webp" },
    14: { location: "Sikkim, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767781685/Photo_Testimonial_13_kc5eml.webp" },
    15: { location: "Jammu & Kashmir, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767781489/Photo_Testimonial_11_fvdexw.webp" },
    16: { location: "Kerala, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767780194/Photo_Testimonial_7_uhgy3c.webp" },
    17: { location: "Kerala, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767780927/Photo_Testimonial_8_bfgbd9.webp" },
    18: { location: "Sikkim, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767781049/Photo_Testimonial_9_ey6bqc.webp" },
    19: { location: "Sikkim, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767781353/Photo_Testimonial_10_zlwfla.webp" },
    20: { location: "Kerala, India", img: "https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767783344/Photo_Testimonial_20_sqvytb.webp" },

  };
  const p = photos[id] || photos[1];

  return (
    <div
      onClick={() => onClick({ type: 'photo', id, location: p.location, img: p.img })}
      className={`cursor-pointer break-inside-avoid rounded-xl overflow-hidden bg-white border border-slate-200 hover:-translate-y-2 transition-all duration-500 ${isNewItem ? 'animate-fadeInUp opacity-0' : ''
        }`}
      style={{
        animationDelay: isNewItem ? `${(index - visibleCount + (isMobile ? 3 : 5)) * 100}ms` : '0ms'
      }}
    >
      <div className="relative overflow-hidden group">
        <img
          alt={p.location}
          className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
          src={p.img}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
        {/* Zoom overlay hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm p-3 rounded-full">
            <ZoomIn className="w-6 h-6 text-slate-800" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-600" /> {p.location}
        </div>
      </div>
    </div>
  );
}

function WhatsAppChat({ avatar, name, messages, isNewItem }: WhatsAppChatProps & { isNewItem: boolean }) {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Skip animations for newly loaded items
    if (isNewItem) {
      setVisibleMessages(messages);
      setCurrentIndex(messages.length);
      return;
    }

    if (currentIndex >= messages.length) return;

    const timer = setTimeout(() => {
      if (messages[currentIndex].type === 'received') {
        setIsTyping(true);
        const typingTimer = setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages(prev => [...prev, messages[currentIndex]]);
          setCurrentIndex(prev => prev + 1);
        }, 1500);
        return () => clearTimeout(typingTimer);
      } else {
        setVisibleMessages(prev => [...prev, messages[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }
    }, currentIndex === 0 ? 500 : 800);

    return () => clearTimeout(timer);
  }, [currentIndex, messages, isNewItem]);

  return (
    <div className={`break-inside-avoid rounded-2xl bg-white overflow-hidden border border-slate-200 ${isNewItem ? 'animate-fadeInUp opacity-0' : ''
      }`}>
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#075E54] to-[#128C7E] px-5 py-4">
        <div className="relative">
          <img
            alt={name}
            className="size-11 rounded-full object-cover border-2 border-white"
            src={avatar}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
          <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold !text-white mb-0.5">{name}</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-100">
            <Shield className="w-3.5 h-3.5 fill-current" />
            <span>Verified Traveler</span>
          </div>
        </div>
        <EllipsisVertical className="w-5 h-5 !text-white" />
      </div>
      <div
        className="p-5 min-h-[220px] bg-[#e5ddd5]"
        style={{
      backgroundImage: `url("https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:eco,w_auto,dpr_auto,c_limit/v1767608109/Whatsapp_Chat_Background_l6ocjd.webp")`,
          backgroundSize: 'cover'
        }}
      >
        <div className="space-y-3">
          {visibleMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'} ${!isNewItem ? 'animate-messageSlide' : ''
                }`}
            >
              <div
                className={`${msg.type === 'sent'
                  ? 'bg-[#dcf8c6] rounded-br-none'
                  : 'bg-white rounded-bl-none'
                  } px-3 py-2 rounded-lg max-w-[85%] shadow-sm relative`}
              >
                <p className="!text-[#303030] text-sm leading-snug pr-12">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-slate-500">{msg.time}</span>
                  {msg.type === 'sent' && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-messageSlide">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
