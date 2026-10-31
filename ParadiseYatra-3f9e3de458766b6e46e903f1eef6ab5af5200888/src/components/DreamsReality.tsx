"use client";

import Image from "next/image";

export default function DreamsReality() {
  return (
    <section className="min-h-screen bg-white px-4 py-12 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 md:gap-12 lg:flex-row lg:items-center">
          <div className="flex w-full justify-center lg:w-1/2">
            <div className="relative h-80 w-80 md:h-[500px] md:w-[500px] md:-ml-16 lg:-ml-24 xmen">
              {/* Background image */}
              <Image
                src="/blue2.svg"
                alt="Travel background"
                fill
                className="object-contain z-10"
              />
              {/* Main image */}
              <Image
                src="/ManJump.png"
                alt="Man with suitcases jumping"
                fill
                className="object-contain z-20"
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-6 lg:w-1/2">
            <div>
              <h1 className="text-4xl font-bold text-black md:text-5xl lg:text-6xl">
                Making Travel
                <br />
                <span className="text-blue-600">Dreams a Reality</span>
              </h1>
            </div>

            <div className="space-y-4 ">
              <p className="text-base !text-gray-600 leading-relaxed md:text-lg">
                Our dedicated team of travel experts works tirelessly to curate journeys that go beyond 
                the ordinary. From the moment you share your vision until you return home with cherished 
                memories, we handle every detail with precision and care, ensuring your dream vacation 
                becomes a beautiful reality.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              {[
                "Customized travel experiences",
                "Expertise in complex travel arrangements",
                "Destination knowledge and insider insights",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-base font-medium text-gray-800 md:text-lg">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
