// "use client"

// import { useState, useEffect } from 'react';
// import { X, ZoomIn } from 'lucide-react';

// interface Certification {
//   title: string;
//   regId: string;
//   desc: string;
//   certImage?: string;
// }

// export function CertificationsSection() {
//   const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

//   const certifications: Certification[] = [
//     { 
//       title: 'Uttarakhand Tourism Development Board', 
//       regId: 'UTDB/2024/001', 
//       desc: 'Officially registered with Uttarakhand Tourism Development Board for conducting tours in Uttarakhand.',
//       certImage: 'https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:good,w_auto,dpr_auto,c_limit/v1767850583/Uttarakhand_Tourism_Certificate_cpxada.webp'
//     },
//     { 
//       title: 'Ministry of Tourism', 
//       regId: '#12345678', 
//       desc: 'Recognized by the Govt. of India as an approved Inbound Tour Operator.'
//     },
//     { 
//       title: 'IATA Accredited', 
//       regId: '#99-9999', 
//       desc: 'Authorized to issue international airline tickets with global standards.'
//     },
//   ];

//   const openModal = (cert: Certification) => {
//     setSelectedCert(cert);
//     if (typeof document !== 'undefined') {
//       document.body.style.overflow = 'hidden';
//     }
//   };

//   const closeModal = () => {
//     setSelectedCert(null);
//     if (typeof document !== 'undefined') {
//       document.body.style.overflow = 'unset';
//     }
//   };

//   // Handle ESC key press
//   useEffect(() => {
//     const handleEscKey = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && selectedCert) {
//         closeModal();
//       }
//     };

//     if (typeof window !== 'undefined') {
//       window.addEventListener('keydown', handleEscKey);
//       return () => window.removeEventListener('keydown', handleEscKey);
//     }
//   }, [selectedCert]);

//   return (
//     <>
//       <section className="w-full bg-gray-50 py-12 md:py-16">
//         <div className="px-4 md:px-8 lg:px-16 xl:px-32 flex justify-center">
//           <div className="max-w-[800px] flex flex-col items-center text-center gap-4 md:gap-6">
//             <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
//               <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
//               </svg>
//             </div>
//             <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
//               Your Journey, Officially Secured
//             </h1>
//             <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
//               Paradise Yatra is a fully registered and accredited travel agency. We strictly adhere to all government regulations and international standards to ensure your peace of mind.
//             </p>
//           </div>
//         </div>
//       </section>

//       <section className="w-full bg-white py-12 md:py-16 border-y border-slate-100">
//         <div className="px-4 md:px-8 lg:px-16 xl:px-32 flex justify-center">
//           <div className="w-full max-w-[1200px]">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
//               {certifications.map((cert, idx) => (
//                 <div 
//                   key={idx} 
//                   onClick={() => cert.certImage && openModal(cert)}
//                   className={`group relative flex flex-col bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200 p-5 md:p-6 transition-all duration-500 ease-out hover:shadow-xl hover:border-blue-300 hover:-translate-y-2 hover:scale-[1.02] ${cert.certImage ? 'cursor-pointer' : ''}`}
//                 >
//                   {/* Certificate Image or Emoji */}
//                   <div className="relative h-40 md:h-48 w-full bg-white rounded-lg flex items-start justify-center mb-4 border border-slate-200 shadow-sm overflow-hidden">
//                     {cert.certImage ? (
//                       <>
//                         <img 
//                           src={cert.certImage} 
//                           alt={cert.title}
//                           className="w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-95"
//                         />
//                         {/* Zoom overlay hint */}
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex items-center justify-center">
//                           <div className="transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-lg">
//                             <ZoomIn className="w-6 h-6 text-blue-600" />
//                           </div>
//                         </div>
//                       </>
//                     ) : (
//                       <div className="text-center p-3 mt-8">
//                         <div className="text-4xl md:text-5xl mb-2 transition-transform duration-500 group-hover:scale-110">ðŸ†</div>
//                         <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{cert.regId}</div>
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className="flex flex-col gap-2 flex-grow">
//                     <h3 className="text-base md:text-lg font-bold text-slate-900 line-clamp-2 transition-colors duration-300 group-hover:text-blue-600">
//                       {cert.title}
//                     </h3>
//                     <p className="text-xs md:text-sm text-slate-600 leading-relaxed transition-colors duration-300 group-hover:text-slate-700">
//                       {cert.desc}
//                     </p>
//                   </div>
                  
//                   {cert.certImage && (
//                     <div className="mt-5 pt-4 border-t border-slate-200">
//                       <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-all duration-300 hover:text-blue-700 hover:gap-2">
//                         View Full Certificate
//                         <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 24 24">
//                           <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
//                         </svg>
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Full Screen Modal */}
//       {selectedCert && (
//         <div
//           className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-2 sm:p-4 md:p-6 backdrop-blur-md animate-fadeIn"
//           onClick={closeModal}
//         >
//           <button
//             onClick={closeModal}
//             className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white/70 hover:text-white hover:bg-white/20 bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-90 z-20"
//             aria-label="Close (ESC)"
//           >
//             <X className="w-5 h-5 sm:w-6 sm:w-6 md:w-8 md:h-8" />
//           </button>

//           <div
//             className="relative w-full max-w-7xl max-h-[95vh] flex flex-col items-center justify-center animate-scaleIn"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <img
//               src={selectedCert.certImage}
//               alt={selectedCert.title}
//               className="max-h-[70vh] w-auto max-w-full rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl border border-white/20 object-contain"
//             />
//           </div>
//         </div>
//       )}

//       {/* Animations CSS */}
//       <style jsx>{`
//         @keyframes fadeIn {
//           from { 
//             opacity: 0;
//             backdrop-filter: blur(0px);
//           }
//           to { 
//             opacity: 1;
//             backdrop-filter: blur(8px);
//           }
//         }

//         @keyframes scaleIn {
//           from {
//             opacity: 0;
//             transform: scale(0.85) translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1) translateY(0);
//           }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
//         }

//         .animate-scaleIn {
//           animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
//         }
//       `}</style>
//     </>
//   );
// }




// "use client"

// import { useState, useEffect } from 'react';
// import { X, ZoomIn } from 'lucide-react';

// interface Certification {
//   title: string;
//   regId: string;
//   desc: string;
//   certImage?: string;
// }

// export default function CertificationsSection() {
//   const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

//   const certifications: Certification[] = [
//     { 
//       title: 'Uttarakhand Tourism Development Board', 
//       regId: 'UTDB/2024/001', 
//       desc: 'Officially registered with Uttarakhand Tourism Development Board for conducting tours in Uttarakhand.',
//       certImage: 'https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:good,w_auto,dpr_auto,c_limit/v1767850583/Uttarakhand_Tourism_Certificate_cpxada.webp'
//     },
//     { 
//       title: 'Ministry of Tourism', 
//       regId: '#12345678', 
//       desc: 'Recognized by the Govt. of India as an approved Inbound Tour Operator.',
//       certImage:"https://res.cloudinary.com/dwuwpxu0y/image/upload/f_auto,q_auto:good,w_auto,dpr_auto,c_limit/v1767854400/Udhyam_Certificate_3_xkgfjk.webp",
//     },
//     { 
//       title: 'IATA Accredited', 
//       regId: '#99-9999', 
//       desc: 'Authorized to issue international airline tickets with global standards.'
//     },
//   ];

//   const openModal = (cert: Certification) => {
//     setSelectedCert(cert);
//     document.body.style.overflow = 'hidden';
//   };

//   const closeModal = () => {
//     setSelectedCert(null);
//     document.body.style.overflow = 'unset';
//   };

//   // Handle ESC key press
//   useEffect(() => {
//     const handleEscKey = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && selectedCert) {
//         closeModal();
//       }
//     };

//     window.addEventListener('keydown', handleEscKey);
//     return () => window.removeEventListener('keydown', handleEscKey);
//   }, [selectedCert]);

//   return (
//     <>
//       <section className="w-full bg-gray-50 py-12 md:py-16">
//         <div className="px-4 md:px-8 lg:px-16 xl:px-32 flex justify-center">
//           <div className="max-w-[800px] flex flex-col items-center text-center gap-4 md:gap-6">
//             <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
//               <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
//               </svg>
//             </div>
//             <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
//               Your Journey, Officially Secured
//             </h1>
//             <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
//               Paradise Yatra is a fully registered and accredited travel agency. We strictly adhere to all government regulations and international standards to ensure your peace of mind.
//             </p>
//           </div>
//         </div>
//       </section>

//       <section className="w-full bg-white py-12 md:py-16 border-y border-slate-100">
//         <div className="px-4 md:px-8 lg:px-16 xl:px-32 flex justify-center">
//           <div className="w-full max-w-[1200px]">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
//               {certifications.map((cert, idx) => (
//                 <div 
//                   key={idx} 
//                   onClick={() => cert.certImage && openModal(cert)}
//                   className={`group relative flex flex-col bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200 p-5 md:p-6 transition-all duration-500 ease-out hover:shadow-xl hover:border-blue-300 hover:-translate-y-2 hover:scale-[1.02] ${cert.certImage ? 'cursor-pointer' : ''}`}
//                 >
//                   {/* Certificate Image or Emoji */}
//                   <div className="relative h-40 md:h-48 w-full bg-white rounded-lg flex items-start justify-center mb-4 border border-slate-200 shadow-sm overflow-hidden">
//                     {cert.certImage ? (
//                       <>
//                         <img 
//                           src={cert.certImage} 
//                           alt={cert.title}
//                           className="w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-95"
//                         />
//                         {/* Zoom overlay hint */}
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex items-center justify-center">
//                           <div className="transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-out bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-lg">
//                             <ZoomIn className="w-6 h-6 text-blue-600" />
//                           </div>
//                         </div>
//                       </>
//                     ) : (
//                       <div className="text-center p-3 mt-8">
//                         <div className="text-4xl md:text-5xl mb-2 transition-transform duration-500 group-hover:scale-110">ðŸ†</div>
//                         <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{cert.regId}</div>
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className="flex flex-col gap-2 flex-grow">
//                     <h3 className="text-base md:text-lg font-bold text-slate-900 line-clamp-2 transition-colors duration-300 group-hover:text-blue-600">
//                       {cert.title}
//                     </h3>
//                     <p className="text-xs md:text-sm text-slate-600 leading-relaxed transition-colors duration-300 group-hover:text-slate-700">
//                       {cert.desc}
//                     </p>
//                   </div>
                  
//                   {cert.certImage && (
//                     <div className="mt-5 pt-4 border-t border-slate-200">
//                       <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-all duration-300 hover:text-blue-700 hover:gap-2">
//                         View Full Certificate
//                         <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 24 24">
//                           <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
//                         </svg>
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Full Screen Modal */}
//       {selectedCert && (
//         <div
//           className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-2 sm:p-4 md:p-6 backdrop-blur-md animate-fadeIn cursor-pointer"
//           onClick={closeModal}
//         >
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               closeModal();
//             }}
//             className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white/70 hover:text-white hover:bg-white/20 bg-white/10 p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-90 z-20 cursor-pointer"
//             aria-label="Close (ESC)"
//           >
//             <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
//           </button>

//           <div
//             className="relative w-full max-w-7xl max-h-[95vh] flex flex-col items-center justify-center animate-scaleIn cursor-default"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <img
//               src={selectedCert.certImage}
//               alt={selectedCert.title}
//               className="max-h-[70vh] w-auto max-w-full rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl border border-white/20 object-contain select-none"
//             />
//           </div>
//         </div>
//       )}

//       {/* Animations CSS */}
//       <style jsx>{`
//         @keyframes fadeIn {
//           from { 
//             opacity: 0;
//             backdrop-filter: blur(0px);
//           }
//           to { 
//             opacity: 1;
//             backdrop-filter: blur(8px);
//           }
//         }

//         @keyframes scaleIn {
//           from {
//             opacity: 0;
//             transform: scale(0.85) translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1) translateY(0);
//           }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
//         }

//         .animate-scaleIn {
"use client"

import { useState, useEffect } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Certification {
  title: string;
  regId: string;
  desc: string;
  certImage?: string | string[];
}

export default function CertificationsSection() {
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const certifications: Certification[] = [
    { 
      title: 'Uttarakhand Tourism', 
      regId: 'UTDB/2024/001', 
      desc: 'Officially registered under the Uttarakhand Tourism Development Board as a certified Travel Agent and Domestic Tour Operator. Authorized to operate tours within Uttarakhand with government verification.',
      certImage: '/Why%20Choose%20Us/Certifications/Uttarakhand%20Tourism.webp'
    },
    { 
      title: 'Udyam/Udyog/MSME', 
      regId: '#12345678', 
      desc: 'Registered under the Ministry of Micro, Small & Medium Enterprises (MSME), Government of India. Certified as a Service Provider operating in the travel and tourism sector.',
      certImage: '/Why%20Choose%20Us/Certifications/Udyam%20Certificate.webp'
    },
    { 
      title: 'Goods & Services Tax', 
      regId: '#99-9999', 
      desc: 'Registered under the Goods & Services Tax Act (GST) as a verified business entity. Authorized to conduct commercial operations and issue valid tax invoices for travel services.',
       certImage: '/Why%20Choose%20Us/Certifications/GST%20Certificate.webp'
    },
  ];

  const openModal = (cert: Certification) => {
    setSelectedCert(cert);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedCert(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset';
  };

  const getImages = (certImage?: string | string[]): string[] => {
    if (!certImage) return [];
    return Array.isArray(certImage) ? certImage : [certImage];
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCert) {
      const images = getImages(selectedCert.certImage);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCert) {
      const images = getImages(selectedCert.certImage);
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (selectedCert) {
        if (e.key === 'ArrowRight') nextImage(e as any);
        if (e.key === 'ArrowLeft') prevImage(e as any);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    window.addEventListener('keydown', handleArrowKeys);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      window.removeEventListener('keydown', handleArrowKeys);
    };
  }, [selectedCert, currentImageIndex]);

  return (
    <>
      <section className="w-full bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-[24px] md:text-[36px] font-[700] text-[#000945] mb-8 text-left tracking-tight" style={{ fontWeight: 700 }}>
            Affiliations & Certifications
          </h2>
          <div className="w-full pb-12 md:pb-16">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {certifications.map((cert, idx) => {
                const images = getImages(cert.certImage);
                const hasImages = images.length > 0;

                return (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (window.innerWidth < 1024 && hasImages) openModal(cert);
                    }}
                    className={`flex flex-col bg-white rounded-[6px] border border-slate-200 overflow-hidden lg:cursor-default ${hasImages ? 'cursor-pointer' : ''}`}
                  >
                    {/* Certificate Image */}
                    <div className="relative h-40 sm:h-72 md:h-80 w-full bg-[#f8fafc] flex items-center justify-center overflow-hidden border-b border-slate-100">
                      {hasImages ? (
                        <img 
                          src={images[0]} 
                          alt={cert.title}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="text-center p-3">
                          <div className="text-4xl md:text-5xl mb-2">ðŸ †</div>
                          <div className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-tight uppercase">{cert.regId}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Title and View Button Area */}
                    <div className="p-2 sm:p-4 flex flex-col gap-2 sm:gap-3">
                      <h3 className="!text-[14px] sm:!text-[24px] !font-[700] text-[#000945] line-clamp-1" style={{ fontWeight: 700 }}>
                        {cert.title}
                      </h3>
                      
                      <div 
                        onClick={(e) => {
                          if (hasImages) {
                            e.stopPropagation();
                            openModal(cert);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-blue-600 transition-colors hover:text-blue-800 cursor-pointer ${hasImages ? 'flex' : 'hidden'}`}
                      >
                        VIEW FULL CERTIFICATE
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-2 sm:p-4 md:p-6 backdrop-blur-md cursor-pointer"
            onClick={closeModal}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-20 cursor-pointer p-2"
              aria-label="Close"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl max-h-[92vh] flex flex-col items-center justify-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const images = getImages(selectedCert.certImage);
                const isMultiple = images.length > 1;

                return (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={`${selectedCert.title} - Image ${currentImageIndex + 1}`}
                      className="max-h-[80vh] w-auto max-w-full rounded-[6px] shadow-2xl border border-white/10 object-contain select-none"
                    />
                    
                    {isMultiple && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2"
                        >
                          <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                        </button>

                        <button
                          onClick={nextImage}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2"
                        >
                          <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                        </button>

                        <div className="mt-4 bg-black/40 backdrop-blur-sm text-white/80 px-3 py-1 rounded-full text-xs font-bold tracking-widest">
                          {currentImageIndex + 1} / {images.length}
                        </div>

                        {/* Thumbnail Navigation */}
                        <div className="mt-4 flex gap-2 overflow-x-auto max-w-full px-4">
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(idx);
                              }}
                              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                idx === currentImageIndex
                                  ? 'border-blue-500 scale-110 shadow-lg'
                                  : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
