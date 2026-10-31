"use client";

import Image from "next/image";
import Link from "next/link";

interface DestinationCardProps {
    name: string;
    image: string;
    href: string;
}

const DestinationCard = ({ name, image, href }: DestinationCardProps) => {
    return (
        <Link
            href={href}
            className="group flex-shrink-0 w-[272px] h-[272px] scroll-snap-align-start relative"
        >
            <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-100 bg-slate-200">
                {/* White hover overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-10 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none"></div>

                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end z-20">

                    <h3 className="!text-2xl !font-bold text-white leading-tight drop-shadow-md transition-transform duration-300">
                        {name}
                    </h3>
                </div>
            </div>
        </Link>
    );

};

export default DestinationCard;
