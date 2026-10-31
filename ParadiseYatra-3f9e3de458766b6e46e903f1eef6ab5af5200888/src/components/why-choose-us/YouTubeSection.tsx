// "use client"
// import { Play, ExternalLink, Youtube } from 'lucide-react';

// export function YouTubeSection() {
//   const featuredVideo = {
//     embedId: "-KicocG8TTw",
//     title: "Paradise Yatra: Our Most Loved Journeys 2025"
//   };

//   const upNextVideos = [
//     {
//       embedId: "HkSnfYlYbA0",
//       thumbnail: `https://img.youtube.com/vi/HkSnfYlYbA0/hqdefault.jpg`,
//       title: "My Kashmir Trip Experience | Full Itinerary & Tips",
//       duration: "12:45",
//       timeAgo: "2 weeks ago"
//     },
//     {
//       embedId: "TFfw29I5UPQ",
//       thumbnail: `https://img.youtube.com/vi/TFfw29I5UPQ/hqdefault.jpg`,
//       title: "Best Beaches in Maldives for Couples 2025",
//       duration: "08:20",
//       timeAgo: "1 month ago"
//     },
//     {
//       embedId: "jn4hVqpH0PM",
//       thumbnail: `https://img.youtube.com/vi/jn4hVqpH0PM/hqdefault.jpg`,
//       title: "Himachal Backpacking Guide: Budget & Route",
//       duration: "15:10",
//       timeAgo: "3 months ago"
//     },
//     {
//       embedId: "nuKUUiJHEiA",
//       thumbnail: `https://img.youtube.com/vi/nuKUUiJHEiA/hqdefault.jpg`,
//       title: "Exploring Ancient Temples of South India",
//       duration: "10:05",
//       timeAgo: "4 months ago"
//     }
//   ];

//   return (
//     <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
//             <Youtube className="w-10 h-10 text-red-600" />
//             Watch Our Journeys
//           </h2>
//           <p className="text-slate-600 text-sm md:text-base">
//             Immersive travel vlogs and customer stories on YouTube
//           </p>
//         </div>

//         <a
//           href="https://www.youtube.com/@ParadiseYatra"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
//         >
//           <Play className="w-4 h-4 fill-white" />
//           Subscribe
//         </a>
//       </div>

//       {/* Main Grid: Featured Video + Up Next Sidebar */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Featured Video - Takes 2 columns */}
//         <div className="lg:col-span-2">
//           <div className="relative w-full bg-slate-900 rounded-xl overflow-hidden shadow-lg">
//             <div className="aspect-video">
//               <iframe
//                 className="w-full h-full"
//                 src={`https://www.youtube.com/embed/${featuredVideo.embedId}?rel=0&modestbranding=1`}
//                 title={featuredVideo.title}
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//               />
//             </div>
//           </div>
//         </div>

//         {/* Up Next Sidebar - Takes 1 column */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//             <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
//               <h3 className="text-base font-bold text-slate-900">Up Next</h3>
//             </div>
            
//             <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
//               {upNextVideos.map((video, index) => (
//                 <a
//                   key={index}
//                   href={`https://www.youtube.com/watch?v=${video.embedId}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="group flex gap-3 p-3 hover:bg-slate-50 transition-colors cursor-pointer"
//                 >
//                   {/* Thumbnail */}
//                   <div className="relative w-32 aspect-video rounded overflow-hidden flex-shrink-0 bg-slate-100">
//                     <img
//                       src={video.thumbnail}
//                       alt={video.title}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                       onError={(e) => {
//                         e.currentTarget.src = `https://img.youtube.com/vi/${video.embedId}/default.jpg`;
//                       }}
//                     />
//                     {/* Play Button Overlay */}
//                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                       <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
//                         <Play className="w-5 h-5 text-white fill-white ml-0.5" />
//                       </div>
//                     </div>
//                     {/* Duration Badge */}
//                     <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
//                       {video.duration}
//                     </div>
//                   </div>

//                   {/* Video Info */}
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug mb-1">
//                       {video.title}
//                     </p>
//                     <p className="text-xs text-slate-500 mb-0.5">Paradise Yatra</p>
//                     <p className="text-xs text-slate-400">{video.timeAgo}</p>
//                   </div>
//                 </a>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Subscribe Button */}
//       <div className="mt-6 sm:hidden">
//         <a
//           href="https://www.youtube.com/@ParadiseYatra"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-md"
//         >
//           <Youtube className="w-5 h-5 fill-white" />
//           Subscribe to Channel
//           <ExternalLink className="w-4 h-4" />
//         </a>
//       </div>
//     </section>
//   );
// }



"use client"
import { useState, useRef, useEffect } from 'react';
import { Play, ExternalLink, Youtube, ThumbsUp, Share2, MoreVertical } from 'lucide-react';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YouTubeSection() {
  const allVideos = [
    {
      embedId: "-KicocG8TTw",
      title: "Paradise Yatra: Our Most Loved Journeys 2025",
    },
    {
      embedId: "HkSnfYlYbA0",
      title: "My Kashmir Trip Experience | Full Itinerary & Tips",
    },
    {
      embedId: "TFfw29I5UPQ",
      title: "Best Beaches in Maldives for Couples 2025",
    },
    {
      embedId: "jn4hVqpH0PM",
      title: "Himachal Backpacking Guide: Budget & Route",
    },
    {
      embedId: "nuKUUiJHEiA",
      title: "Exploring Ancient Temples of South India",
    }
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoHeight, setVideoHeight] = useState<number>(0);
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef<boolean>(false);

  const currentVideo = allVideos[currentVideoIndex];
  const upNextVideos = allVideos.filter((_: any, index: number) => index !== currentVideoIndex);

  // Measure video container height (only for desktop)
  useEffect(() => {
    const updateHeight = () => {
      if (videoContainerRef.current && window.innerWidth >= 1024) {
        setVideoHeight(videoContainerRef.current.offsetHeight);
      } else {
        setVideoHeight(0);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    const initializePlayer = (): void => {
      if (isInitializing.current) return;
      isInitializing.current = true;

      if (playerRef.current) {
        try {
          if (typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
          }
        } catch (e) {
          console.log('Player cleanup:', e);
        }
        playerRef.current = null;
      }

      if (typeof window !== 'undefined' && window.YT && window.YT.Player && iframeRef.current) {
        try {
          playerRef.current = new window.YT.Player(iframeRef.current, {
            videoId: currentVideo.embedId,
            playerVars: {
              autoplay: isPlaying ? 1 : 0,
              rel: 0,
              modestbranding: 1,
              enablejsapi: 1
            },
            events: {
              onStateChange: (event: any): void => {
                if (event.data === 0) {
                  // Video ended
                  const nextIndex = (currentVideoIndex + 1) % allVideos.length;
                  setCurrentVideoIndex(nextIndex);
                  setIsPlaying(true);
                }
                if (event.data === 1) {
                  // Playing
                  setIsPlaying(true);
                }
                if (event.data === 2) {
                  // Paused
                  setIsPlaying(false);
                }
              }
            }
          });
        } catch (e) {
          console.error('Error initializing player:', e);
        } finally {
          isInitializing.current = false;
        }
      } else {
        isInitializing.current = false;
      }
    };

    if (typeof window !== 'undefined') {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = (): void => {
          initializePlayer();
        };
      }
    }

    return (): void => {
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
          }
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, [currentVideoIndex, currentVideo.embedId, isPlaying, allVideos.length]);

  const handleVideoClick = (actualIndex: number): void => {
    setCurrentVideoIndex(actualIndex);
    setIsPlaying(true);
  };

  const getThumbnail = (embedId: string): string => {
    return `https://img.youtube.com/vi/${embedId}/hqdefault.jpg`;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl !font-black !leading-[1.05] flex items-center gap-3 mb-2">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/>
              <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF"/>
            </svg>
            Watch Our Journeys
          </h2>
          <p className="!text-slate-600 text-sm md:text-base">
            Immersive travel vlogs and customer stories
          </p>
        </div>

        <a
          href="https://www.youtube.com/@ParadiseYatra"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
        >
          <Youtube className="w-5 h-5" />
          Subscribe
        </a>
      </div>

      {/* Main Grid: Featured Video + Up Next Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Video Section - Takes 2 columns on desktop */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <div ref={videoContainerRef} className="rounded-xl overflow-hidden shadow-2xl bg-black">
            <div className="aspect-video relative">
              <div ref={iframeRef} className="w-full h-full"></div>
            </div>
          </div>
        </div>

        {/* Up Next Sidebar - Takes 1 column on desktop, full width on mobile/tablet */}
        <div className="lg:col-span-1">
          <div 
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            style={{ height: videoHeight > 0 ? `${videoHeight}px` : 'auto' }}
          >
            <div className="!bg-slate-50 px-4 py-3.5 border-b border-slate-200 flex-shrink-0">
              <h3 className="text-base !font-bold !text-slate-900">Up Next</h3>
            </div>
            
            {/* Desktop: Scrollable container */}
            <div className="divide-y divide-slate-100 overflow-y-auto flex-1 hidden lg:block">
              {upNextVideos.map((video: any, index: number) => {
                const actualIndex = allVideos.findIndex((v: any) => v.embedId === video.embedId);
                return (
                  <button
                    key={video.embedId}
                    onClick={() => handleVideoClick(actualIndex)}
                    className="group w-full flex gap-3 p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-36 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                      <img
                        src={getThumbnail(video.embedId)}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => {
                          e.currentTarget.src = `https://img.youtube.com/vi/${video.embedId}/default.jpg`;
                        }}
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold !text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug mb-2">
                        {video.title}
                      </p>
                      <p className="text-xs !text-slate-500">Paradise Yatra</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile & Tablet: Show all videos without scrolling */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {upNextVideos.map((video: any, index: number) => {
                const actualIndex = allVideos.findIndex((v: any) => v.embedId === video.embedId);
                return (
                  <button
                    key={video.embedId}
                    onClick={() => handleVideoClick(actualIndex)}
                    className="group w-full flex gap-3 p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                      <img
                        src={getThumbnail(video.embedId)}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => {
                          e.currentTarget.src = `https://img.youtube.com/vi/${video.embedId}/default.jpg`;
                        }}
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm f!ont-semibold !text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug mb-2">
                        {video.title}
                      </p>
                      <p className="text-xs !text-slate-500">Paradise Yatra</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Subscribe Button */}
      <div className="mt-6 sm:hidden">
        <a
          href="https://www.youtube.com/@ParadiseYatra"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-md"
        >
          <Youtube className="w-5 h-5" />
          Subscribe to Channel
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}