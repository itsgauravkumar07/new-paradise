"use client";

import { CheckCircle, XCircle } from "lucide-react";

interface InclusionListProps {
  title: string;
  items: string[];
  type: "inclusions" | "exclusions";
}

const InclusionList = ({ title, items, type }: InclusionListProps) => {
  const Icon = type === "inclusions" ? CheckCircle : XCircle;
  const iconColor = type === "inclusions" ? "text-blue-600" : "text-red-500";
  const bgColor =
    type === "inclusions"
      ? "from-green-50 to-emerald-50"
      : "from-red-50 to-pink-50";
  const borderColor =
    type === "inclusions" ? "border-green-200" : "border-red-200";

  return (
    <div
      className={`bg-gradient-to-br ${bgColor} rounded-xl p-6 shadow-lg border ${borderColor}`}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Icon className={`w-6 h-6 mr-3 ${iconColor}`} />
        {title}
      </h3>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-start group">
            <Icon
              className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${iconColor} group-hover:scale-110 transition-transform`}
            />
            <span className="text-gray-700 text-lg leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InclusionList;
