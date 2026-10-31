"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw, Eye, AlertCircle, CheckCircle, Home, Package, MapPin } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";

interface PageSEO {
  _id?: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonical: string;
  robots: string;
  lastUpdated?: string;
  tourType?: string;
  location?: string;
}

type ActiveTab = 'homepage' | 'packages-dynamic';



const AdminSEO = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('homepage');
  
  // SEO data state for all pages
  const [seoData, setSeoData] = useState<Record<ActiveTab, PageSEO>>({
    homepage: {
    page: "homepage",
    title: "Paradise Yatra - Best Travel Agency in Dehradun | Trusted Partner",
    description: "Discover the world with Paradise Yatra, the best travel agency in Dehradun. We offer customized international and domestic tour packages, trekking adventures, and unforgettable travel experiences. 5000+ happy travelers, 25+ countries covered.",
    keywords: [
      "travel agency Dehradun",
      "best travel agency Dehradun", 
      "international tours",
      "India tour packages",
      "trekking adventures",
      "travel packages",
      "vacation packages",
      "Paradise Yatra",
      "travel booking",
      "adventure travel"
    ],
    ogImage: "/bannerCTA.jpeg",
    canonical: "/",
    robots: "index,follow"
    },
    'packages-dynamic': {
      page: "packages-dynamic",
      title: "Dynamic Package SEO",
      description: "SEO settings for dynamic package pages",
      keywords: ["dynamic packages", "seo"],
      ogImage: "/banner.jpeg",
      canonical: "/packages",
      robots: "index,follow"
    }
  });

  const [keywordsInput, setKeywordsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Dynamic SEO state
  const [selectedTourType, setSelectedTourType] = useState<string>('india');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [dynamicSeoData, setDynamicSeoData] = useState<PageSEO | null>(null);
  const [locations, setLocations] = useState<{india: string[], international: string[]}>({
    india: [],
    international: []
  });

  // Load SEO data on component mount
  useEffect(() => {
    loadAllSEOData();
    loadLocations();
  }, []);

  // Update keywords input when active tab or seoData changes
  useEffect(() => {
    if (activeTab === 'packages-dynamic' && dynamicSeoData) {
      if (dynamicSeoData.keywords && Array.isArray(dynamicSeoData.keywords)) {
        setKeywordsInput(dynamicSeoData.keywords.join(", "));
      }
    } else {
      const currentData = seoData[activeTab];
      if (currentData && currentData.keywords && Array.isArray(currentData.keywords)) {
        setKeywordsInput(currentData.keywords.join(", "));
      }
    }
  }, [activeTab, seoData, dynamicSeoData]);

  // Load locations from tour-types API
  const loadLocations = async () => {
    try {
      const response = await fetch('/api/tour-types');
      if (response.ok) {
        const data = await response.json();
        const indiaStates = data.tourTypes.find((tt: any) => tt.tourType === 'india')?.states?.map((state: any) => state.name) || [];
        const internationalCountries = data.tourTypes.find((tt: any) => tt.tourType === 'international')?.countries?.map((country: any) => country.name) || [];
        
        setLocations({
          india: indiaStates,
          international: internationalCountries
        });
        
        // Set default location if none selected
        if (!selectedLocation && indiaStates.length > 0) {
          setSelectedLocation(indiaStates[0]);
        }
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadAllSEOData = async () => {
    try {
      setLoading(true);
      
      // Load SEO data for homepage
      const homepageResponse = await fetch('/api/seo/homepage');
      const updateSeoData = { ...seoData };

      // Process homepage data
      if (homepageResponse.ok) {
        const result = await homepageResponse.json();
        const data = result.success && result.data ? result.data : result;
        if (data) updateSeoData.homepage = data;
      }

      setSeoData(updateSeoData);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading SEO data:', error);
      setMessage({ type: 'error', text: 'Failed to load SEO data' });
    } finally {
      setLoading(false);
    }
  };

  // Load dynamic SEO data for selected tour type and location
  const loadDynamicSEOData = async () => {
    if (!selectedTourType || !selectedLocation) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/seo/packages-dynamic?tourType=${selectedTourType}&location=${encodeURIComponent(selectedLocation)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        if (data) {
          setDynamicSeoData(data);
        }
      }
    } catch (error) {
      console.error('Error loading dynamic SEO data:', error);
    }
  };

  // Load dynamic SEO data when location changes
  useEffect(() => {
    if (selectedTourType && selectedLocation && activeTab === 'packages-dynamic') {
      loadDynamicSEOData();
    }
  }, [selectedTourType, selectedLocation, activeTab]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Convert keywords string to array
      const keywordsArray = keywordsInput
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);

      let currentData, updatedData, apiEndpoint;
      
      if (activeTab === 'packages-dynamic') {
        if (!dynamicSeoData || !selectedTourType || !selectedLocation) {
          throw new Error('Dynamic SEO data or location not selected');
        }
        currentData = dynamicSeoData;
        updatedData = {
          ...currentData,
          keywords: keywordsArray,
          lastUpdated: new Date().toISOString(),
          tourType: selectedTourType,
          location: selectedLocation
        };
        apiEndpoint = '/api/seo/packages-dynamic';
      } else {
        currentData = seoData[activeTab];
        updatedData = {
          ...currentData,
        keywords: keywordsArray,
        lastUpdated: new Date().toISOString()
      };
        
        // Determine the API endpoint based on active tab
        apiEndpoint = '/api/seo/homepage';
      }

      const token = localStorage.getItem('adminToken');

      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        if (activeTab === 'packages-dynamic') {
          setDynamicSeoData(updatedData);
        } else {
          setSeoData(prev => ({
            ...prev,
            [activeTab]: updatedData
          }));
        }
        setHasChanges(false);
        setMessage({ 
          type: 'success', 
          text: `${getPageDisplayName(activeTab)} SEO settings saved successfully!` 
        });
        
        // Show success message for 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to save SEO settings');
      }
    } catch (error) {
      console.error('Error saving SEO data:', error);
      setMessage({ type: 'error', text: 'Failed to save SEO settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const getPageDisplayName = (tab: ActiveTab): string => {
    switch (tab) {
      case 'homepage': return 'Homepage';
      case 'packages-dynamic': return `${selectedLocation} ${selectedTourType === 'india' ? 'India' : 'International'} Tour`;
      default: return 'Page';
    }
  };

  const handleInputChange = (field: keyof PageSEO, value: string) => {
    if (activeTab === 'packages-dynamic') {
      setDynamicSeoData(prev => prev ? { ...prev, [field]: value } : null);
    } else {
      setSeoData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [field]: value
        }
      }));
    }
    setHasChanges(true);
  };

  const handleKeywordsChange = (value: string) => {
    setKeywordsInput(value);
    setHasChanges(true);
  };



  const previewMetadata = () => {
    const keywordsArray = keywordsInput
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);

    const currentData = activeTab === 'packages-dynamic' ? dynamicSeoData : seoData[activeTab];
    
    if (!currentData) return null;

    return {
      title: currentData.title,
      description: currentData.description,
      keywords: keywordsArray,
      ogImage: currentData.ogImage,
      canonical: currentData.canonical
    };
  };

  const metadata = previewMetadata();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700">Loading SEO settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Management</h1>
          <p className="text-gray-700">Manage meta tags, titles, and SEO settings for your website pages and blog posts.</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-700 bg-orange-100 border-orange-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('homepage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center ${
                activeTab === 'homepage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              Homepage
            </button>
            <button
              onClick={() => setActiveTab('packages-dynamic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center ${
                activeTab === 'packages-dynamic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4 mr-2" />
              Dynamic Packages
            </button>
          </nav>
        </div>
      </div>

      {/* Dynamic Packages SEO Content */}
      {activeTab === 'packages-dynamic' && (
        <div className="space-y-6 mt-6">
          {/* Location Selection */}
          <Card className="bg-white shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-gray-900">Select Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Tour Type
                  </label>
                  <select
                    value={selectedTourType}
                    onChange={(e) => {
                      setSelectedTourType(e.target.value);
                      setSelectedLocation(''); // Reset location when tour type changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="india">India Tours</option>
                    <option value="international">International Tours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    {selectedTourType === 'india' ? 'State' : 'Country'}
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select {selectedTourType === 'india' ? 'State' : 'Country'}</option>
                    {locations[selectedTourType as keyof typeof locations].map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {!selectedLocation && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Please select a {selectedTourType === 'india' ? 'state' : 'country'} to manage SEO settings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* SEO Content */}
      <div className="space-y-6 mt-6">
        {/* Show form only for non-dynamic tabs or when location is selected for dynamic */}
        {activeTab !== 'packages-dynamic' || (activeTab === 'packages-dynamic' && selectedLocation && dynamicSeoData) ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit Form */}
            <Card className="bg-white shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-gray-900">
                  Edit {getPageDisplayName(activeTab)} SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Page Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={activeTab === 'packages-dynamic' ? (dynamicSeoData?.title || '') : seoData[activeTab].title}
                    maxLength={60}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter page title"
                    className="w-full bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {(activeTab === 'packages-dynamic' ? (dynamicSeoData?.title || '').length : seoData[activeTab].title.length)}/60 characters (Recommended: 50-60)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Meta Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={activeTab === 'packages-dynamic' ? (dynamicSeoData?.description || '') : seoData[activeTab].description}
                    maxLength={160}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter meta description"
                    rows={3}
                    className="w-full bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {(activeTab === 'packages-dynamic' ? (dynamicSeoData?.description || '').length : seoData[activeTab].description.length)}/160 characters (Recommended: 150-160)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Keywords
                  </label>
                  <Input
                    value={keywordsInput}
                    onChange={(e) => handleKeywordsChange(e.target.value)}
                    placeholder="Enter keywords separated by commas"
                    className="w-full bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Separate multiple keywords with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Open Graph Image
                  </label>
                  <ImageUpload
                    value={activeTab === 'packages-dynamic' ? (dynamicSeoData?.ogImage || '') : seoData[activeTab].ogImage}
                    onChange={(value) => handleInputChange('ogImage', value)}
                    label="Upload OG Image"
                    contentType="misc"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Recommended size: 1200x630 pixels
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Canonical URL
                  </label>
                  <Input
                    value={activeTab === 'packages-dynamic' ? (dynamicSeoData?.canonical || '') : seoData[activeTab].canonical}
                    onChange={(e) => handleInputChange('canonical', e.target.value)}
                    placeholder="/"
                    className="w-full bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Robots Directive
                  </label>
                  <Input
                    value={activeTab === 'packages-dynamic' ? (dynamicSeoData?.robots || '') : seoData[activeTab].robots}
                    onChange={(e) => handleInputChange('robots', e.target.value)}
                    placeholder="index,follow"
                    className="w-full bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-white shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center text-gray-900">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {metadata ? (
                  <>
                    {/* Search Engine Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-3">Search Engine Preview</h4>
                      <div className="border border-gray-300 rounded-lg p-4 bg-white">
                        <div className="text-blue-700 text-sm mb-1 line-clamp-1 font-medium">
                          {metadata.title}
                        </div>
                        <div className="text-green-800 text-sm mb-2">
                          https://paradiseyatra.com{metadata.canonical}
                        </div>
                        <div className="text-gray-700 text-sm line-clamp-2">
                          {metadata.description}
                        </div>
                      </div>
                    </div>

                    {/* Social Media Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-3">Social Media Preview</h4>
                      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                        {metadata.ogImage && (
                          <div className="aspect-video bg-gray-200 flex items-center justify-center">
                            <img 
                              src={metadata.ogImage} 
                              alt="OG Image Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                            {metadata.title}
                          </div>
                          <div className="text-xs text-gray-700 line-clamp-2">
                            {metadata.description}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keywords Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-3">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {metadata.keywords && metadata.keywords.length > 0 ? (
                          metadata.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-600">No keywords added</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-600 py-8">
                    Loading preview...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

          {/* SEO Tips */}
          <Card className="bg-white shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-gray-900">SEO Best Practices for {getPageDisplayName(activeTab)}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Title Optimization</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Keep titles between 50-60 characters</li>
                    <li>• Include primary keyword at the beginning</li>
                    <li>• Make it compelling and click-worthy</li>
                    <li>• Include brand name when possible</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Description Optimization</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Keep descriptions between 150-160 characters</li>
                    <li>• Include a call-to-action</li>
                    <li>• Use active voice and compelling language</li>
                    <li>• Include relevant keywords naturally</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Keywords Strategy</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Focus on 3-5 primary keywords</li>
                    <li>• Include long-tail keywords</li>
                    <li>• Research competitor keywords</li>
                    <li>• Use location-based keywords</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Technical SEO</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Use HTTPS for all URLs</li>
                    <li>• Optimize images (WebP format)</li>
                    <li>• Ensure mobile responsiveness</li>
                    <li>• Monitor page load speed</li>
                  </ul> 
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default AdminSEO;
