"use client";

import { useEffect, useMemo, useState } from "react";
import { Instagram, Youtube, Facebook, Linkedin, X } from "lucide-react";

type FooterSocial = {
  platform: string;
  url: string;
  isActive?: boolean;
};

type FooterPayload = {
  socialMedia?: FooterSocial[];
};

const instagramPosts = [
  "DNfk1WmpdPk",
  "DPEOzMlCQab",
  "DQGp53PCRaA",
  "DPv4XjyCW7e",
  "DMR_QfQpARi",
  "DMenU3jJaQq",
  "DNBIABKp5sI",
  "DNTE_RppS_D",
];

const SocialJourneySection = () => {
  const [socialMedia, setSocialMedia] = useState<FooterSocial[]>([]);

  useEffect(() => {
    const fetchFooterSocialLinks = async () => {
      try {
        const response = await fetch("/api/footer", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as FooterPayload;
        setSocialMedia((data.socialMedia || []).filter((item) => item?.isActive !== false));
      } catch (error) {
        console.error("Error fetching social links from footer:", error);
      }
    };

    fetchFooterSocialLinks();
  }, []);

  const socialHrefs = useMemo(() => {
    const normalize = (raw?: string) => {
      if (!raw) return "";
      const value = raw.trim();
      if (!value || value === "#") return "";
      if (value.startsWith("http://") || value.startsWith("https://")) return value;
      return `https://${value}`;
    };

    const getByPlatform = (...platforms: string[]) =>
      normalize(
        socialMedia.find((item) =>
          platforms.includes((item.platform || "").toLowerCase())
        )?.url
      );

    return {
      instagram: getByPlatform("instagram") || "https://www.instagram.com/paradiseyatra/",
      youtube: getByPlatform("youtube") || "https://www.youtube.com/@ParadiseYatra",
      x: getByPlatform("twitter", "x") || "https://x.com/ParadiseYatra",
      facebook: getByPlatform("facebook") || "https://www.facebook.com/paradiseyatra/",
      linkedin: getByPlatform("linkedin") || "https://www.linkedin.com/company/paradise-yatra",
    };
  }, [socialMedia]);

  return (
    <section className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-10 lg:mb-12">
          <div className="max-w-2xl">
            <h2
              className="mb-4 text-[24px] md:text-[36px] leading-[1.1] tracking-tight !text-[#000945]"
              style={{ fontWeight: 700, color: "#000945" }}
            >
              Follow Our <span className="!text-[#000945]">Global</span> Journey
            </h2>
            <p className="text-[15px] leading-relaxed !text-[#000945] md:text-lg" style={{ color: "#000945" }}>
              Join our global community of adventurers. From mountain peaks to hidden city cafes, we share inspiring travel moments every single day.
            </p>
          </div>

        </header>

        <div className="relative w-full overflow-hidden rounded-[6px] border border-[#dfe1df] aspect-video">
          <iframe
            src="https://www.youtube-nocookie.com/embed/bsG3IIOIuy4?rel=0&modestbranding=1"
            title="YouTube video player"
            className="h-full w-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 justify-items-center gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {instagramPosts.map((postId, index) => (
            <div key={postId} className="w-full">
              <div className="mx-auto h-[352px] w-full max-w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm [--ig-scale:0.55] md:h-[544px] md:[--ig-scale:0.85]">
                <iframe
                  src={`https://www.instagram.com/p/${postId}/embed/`}
                  title={`Instagram post ${index + 1}`}
                  width="328"
                  height="640"
                  frameBorder="0"
                  scrolling="no"
                  loading="lazy"
                  style={{ transform: "scale(var(--ig-scale))", transformOrigin: "top left", border: 0 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <h3
            className="mb-2 text-3xl md:text-4xl !font-bold font-unbounded !text-[#000945]"
            style={{ fontWeight: 700, color: "#000945" }}
          >
            Join the Community
          </h3>
          <p className="mx-auto mb-6 max-w-xl !text-[#000945]" style={{ color: "#000945" }}>
            Pick your favorite platform and get inspired today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={socialHrefs.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-[6px] bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-6 py-3 text-sm font-bold text-white transition hover:brightness-90"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
            <a
              href={socialHrefs.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-[6px] bg-[#ff0000] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e00000]"
            >
              <Youtube className="h-4 w-4" />
              Youtube
            </a>
            <a
              href={socialHrefs.x}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-[6px] bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-[#111111]"
            >
              <X className="h-4 w-4" />
              X
            </a>
            <a
              href={socialHrefs.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-[6px] bg-[#1877f2] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1666cf]"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </a>
            <a
              href={socialHrefs.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-[6px] bg-[#0a66c2] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0958a8]"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
          </div>
          <div className="mt-7 flex items-center justify-center gap-3 !text-[#000945]" style={{ color: "#000945" }}>
            <span className="text-xs font-semibold tracking-[0.18em] !text-[#000945]" style={{ color: "#000945" }}>@PARADISEYATRA</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SocialJourneySection;
