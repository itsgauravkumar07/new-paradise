"use client";

import React from "react";

interface SearchHeaderProps {
    title: React.ReactNode;
    subtitle: string;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ title, subtitle }) => {
    return (
        <section className="bg-blue-50/50 py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="!text-4xl !font-black !text-slate-900 !mb-4">
                    {title}
                </h2>
                <p className="!text-sm md:!text-md !font-semibold !text-slate-600 !max-w-3xl !mx-auto">
                    {subtitle}
                </p>
            </div>
        </section>
    );
};

export default SearchHeader;
