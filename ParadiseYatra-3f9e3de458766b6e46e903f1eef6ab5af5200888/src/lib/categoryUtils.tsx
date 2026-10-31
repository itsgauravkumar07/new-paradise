// Utility functions for handling package categories and URLs

import { PACKAGE_CATEGORIES } from "@/config/categories";
import {
  Compass,
  MapPin,
  Mountain,
  Waves,
  TreePine,
  Heart,
  Users,
  Crown,
  DollarSign,
  Calendar,
  Star,
  Sparkles,
} from "lucide-react";
import React from "react";

/**
 * Converts a category name to a URL-friendly format
 * @param category - The category name
 * @returns URL-encoded category string
 */
export const categoryToUrl = (category: string): string => {
  return encodeURIComponent(category);
};

/**
 * Converts a URL-friendly category back to the original category name
 * @param urlCategory - The URL-encoded category
 * @returns The original category name
 */
export const urlToCategory = (urlCategory: string): string => {
  return decodeURIComponent(urlCategory.replace(/-/g, " "));
};

/**
 * Gets the display icon for a category
 * @param category - The category name
 * @returns React component icon for the category
 */
export const getCategoryIcon = (category: string): React.ReactElement => {
  const iconProps = { className: "w-5 h-5 text-blue-600" };

  switch (category.toLowerCase()) {
    case "trending destinations":
      return React.createElement(Compass, iconProps);
    case "premium packages":
      return React.createElement(Crown, iconProps);
    case "adventure tours":
      return React.createElement(Mountain, iconProps);
    case "beach holidays":
      return React.createElement(Waves, iconProps);
    case "mountain treks":
      return React.createElement(Mountain, iconProps);
    case "wildlife safaris":
      return React.createElement(TreePine, iconProps);
    case "pilgrimage tours":
      return React.createElement(MapPin, iconProps);
    case "honeymoon packages":
      return React.createElement(Heart, iconProps);
    case "family tours":
      return React.createElement(Users, iconProps);
    case "luxury tours":
      return React.createElement(Sparkles, iconProps);
    case "budget tours":
      return React.createElement(DollarSign, iconProps);
    case "fixed departure":
      return React.createElement(Calendar, iconProps);
    case "popular packages":
      return React.createElement(Star, iconProps);
    default:
      return React.createElement(MapPin, iconProps);
  }
};

/**
 * Gets the description for a category
 * @param category - The category name
 * @returns Description text for the category
 */
export const getCategoryDescription = (category: string): string => {
  switch (category.toLowerCase()) {
    case "trending destinations":
      return "Discover our most popular and trending travel destinations";
    case "premium packages":
      return "Experience luxury and comfort with our premium travel packages";
    case "adventure tours":
      return "Get your adrenaline pumping with our exciting adventure tours";
    case "beach holidays":
      return "Relax and unwind at the world's most beautiful beaches";
    case "mountain treks":
      return "Conquer peaks and enjoy breathtaking mountain views";
    case "wildlife safaris":
      return "Witness incredible wildlife in their natural habitats";
    case "pilgrimage tours":
      return "Embark on spiritual journeys to sacred destinations";
    case "honeymoon packages":
      return "Create unforgettable memories with your special someone";
    case "family tours":
      return "Perfect packages for the whole family to enjoy together";
    case "luxury tours":
      return "Indulge in the finest travel experiences";
    case "budget tours":
      return "Explore amazing destinations without breaking the bank";
    case "fixed departure":
      return "Join our scheduled group departures for amazing experiences";
    case "popular packages":
      return "Our most loved and frequently booked travel packages";
    default:
      return "Discover amazing travel packages in this category";
  }
};

/**
 * Validates if a category exists in the system
 * @param category - The category name to validate
 * @returns True if the category is valid
 */
export const isValidCategory = (category: string): boolean => {
  return PACKAGE_CATEGORIES.includes(category as any);
};

/**
 * Gets all available categories
 * @returns Array of all available categories
 */
export const getAllCategories = (): readonly string[] => {
  return PACKAGE_CATEGORIES;
};

/**
 * Generates a category page URL
 * @param category - The category name
 * @returns The URL path for the category page
 */
export const getCategoryPageUrl = (category: string): string => {
  return `/package?category=${categoryToUrl(category)}#browse-packages`;
};
