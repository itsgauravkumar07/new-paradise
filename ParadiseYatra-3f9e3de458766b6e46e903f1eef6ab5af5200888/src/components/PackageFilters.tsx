"use client";

import { useState, useEffect } from 'react';

interface PackageFiltersProps {
  totalCount: number;
  packageCount: number;
  destinationCount: number;
}

const PackageFilters = ({ totalCount, packageCount, destinationCount }: PackageFiltersProps) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'packages' | 'destinations'>('all');

  // Update active filter when counts change (due to price filtering)
  useEffect(() => {
    // If no items of a certain type are available after price filtering, reset to 'all'
    if (activeFilter === 'packages' && packageCount === 0) {
      setActiveFilter('all');
    } else if (activeFilter === 'destinations' && destinationCount === 0) {
      setActiveFilter('all');
    }
  }, [packageCount, destinationCount, activeFilter]);

  const handleShowAll = () => {
    setActiveFilter('all');
    const allItems = document.querySelectorAll('[data-item-type]');
    allItems.forEach((item, index) => {
      const element = item as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        element.style.display = 'block';
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
      }, index * 50);
    });
  };

  const handleShowPackages = () => {
    if (packageCount === 0) return; // Don't filter if no packages available
    
    setActiveFilter('packages');
    const allItems = document.querySelectorAll('[data-item-type]');
    allItems.forEach((item, index) => {
      const element = item as HTMLElement;
      const itemType = element.getAttribute('data-item-type');
      
      if (itemType === 'package') {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
          element.style.display = 'block';
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
        }, index * 50);
      } else {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        setTimeout(() => {
          element.style.display = 'none';
        }, 200);
      }
    });
  };

  const handleShowDestinations = () => {
    if (destinationCount === 0) return; // Don't filter if no destinations available
    
    setActiveFilter('destinations');
    const allItems = document.querySelectorAll('[data-item-type]');
    allItems.forEach((item, index) => {
      const element = item as HTMLElement;
      const itemType = element.getAttribute('data-item-type');
      
      if (itemType === 'destination') {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
          element.style.display = 'block';
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
        }, index * 50);
      } else {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        setTimeout(() => {
          element.style.display = 'none';
        }, 200);
      }
    });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap justify-center gap-2">
        <button 
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeFilter === 'all' 
              ? 'bg-blue-600 text-white shadow-lg scale-105' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
          }`}
          onClick={handleShowAll}
        >
          All ({totalCount})
        </button>
        <button 
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeFilter === 'packages' 
              ? 'bg-green-600 text-white shadow-lg scale-105' 
              : packageCount === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
          }`}
          onClick={handleShowPackages}
          disabled={packageCount === 0}
        >
          Packages ({packageCount})
        </button>
        <button 
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeFilter === 'destinations' 
              ? 'bg-purple-600 text-white shadow-lg scale-105' 
              : destinationCount === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
          }`}
          onClick={handleShowDestinations}
          disabled={destinationCount === 0}
        >
          Destinations ({destinationCount})
        </button>
      </div>
    </div>
  );
};

export default PackageFilters;
