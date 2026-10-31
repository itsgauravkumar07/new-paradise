"use client";

import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface FooterLink {
  name: string;
  href: string;
}

interface SocialMedia {
  platform: string;
  url: string;
  isActive: boolean;
}

interface CompanyInfo {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
}

interface FooterContent {
  companyInfo: CompanyInfo;
  links: {
    international: FooterLink[];
    india: FooterLink[];
    trekking: FooterLink[];
    quickLinks: FooterLink[];
  };
  socialMedia: SocialMedia[];
}

const NewFooter = () => {
  const [expandedSections, setExpandedSections] = useState({
    international: false,
    india: false,
    quickLinks: false,
  });
  const [footerData, setFooterData] = useState<FooterContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to clean up malformed URLs
  const cleanUrl = (url: string): { href: string } => {
    if (!url || url === "#") {
      return { href: "#" };
    }

    // Remove leading # if present
    const cleanedUrl = url.startsWith("#") ? url.substring(1) : url;

    // If it's still just # or empty, return default
    if (!cleanedUrl || cleanedUrl === "#") {
      return { href: "#" };
    }

    return { href: cleanedUrl };
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch("/api/footer");
        if (response.ok) {
          const data = await response.json();
          setFooterData(data);
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  // Use dynamic data if available, otherwise use fallback
  const footerLinks = footerData?.links || {
    international: [
      { name: "Singapore", href: "#" },
      { name: "Thailand", href: "#" },
      { name: "Malaysia", href: "#" },
      { name: "Vietnam", href: "#" },
      { name: "Europe", href: "#" },
      { name: "Dubai", href: "#" },
      { name: "Maldives", href: "#" },
    ],
    india: [
      { name: "Rajasthan", href: "#" },
      { name: "Kerala", href: "#" },
      { name: "Himachal", href: "#" },
      { name: "Uttarakhand", href: "#" },
      { name: "Goa", href: "#" },
      { name: "Kashmir", href: "#" },
    ],
    trekking: [
      { name: "Kedarnath", href: "#" },
      { name: "Badrinath", href: "#" },
      { name: "Valley of Flowers", href: "#" },
      { name: "Roopkund", href: "#" },
      { name: "Har Ki Dun", href: "#" },
    ],
    quickLinks: [
      { name: "Home", href: "/" },
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "/blog" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms & Conditions", href: "#" },
    ],
  };

  const socialIcons = {
    facebook: Facebook,
    twitter: () => (
      <Image
        src="/icons8-x-50.png"
        alt="X (Twitter)"
        width={16}
        height={16}
        className="w-4 h-4"
      />
    ),
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin,
  };

  const socialColors = {
    facebook: "bg-blue-600 hover:bg-blue-700",
    twitter: "bg-sky-500 hover:bg-sky-600",
    instagram:
      "bg-gradient-to-tr from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    youtube: "bg-red-600 hover:bg-red-700",
    linkedin: "bg-blue-700 hover:bg-blue-800",
  };

  // Use dynamic social media data if available, otherwise use fallback
  const socialLinks = footerData?.socialMedia?.filter(
    (social) => social.isActive
  ) || [
      { platform: "facebook", url: "#", isActive: true },
      { platform: "twitter", url: "#", isActive: true },
      { platform: "instagram", url: "#", isActive: true },
      { platform: "youtube", url: "#", isActive: true },
      { platform: "linkedin", url: "#", isActive: true },
    ];

  if (isLoading) {
    return (
      <footer className="bg-black text-white relative pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500"></div>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top section: Logo + Registration Info */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-12 gap-6">
          {/* Uttarakhand Simply Heaven Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/Footer/Uttarakhand Tourism Logo.png"
              alt="Uttarakhand Simply Heaven"
              width={200}
              height={120}
              className="h-auto w-[160px] md:w-[200px] brightness-0 invert"
            />
          </div>

          {/* Registration Details */}
          <div className="text-right space-y-1">
            <p className="text-sm text-gray-300">
              GSTIN: 05IYCPS1101L2ZG
            </p>
            <p className="text-sm text-gray-300">
              Udhyam: UDYAM-UK-05-0046271
            </p>
            <p className="text-sm text-gray-300">
              Uttarakhand Tourism: UTIR/DEHRADUN/08-2021/004728
            </p>
          </div>
        </div>

        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Company info */}
          <div className="lg:col-span-2 space-y-4 lg:max-w-[350px]">
            <div className="flex items-center space-x-2">
              <Image
                src="/footerLogo.png"
                alt="logo"
                width={112}
                height={112}
                className="h-8 w-8 md:h-8 md:w-8"
              />
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{ fontSize: "20px", fontWeight: "700" }}
                >
                  Paradise Yatra
                </h3>
                <p
                  className=" text-[#94A3B8] "
                  style={{ fontSize: "14px", fontWeight: "700" }}
                >
                  Yatra To Paradise
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {footerData?.companyInfo?.description ||
                "Creating unforgettable travel experiences since 2015. We specialize in crafting personalized journeys that connect you with the world's most beautiful destinations."}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon =
                  socialIcons[social.platform as keyof typeof socialIcons];
                const { href } = cleanUrl(social.url);
                return (
                  <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                    aria-label={`Follow us on ${social.platform}`}
                  >
                    {social.platform === "twitter" ? (
                      <Icon />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3
              className="text-white"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "18px",
                fontWeight: "600",
                lineHeight: "28px",
              }}
            >
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link, index) => {
                const { href } = cleanUrl(link.href);
                return (
                  <li key={index}>
                    <a
                      href={href}
                      className="text-[#CBD5E1] hover:text-blue-400 transition-colors "
                      style={{
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "20px",
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* International Tours */}
          <div className="space-y-4">
            <h3
              className=" text-white"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "18px",
                fontWeight: "600",
                lineHeight: "28px",
              }}
            >
              International Tours
            </h3>
            <ul className="space-y-3">
              {footerLinks.international.map((link, index) => {
                const { href } = cleanUrl(link.href);
                return (
                  <li key={index}>
                    <a
                      href={href}
                      className="text-[#CBD5E1] hover:text-blue-400 transition-colors"
                      style={{
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "20px",
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* India Tours */}
          <div className="space-y-4">
            <h3
              className="text-white"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "18px",
                fontWeight: "600",
                lineHeight: "28px",
              }}
            >
              India Tours
            </h3>
            <ul className="space-y-3">
              {footerLinks.india.map((link, index) => {
                const { href } = cleanUrl(link.href);
                return (
                  <li key={index}>
                    <a
                      href={href}
                      className="text-[#CBD5E1] hover:text-blue-400 transition-colors"
                      style={{
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "20px",
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3
              className="text-white"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "18px",
                fontWeight: "600",
                lineHeight: "28px",
              }}
            >
              Contact Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    footerData?.companyInfo?.address ||
                    "123 Travel Street Adventure City, AC 12345"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 text-sm"
                >
                  {footerData?.companyInfo?.address ||
                    "123 Travel Street Adventure City, AC 12345"}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a
                  href={`tel:${footerData?.companyInfo?.phone?.replace(/\s/g, "") ||
                    "+15551234567"
                    }`}
                  className="text-slate-300 text-sm"
                >
                  {footerData?.companyInfo?.phone || "+1 (555) 123-4567"}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <a
                  href={`mailto:${footerData?.companyInfo?.email || "info@wanderlust.com"
                    }`}
                  className="text-slate-300 text-sm"
                >
                  {footerData?.companyInfo?.email || "info@wanderlust.com"}
                </a>
              </div>
              <p className="text-slate-400 text-xs mt-4">
                Available 24/7 for your travel emergencies
              </p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-slate-400 text-sm">
                © 2025 Paradise Yatra. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6 text-sm">
              <a
                href="#"
                className="text-slate-400 hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-blue-400 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
