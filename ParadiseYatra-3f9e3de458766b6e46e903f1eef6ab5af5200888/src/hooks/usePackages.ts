"use client";

import { useState } from 'react';
import { packagesAPI } from '@/lib/api';
import { Package } from '@/types/package';

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async (params: Record<string, unknown> = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.getAll(params);
      setPackages(response.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.getTrending();
      setPackages(response.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching trending packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackagesByCategory = async (category: string, params: Record<string, unknown> = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.getByCategory(category, params);
      // Handle both wrapped and direct array responses
      const packagesData = Array.isArray(response) ? response : (response.data || []);
      setPackages(packagesData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching packages by category:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchPackages = async (query: string, params: Record<string, unknown> = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.search(query, params);
      // Handle both wrapped and direct array responses
      const packagesData = Array.isArray(response) ? response : (response.data || []);
      setPackages(packagesData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error searching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPackage = async (packageData: Partial<Package>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.create(packageData);
      // Refresh packages list
      await fetchPackages();
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error creating package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePackage = async (id: string, packageData: Partial<Package>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await packagesAPI.update(id, packageData);
      // Update the package in the list
      setPackages(prev =>
        prev.map(pkg => pkg._id === id ? response.data : pkg)
      );
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error updating package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePackage = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await packagesAPI.delete(id);
      // Remove the package from the list
      setPackages(prev => prev.filter(pkg => pkg._id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error deleting package:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    packages,
    loading,
    error,
    fetchPackages,
    fetchTrendingPackages,
    fetchPackagesByCategory,
    searchPackages,
    createPackage,
    updatePackage,
    deletePackage,
  };
}; 