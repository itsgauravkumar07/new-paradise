"use client";

import Image from "next/image";

export default function NewHero2() {
  return (
    <main className="min-h-screen bg-white mt-6 lg:mt-2">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-12">
        {/* Mobile-only hero */}
        <div className="md:hidden">
          <div className="flex flex-col items-center text-center gap-6">
            <h1 className="font-bold text-black !text-4xl leading-tight">
              Discover The Best Destinations In The World
            </h1>
            <p className="text-gray-700 text-base leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus
              imperdiet sed id elementum.
            </p>
            <input
              type="text"
              placeholder="Search destinations..."
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <div className="flex w-full gap-3">
              <button className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Explore Packages
              </button>
              <button className="flex-1 px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                Watch Video
              </button>
            </div>
            <div className="relative w-[260px] h-[260px] mt-2">
              <div className="absolute w-[220px] h-[220px] bg-orange-500 rounded-full right-0 top-0 translate-x-6 -translate-y-4"></div>
              <Image
                src="/Hand.png"
                alt="Hand holding airplane"
                fill
                className="object-contain z-10"
                priority
              />
            </div>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-1 lg:grid-cols-[56%_auto] gap-12 items-center">
          <div className="flex flex-col justify-center">
            <h1 className="font-bold text-black mb-6 leading-tight lg:leading-tight !text-3xl lg:!text-7xl">
              Discover The Best Destinations In <br />
              The World
            </h1>

            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus
              imperdiet sed id elementum. Quam vel aliquam sit vulputate. Lorem
              ipsum dolor sit amet, consectetur.
            </p>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search destinations..."
              className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg mb-6 focus:outline-none focus:border-blue-500"
            />

            <div className="flex gap-4">
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Explore Packages
              </button>
              <button className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                Watch Video
              </button>
            </div>
          </div>

          <div className="karma flex justify-center md:justify-end items-center relative h-[400px] md:h-[500px] lg:h-full -mr-0 md:-mr-6 lg:-mr-36">
            <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-orange-500 rounded-full right-0 lg:mr-24"></div>

            <div className="relative z-10 w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[600px] lg:mt-20">
              <Image
                src="/Hand.png"
                alt="Hand holding airplane"
                fill
                className="object-contain z-10"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
