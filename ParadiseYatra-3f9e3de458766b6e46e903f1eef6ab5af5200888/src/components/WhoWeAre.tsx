import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function WhoWeAre() {
  const features = [
    {
      title: "Personalized Journey Planning",
      description:
        "No two travelers are the same. That's why every trip is built from scratch — just for you.",
    },
    {
      title: "Seamless Hotel & Transport Coordination",
      description:
        "Stay in comfort, travel in peace. We handle everything behind the scenes.",
    },
    {
      title: "Wide Range of Destinations",
      description:
        "200+ handpicked places across 5 continents and growing every year.",
    },
    {
      title: "Quick & Reliable Support",
      description:
        "Real people. Real answers. Anytime you need us, we're here.",
    },
  ];

  return (
    <section className="w-full py-12 md:py-20 px-4 md:px-8 lg:px-12 bg-slate-200" >
      
      <div className="max-w-7xl mx-auto">
        {/* ==================== MOBILE LAYOUT ==================== */}
        <div className="md:hidden flex flex-col gap-8">
          {/* Headings - Mobile version (centered) */}
          <div className="text-center px-2">
            <h2 className="text-blue-600 text-sm !font-semibold mb-2">
              Who We Are
            </h2>
            <h3 className="text-2xl sm:text-3xl font-light text-gray-800 mb-4">
              Explore the world, your way with travel experiences that feel
              personal, flexible.
            </h3>
          </div>

          {/* Images - Mobile version */}
          <div className="relative h-[380px] w-full max-w-[380px] mx-auto">
            <div className="absolute w-64 h-72 -top-6 left-1/2 -translate-x-1/2 rounded-3xl overflow-hidden shadow-lg">
              <Image
                src="/l3.webp"
                alt="Travel experience 1"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 70vw, 33vw"
              />
            </div>

            <div className="absolute w-48 h-56 bottom-0 right-4 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
              <Image
                src="/l2.webp"
                alt="Travel experience 2"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 text-center px-2">
            {/* Paragraph */}
            <p className="!text-gray-600 !text-base leading-relaxed">
              We are a passionate team of explorers, planners, and dreamers
              dedicated to crafting journeys that match your unique style and
              pace. From remote mountain trails to vibrant coastal towns, we
              help you travel smarter — not harder.
            </p>

            {/* Features */}
            <div className="space-y-5 mt-4">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 items-start px-4">
                  <div className="flex-shrink-0 mt-1">
                    <Image
                      src="/Icon_Who_We.svg"
                      alt="check"
                      width={28}
                      height={28}
                      className="w-7 h-7"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium !text-gray-800 !text-base">
                      {feature.title}
                    </h4>
                    <p className="!text-gray-600 !text-sm mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== DESKTOP LAYOUT ==================== */}
        <div className="hidden md:grid md:grid-cols-[1.5fr_2fr] gap-12 items-center">
          {/* Images - Desktop */}
          <div className="relative h-[580px] w-full">
            <div className="absolute w-[440px] h-[500px] top-0 left-0 rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/l3.webp"
                alt="Main travel scene"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 40vw, 33vw"
                priority
              />
            </div>

            <div className="absolute w-[270px] h-[270px] bottom-8 right-0 rounded-3xl border-4 border-white overflow-hidden shadow-xl">
              <Image
                src="/l2.webp"
                alt="Secondary travel moment"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 25vw, 20vw"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-blue-600 text-sm !font-semibold mb-3">
                Who We Are
              </h3>
              <h2 className="text-4xl lg:text-5xl font-light text-gray-800 mb-6 leading-tight">
                Explore the world, your way with travel experiences that feel
                personal, flexible.
              </h2>
              <p className="!text-gray-700 text-lg lg:text-xl leading-relaxed">
                We are a passionate team of explorers, planners, and dreamers
                dedicated to crafting journeys that match your unique style and
                pace. From remote mountain trails to vibrant coastal towns, we
                help you travel smarter — not harder.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Image
                      src="/Icon_Who_We.svg"
                      alt="feature icon"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium !text-gray-800 text-xl lg:text-2xl">
                      {feature.title}
                    </h4>
                    <p className="!text-gray-600 !text-base lg:text-lg mt-2">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}