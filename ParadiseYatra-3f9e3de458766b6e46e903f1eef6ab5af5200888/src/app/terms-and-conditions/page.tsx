// 'use client';

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Card, CardContent } from '@/components/ui/card';
// import { LazyHeader, LazyFooter } from "@/components/lazy-components";
// import { Roboto } from 'next/font/google';
// import { 
//   CheckCircle, 
//   Calendar, 
//   Eye, 
//   Bed, 
//   Award, 
//   Sparkles,
//   ChevronDown,
//   ChevronUp,
//   FileText,
//   Shield,
//   CreditCard,
//   Plane,
//   AlertTriangle,
//   Users
// } from 'lucide-react';

// const roboto = Roboto({
//   weight: ['300', '400', '500', '700', '900'],
//   subsets: ['latin'],
//   variable: '--font-roboto',
//   display: 'swap',
// });

// export default function TermsAndConditionsPage() {
//   const [expandedSection, setExpandedSection] = useState<string | null>(null);

//   const toggleSection = (sectionId: string) => {
//     setExpandedSection(expandedSection === sectionId ? null : sectionId);
//   };

//   const termsSection = [
//     {
//       id: 'booking-payment',
//       title: 'Booking & Payment',
//       icon: <CreditCard className="w-4 h-4" />,
//       color: 'green',
//       items: [
//         'A booking shall be considered confirmed only upon receipt of the advance payment.',
//         'The remaining balance must be settled prior to the commencement of the trip.',
//         'Payments may be made via bank transfer, UPI, debit/credit card, or other approved methods.',
//         'All prices are subject to change until booking confirmation and payment receipt.',
//         'Cancellation charges will apply as per our cancellation policy outlined below.'
//       ]
//     },
//     {
//       id: 'itinerary-changes',
//       title: 'Itinerary & Changes',
//       icon: <Calendar className="w-4 h-4" />,
//       color: 'blue',
//       items: [
//         'The company reserves the right to alter, amend, or cancel itineraries due to unforeseen circumstances including but not limited to weather conditions, political disturbances, natural calamities, or transportation delays.',
//         'In the event of changes, we will endeavor to provide comparable alternatives at no additional cost. However, any extra expenses incurred shall be borne solely by the traveler.',
//         'Minor changes to itinerary may be made to enhance the travel experience.',
//         'Force majeure events are beyond our control and may result in itinerary modifications without compensation.'
//       ]
//     },
//     {
//       id: 'travel-documents',
//       title: 'Travel Documents & Identification',
//       icon: <Eye className="w-4 h-4" />,
//       color: 'purple',
//       items: [
//         'All travelers are required to carry valid government-issued identification and any other necessary travel documents throughout the trip.',
//         'Passports must be valid for at least 6 months from the date of travel for international trips.',
//         'Visa requirements and associated costs are the responsibility of the traveler.',
//         'Paradise Yatra is not responsible for any issues arising from invalid or expired documents.'
//       ]
//     },
//     {
//       id: 'personal-belongings',
//       title: 'Responsibility for Personal Belongings',
//       icon: <Bed className="w-4 h-4" />,
//       color: 'amber',
//       items: [
//         'Travelers are responsible for the safety and security of their luggage, valuables, and personal belongings. The company shall not be liable for any loss, theft, or damage.',
//         'We recommend keeping valuables in hotel safes or secure locations.',
//         'Travel insurance covering personal belongings is strongly recommended.',
//         'Any damage to hotel property or transportation vehicles will be charged to the traveler.'
//       ]
//     },
//     {
//       id: 'liability-insurance',
//       title: 'Liability & Insurance',
//       icon: <Shield className="w-4 h-4" />,
//       color: 'red',
//       items: [
//         'The company shall not be held responsible for any medical expenses, accidents, injuries, loss of life, or property damage occurring during the trip.',
//         'Travelers are strongly advised to secure comprehensive travel and medical insurance prior to departure.',
//         'Paradise Yatra acts as an intermediary and is not liable for services provided by third parties.',
//         'All adventure activities are undertaken at the traveler\'s own risk.'
//       ]
//     },
//     {
//       id: 'cancellation-policy',
//       title: 'Cancellation & Refund Policy',
//       icon: <AlertTriangle className="w-4 h-4" />,
//       color: 'orange',
//       items: [
//         'Cancellations must be notified in writing via email or registered letter.',
//         'Cancellation charges: 30+ days before departure: 25% of total cost',
//         '15-29 days before departure: 50% of total cost',
//         '7-14 days before departure: 75% of total cost',
//         'Less than 7 days before departure: 100% of total cost (no refund)',
//         'Refunds will be processed within 15-20 working days after deducting applicable charges.'
//       ]
//     },
//     {
//       id: 'conduct-behavior',
//       title: 'Traveler Conduct & Behavior',
//       icon: <Users className="w-4 h-4" />,
//       color: 'indigo',
//       items: [
//         'Travelers must conduct themselves in a manner that does not disturb other guests or violate local laws.',
//         'Consumption of alcohol or drugs that impairs judgment is strictly prohibited during activities.',
//         'Paradise Yatra reserves the right to terminate services for travelers who exhibit inappropriate behavior.',
//         'No refund will be provided for services terminated due to misconduct.',
//         'Travelers must follow instructions from tour guides and local authorities.'
//       ]
//     },
//     {
//       id: 'dispute-resolution',
//       title: 'Dispute Resolution & Governing Law',
//       icon: <FileText className="w-4 h-4" />,
//       color: 'slate',
//       items: [
//         'Any disputes arising from these terms shall be subject to the jurisdiction of courts in India.',
//         'We encourage resolving disputes through direct communication first.',
//         'Governing law shall be Indian law for all bookings and services.',
//         'Any modifications to these terms must be agreed upon in writing.',
//         'These terms constitute the entire agreement between Paradise Yatra and the traveler.'
//       ]
//     }
//   ];

//   const getColorClasses = (color: string) => {
//     const colorMap = {
//       green: 'bg-green-100 text-green-600 border-green-200',
//       blue: 'bg-blue-100 text-blue-600 border-blue-200',
//       purple: 'bg-purple-100 text-purple-600 border-purple-200',
//       amber: 'bg-amber-100 text-amber-600 border-amber-200',
//       red: 'bg-red-100 text-red-600 border-red-200',
//       orange: 'bg-orange-100 text-orange-600 border-orange-200',
//       indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
//       slate: 'bg-slate-100 text-slate-600 border-slate-200'
//     };
//     return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600 border-gray-200';
//   };

//   const getDotColor = (color: string) => {
//     const colorMap = {
//       green: 'bg-green-400',
//       blue: 'bg-blue-400',
//       purple: 'bg-purple-400',
//       amber: 'bg-amber-400',
//       red: 'bg-red-400',
//       orange: 'bg-orange-400',
//       indigo: 'bg-indigo-400',
//       slate: 'bg-slate-400'
//     };
//     return colorMap[color as keyof typeof colorMap] || 'bg-gray-400';
//   };

//   return (
//     <div className={`roboto-page ${roboto.variable} ${roboto.className} min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50`}>
//       <LazyHeader />
      
//       {/* Hero Section */}
//       <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pt-28 lg:pt-36 pb-20">
//         <div className="container mx-auto px-6 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//           >
//             <div className="flex items-center justify-center mb-4">
//               <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
//                 <FileText className="w-8 h-8 text-white" />
//               </div>
//               <h1 className="text-4xl md:text-5xl font-bold">Terms & Conditions</h1>
//             </div>
//             <p className="text-xl !text-white max-w-3xl mx-auto leading-relaxed">
//               Please read these terms carefully as they govern your relationship with Paradise Yatra 
//               and apply to all bookings and services provided.
//             </p>
//           </motion.div>
//         </div>
//       </div>

//       {/* Introduction Section */}
//       <div className="container mx-auto px-6 py-12 max-w-6xl">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.2 }}
//         >
//           <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
//             <CardContent className="p-8">
//               <div className="flex items-start">
//                 <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
//                   <Sparkles className="w-6 h-6 text-blue-500" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Paradise Yatra</h2>
//                   <p className="text-gray-700 text-lg leading-relaxed">
//                     At Paradise Yatra, we are committed to providing you with exceptional travel experiences. 
//                     These Terms & Conditions outline the rights, responsibilities, and expectations for both 
//                     our company and our valued travelers. By booking any service with us, you acknowledge 
//                     that you have read, understood, and agree to be bound by these terms.
//                   </p>
//                   <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
//                     <p className="text-blue-800 font-medium">
//                       <strong>Effective Date:</strong> These terms are effective as of January 1, 2024, 
//                       and apply to all bookings made thereafter.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>

//         {/* Terms Sections */}
//         <div className="space-y-6">
//           {termsSection.map((section, index) => (
//             <motion.div
//               key={section.id}
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.1 * index }}
//             >
//               <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//                 <CardContent className="p-0">
//                   <div 
//                     className="flex items-center justify-between cursor-pointer p-6 hover:bg-gray-50 transition-colors text-sm"
//                     onClick={() => toggleSection(section.id)}
//                   >
//                     <div className="flex items-center">
//                       <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${getColorClasses(section.color)}`}>
//                         {section.icon}
//                       </div>
//                       <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
//                     </div>
//                     {expandedSection === section.id ? (
//                       <ChevronUp className="w-5 h-5 text-gray-500" />
//                     ) : (
//                       <ChevronDown className="w-5 h-5 text-gray-500" />
//                     )}
//                   </div>
                  
//                   {expandedSection === section.id && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: 'auto' }}
//                       exit={{ opacity: 0, height: 0 }}
//                       transition={{ duration: 0.3 }}
//                       className="border-t border-gray-200"
//                     >
//                       <div className="p-6 pt-4 text-sm">
//                         <ul className="space-y-4">
//                           {section.items.map((item, itemIndex) => (
//                             <li key={itemIndex} className="flex items-start">
//                               <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${getDotColor(section.color)}`}></div>
//                               <span className="text-gray-700 leading-relaxed">{item}</span>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     </motion.div>
//                   )}
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}
//         </div>

//         {/* Contact Information */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.8 }}
//           className="mt-12"
//         >
//           <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
//             <CardContent className="p-8">
//               <div className="text-center">
//                 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Plane className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold mb-4">Questions About Our Terms?</h3>
//                 <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
//                   If you have any questions or concerns about these Terms & Conditions, 
//                   please don't hesitate to contact our customer service team.
//                 </p>
//                 <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 text-lg">
//                   <div className="flex items-center">
//                     <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
//                       <span className="text-white font-bold">@</span>
//                     </div>
//                     <span>info@paradiseyatra.com</span>
//                   </div>
//                   <div className="flex items-center">
//                     <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
//                       <span className="text-white font-bold">📞</span>
//                     </div>
//                     <span>+91 XXXXX XXXXX</span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </motion.div>

//         {/* Last Updated */}
//         <div className="text-center mt-8 text-gray-500">
//           <p>Last updated: January 1, 2024</p>
//         </div>
//       </div>
//       <style jsx>{`
//         .roboto-page, .roboto-page * {
//           font-family: var(--font-roboto), 'Roboto', sans-serif !important;
//         }
//       `}</style>
//     </div>
//   );
// }


import { LazyHeader } from "@/components/lazy-components";
import LegalPage from "@/components/legal/LegalPage";
import { buildStaticMetadata } from "@/lib/seo";
import { getLegalPage } from "@/lib/server/legal";

export const metadata = buildStaticMetadata("/terms-and-conditions");
export const revalidate = 300;

// Content is edited in Admin → Legal Pages (built-in wording: src/lib/legal/defaults.ts)
export default async function TermsPage() {
  return (
    <>
      <LazyHeader />
      <LegalPage data={await getLegalPage("terms")} />
    </>
  );
}
