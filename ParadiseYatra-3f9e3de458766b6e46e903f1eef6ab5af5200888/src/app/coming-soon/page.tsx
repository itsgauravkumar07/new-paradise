"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Mail, Phone } from "lucide-react";

export default function ComingSoon() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
            <div className="max-w-2xl w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase mb-8 inline-block">
                        Exciting Things Ahead
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                        Something Amazing is <span className="text-blue-600">Coming Soon...</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-12 max-w-lg mx-auto leading-relaxed">
                        We're currently crafting an unforgettable travel experience for this destination.
                        Stay tuned as we bring you the finest packages and handpicked journeys.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95"
                        >
                            <Home className="w-5 h-5" />
                            Back to Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold transition-all hover:border-slate-900 active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>


                </motion.div>
            </div>
        </div>
    );
}
