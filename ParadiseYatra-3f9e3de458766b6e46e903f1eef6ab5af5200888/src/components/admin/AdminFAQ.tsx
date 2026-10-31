"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown, MapPin, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  location: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface NewFAQ {
  question: string;
  answer: string;
  location: string;
  isActive: boolean;
  order: number;
}

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [tourTypes] = useState<string[]>(['india', 'international']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const [editForm, setEditForm] = useState<FAQItem | null>(null);
  const [newFAQ, setNewFAQ] = useState<NewFAQ>({
    question: '',
    answer: '',
    location: '',
    isActive: true,
    order: 1
  });

  useEffect(() => {
    fetchFAQs();
    fetchLocations();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      console.log('Fetching FAQs from /api/faq...');
      
      const response = await fetch('/api/faq');
      console.log('FAQ Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('FAQ Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('FAQ Response data:', data);
      
      if (data.success && data.faqs) {
        setFaqs(data.faqs.sort((a: FAQItem, b: FAQItem) => a.order - b.order));
        console.log('FAQs loaded:', data.faqs.length);
      } else {
        setFaqs([]);
        console.log('No FAQs found in response');
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError(`Failed to load FAQs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      console.log('Fetching locations...');
      const allLocations = new Set<string>();

      // First, try to get locations from tour-types API (this seems to work)
      try {
        console.log('Fetching tour types...');
        const tourTypesResponse = await fetch('/api/tour-types');
        console.log('Tour types response status:', tourTypesResponse.status);
        
        if (tourTypesResponse.ok) {
          const tourTypesData = await tourTypesResponse.json();
          console.log('Tour types data:', tourTypesData);
          
          // Extract locations from the tour-types response
          if (tourTypesData && Array.isArray(tourTypesData)) {
            tourTypesData.forEach((tourType: any) => {
              if (tourType.tourType === 'international' && tourType.countries) {
                tourType.countries.forEach((country: any) => {
                  // Add country name
                  if (country.name) {
                    allLocations.add(country.name.toLowerCase().trim());
                  }
                  
                  // Add state names
                  if (country.states && Array.isArray(country.states)) {
                    country.states.forEach((state: any) => {
                      if (state.name && state.name !== 'Other') {
                        allLocations.add(state.name.toLowerCase().trim());
                      }
                    });
                  }
                });
              }
            });
          }

          // Also extract availableStates if present
          if (tourTypesData[0]?.availableStates && Array.isArray(tourTypesData[0].availableStates)) {
            tourTypesData[0].availableStates.forEach((state: string) => {
              if (state && state !== 'Other') {
                allLocations.add(state.toLowerCase().trim());
              }
            });
          }

          console.log('Added locations from tour-types:', Array.from(allLocations));
        } else {
          const errorText = await tourTypesResponse.text();
          console.error('Tour types response not ok:', tourTypesResponse.status, errorText);
        }
      } catch (err) {
        console.error('Error fetching tour types:', err);
      }

      // Add some common Indian states as fallback
      const commonIndianStates = [
        'sikkim', 'kerala', 'rajasthan', 'goa', 'himachal pradesh', 
        'uttarakhand', 'jammu and kashmir', 'tamil nadu', 'karnataka',
        'maharashtra', 'west bengal', 'assam', 'meghalaya'
      ];

      commonIndianStates.forEach(state => {
        allLocations.add(state.toLowerCase().trim());
      });

      // Convert Set to sorted array
      const sortedLocations = Array.from(allLocations).sort();
      console.log('Final locations array:', sortedLocations);
      setLocations(sortedLocations);
    } catch (err) {
      console.error('Error fetching locations:', err);
      
      // Ultimate fallback - add some basic locations
      const fallbackLocations = [
        'sikkim', 'kerala', 'rajasthan', 'goa', 'dubai', 'bali', 'malaysia', 'singapore'
      ];
      setLocations(fallbackLocations);
    }
  };

  const handleAdd = async () => {
    try {
      // Validate required fields
      if (!newFAQ.location || !newFAQ.question || !newFAQ.answer) {
        setError('Please fill in all required fields (Location, Question, and Answer)');
        return;
      }

      const token = localStorage.getItem("adminToken");
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFAQ),
      });

      console.log('Create FAQ response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('FAQ created successfully:', responseData);
        
        setNewFAQ({
          question: '',
          answer: '',
          location: '',
          isActive: true,
          order: 1
        });
        setShowAddForm(false);
        setError(null); // Clear any previous errors
        fetchFAQs();
      } else {
        const errorData = await response.json();
        console.error('Create FAQ error:', errorData);
        setError(errorData.message || 'Failed to create FAQ');
      }
    } catch (err) {
      console.error('Error creating FAQ:', err);
      setError(`Failed to create FAQ: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (faq: FAQItem) => {
    setEditingId(faq._id);
    setEditForm({ ...faq });
  };

  const handleSave = async () => {
    if (!editForm) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/faq/${editForm._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setEditingId(null);
        setEditForm(null);
        fetchFAQs();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update FAQ');
      }
    } catch (err) {
      console.error('Error updating FAQ:', err);
      setError('Failed to update FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/faq/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchFAQs();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete FAQ');
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setError('Failed to delete FAQ');
    }
  };

  const handleReorder = async (id: string, newOrder: number) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch('/api/faq/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, newOrder }),
      });

      if (response.ok) {
        fetchFAQs();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to reorder FAQ');
      }
    } catch (err) {
      console.error('Error reordering FAQ:', err);
      setError('Failed to reorder FAQ');
    }
  };

  const filteredFAQs = selectedLocation === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.location.toLowerCase() === selectedLocation.toLowerCase());

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Location Filter and Info */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-3">
          <label className="text-sm font-medium text-gray-700">Filter by Location:</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location.charAt(0).toUpperCase() + location.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={fetchLocations}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Refresh locations"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
        
        {locations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Available Locations ({locations.length}):</strong> {' '}
              {locations.slice(0, 10).map(loc => loc.charAt(0).toUpperCase() + loc.slice(1)).join(', ')}
              {locations.length > 10 && ` and ${locations.length - 10} more...`}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Locations are automatically synced from your tour destinations and packages.
            </p>
          </div>
        )}
      </div>

      {/* Add FAQ Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New FAQ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location/State</label>
              <select
                value={newFAQ.location}
                onChange={(e) => setNewFAQ({ ...newFAQ, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a location...</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location.charAt(0).toUpperCase() + location.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <input
                type="text"
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                placeholder="e.g., Best places to visit in Sikkim?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
              <textarea
                value={newFAQ.answer}
                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                rows={4}
                placeholder="Provide a detailed answer..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={newFAQ.order}
                  onChange={(e) => setNewFAQ({ ...newFAQ, order: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newIsActive"
                  checked={newFAQ.isActive}
                  onChange={(e) => setNewFAQ({ ...newFAQ, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="newIsActive" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add FAQ
            </button>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
          <p className="text-sm text-yellow-700">
            <strong>Total FAQs:</strong> {faqs.length}<br/>
            <strong>Filtered FAQs:</strong> {filteredFAQs.length}<br/>
            <strong>Available Locations:</strong> {locations.length}<br/>
            <strong>Selected Location:</strong> {selectedLocation}<br/>
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}<br/>
            <strong>Error:</strong> {error || 'None'}
          </p>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              {selectedLocation === 'all' ? 'No FAQs found' : `No FAQs found for ${selectedLocation}`}
            </div>
            {faqs.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800 mb-3">
                  <strong>Getting Started:</strong> Create your first FAQ to help visitors with common questions about destinations.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Create First FAQ
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredFAQs.map((faq) => (
            <div
              key={faq._id}
              className={`bg-white border rounded-lg p-4 ${
                editingId === faq._id ? 'border-blue-300' : 'border-gray-200'
              }`}
            >
              {editingId === faq._id && editForm ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a location...</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location.charAt(0).toUpperCase() + location.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                    <input
                      type="text"
                      value={editForm.question}
                      onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                    <textarea
                      value={editForm.answer}
                      onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                      <input
                        type="number"
                        value={editForm.order}
                        onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`editIsActive-${editForm._id}`}
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor={`editIsActive-${editForm._id}`} className="text-sm text-gray-700">Active</label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditForm(null);
                      }}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 text-green-600 hover:text-green-800 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-blue-600 capitalize">
                          {faq.location}
                        </span>
                        <span className="text-sm text-gray-500">#{faq.order}</span>
                        {faq.isActive ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-700 text-sm line-clamp-3">{faq.answer}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleReorder(faq._id, faq.order - 1)}
                        disabled={faq.order === 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(faq._id, faq.order + 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(faq)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq._id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFAQ;
