"use client";

import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DayItineraryCardProps {
  day: {
    day: number;
    title: string;
    activities: string[];
    accommodation: string;
    meals: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

const DayItineraryCard = ({
  day,
  isExpanded,
  onToggle,
}: DayItineraryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Header Section */}
        <div
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {day.day}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {day.title}
              </h3>
              {!isExpanded && day.activities && day.activities.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {day.activities.length} activities
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Activities Section */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-4 pb-4"
          >
            {day.activities && day.activities.length > 0 ? (
              <div className="space-y-3">
                {day.activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {activity}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                No activities listed for this day.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DayItineraryCard;
