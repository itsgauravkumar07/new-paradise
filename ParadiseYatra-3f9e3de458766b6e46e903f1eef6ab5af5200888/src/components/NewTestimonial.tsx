import Image from "next/image";
import { Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewTestimonial() {
  return (
    <section className="w-full py-12 md:py-20 px-4 md:px-8 lg:px-12 bg-slate-200">
      <div className="max-w-6xl mx-auto mb-12 px-6 md:px-0 lg:px-0">
      <h1 className="text-5xl font-apple-system font-medium !text-gray-600 mb-12">
        Trekkers Highlights
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-8 items-start justify-start">
        <div className="">
          <div className="flex items-start gap-4 mb-8">
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src="/testimonial_profile.webp"
                alt="Liam Anderson"
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-600">
                Liam Anderson
              </h2>
              <p className="!text-gray-600">Market Explorer</p>
            </div>
          </div>

          <div className="flex gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-blue-500 text-blue-500" />
            ))}
          </div>

          <h3 className="text-2xl !font-bold !text-gray-600 mb-4">
            A Colorful Journey Through Marrakechs Spice Souks
          </h3>

          <p className="!text-gray-500 leading-relaxed">
            Wandering through the heart of Marrakech, I found myself immersed in
            a sensory paradise where every corner bursts with colours, aromas,
            and textures. The spice souks are more than just markets—they are
            living museums of Moroccos culinary and cultural heritage. From
            golden turmeric to deep crimson paprika, every basket tells a story.
          </p>
        </div>

        <div className=" flex flex-col gap-6">
          <div className="relative w-full min-h-[420px] aspect-[0.72/1] rounded-3xl overflow-hidden shadow-lg">
            <Image
              src="/testimonial.webp"
              alt="Marrakech Spice Market"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="">
          <div className="relative w-full h-60 rounded-3xl overflow-hidden shadow-md">
            <Image
              src="/l4.webp"
              alt="Testimonial video cover"
              fill
              className="object-cover"
            />
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 text-gray-500 ml-1" />
              </div>
            </div> */}
          </div>

          <p className="bottom-4 left-4 right-4 !text-gray-600 text-sm mt-12">
            Exploring the Vibrant Colors of Marrakechs Spice Markets
          </p>

          <Link href="/why-choose-us">
            <Button className="w-full mt-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-6 rounded-xl text-lg">
              Discover More Stories
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </section>
  );
}
