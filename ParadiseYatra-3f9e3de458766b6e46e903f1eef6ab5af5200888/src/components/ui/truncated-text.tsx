"use client";

import { useState } from "react";
import { Button } from "./button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TruncatedTextProps {
  text: string;
  maxWords?: number;
  className?: string;
  buttonClassName?: string;
  mobileMaxLines?: number;
  onExpand?: () => void;
  onCollapse?: () => void;
}

const TruncatedText = ({ 
  text, 
  maxWords = 25, 
  className = "", 
  buttonClassName = "",
  mobileMaxLines = 3,
  onExpand,
  onCollapse
}: TruncatedTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next) {
      onExpand && onExpand();
    } else {
      onCollapse && onCollapse();
    }
  };
  
  const words = text.split(' ');
  const shouldTruncate = words.length > maxWords;
  
  if (!shouldTruncate) {
    return (
      <div className={`leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${className}`}>
        <p>{text}</p>
      </div>
    );
  }
  
  const truncatedText = words.slice(0, maxWords).join(' ');
  
  return (
    <div className={`leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${className}`}>
      {isExpanded ? (
        <div className="relative">
          <div className="max-h-32 overflow-y-auto relative scrollbar-hide pr-2">
            <span className="block">{text}</span>
          </div>
          {/* Gradient fade effect positioned outside scrollable area */}
          <div className="absolute bottom-8 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className={`p-0 h-auto text-blue-600 hover:text-blue-700 hover:bg-transparent 
                       font-semibold text-sm hover:cursor-pointer inline-flex items-center 
                       transition-colors duration-200 underline mt-2 ${buttonClassName}`}
          >
            Read Less
            <ChevronUp className="w-3 h-3 ml-1" />
          </Button>
        </div>
      ) : (
        <div>
          <span>
            {truncatedText}
            {shouldTruncate && (
              <>
                <span className="text-gray-500">...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggle}
                  className={`p-0 h-auto text-blue-600 hover:text-blue-700 hover:bg-transparent 
                             font-semibold text-sm hover:cursor-pointer ml-1 inline-flex items-center 
                             transition-colors duration-200 underline ${buttonClassName}`}
                >
                  Read More
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default TruncatedText;
