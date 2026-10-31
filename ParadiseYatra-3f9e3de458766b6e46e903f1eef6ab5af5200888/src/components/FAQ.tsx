"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

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

interface FAQProps {
  state: string;
  className?: string;
}

const FAQ = ({ state, className = "" }: FAQProps) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Normalize state name for API call
        const normalizedState = state.toLowerCase().trim()
          .replace(/&/g, 'and')
          .replace(/\s+/g, ' ');
        
        let response = await fetch(`/api/faq?location=${encodeURIComponent(normalizedState)}&isActive=true`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        
        // If no FAQs found with exact match, try partial matching
        if (!data.success || !data.faqs || data.faqs.length === 0) {
          // Try fetching all FAQs and filter client-side for partial matches
          const allFaqsResponse = await fetch(`/api/faq?isActive=true`);
          if (allFaqsResponse.ok) {
            const allFaqsData = await allFaqsResponse.json();
            if (allFaqsData.success && allFaqsData.faqs) {
              // Filter FAQs that contain the state name or vice versa
              const matchingFaqs = allFaqsData.faqs.filter((faq: FAQItem) => {
                const faqLocation = faq.location.toLowerCase().trim();
                return faqLocation.includes(normalizedState) || normalizedState.includes(faqLocation);
              });
              data = { success: true, faqs: matchingFaqs };
            }
          }
        }
        
        if (data.success && data.faqs) {
          // Sort FAQs by order field
          const sortedFaqs = data.faqs.sort((a: FAQItem, b: FAQItem) => a.order - b.order);
          setFaqs(sortedFaqs);
        } else {
          setFaqs([]);
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Failed to load FAQs');
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    if (state) {
      fetchFAQs();
    }
  }, [state]);

  const toggleExpanded = (faqId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedItems(newExpanded);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="flex items-center mb-6">
          <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">❓</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (faqs.length === 0) {
    return null; // Don't show FAQ section if no FAQs available
  }

  const stateLabel = state.charAt(0).toUpperCase() + state.slice(1);

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">
          Frequently Asked Questions about {stateLabel}
        </h2>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq) => {
          const isExpanded = expandedItems.has(faq._id);
          
          return (
            <div
              key={faq._id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(faq._id)}
                className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                aria-expanded={isExpanded}
                aria-controls={`faq-answer-${faq._id}`}
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div
                  id={`faq-answer-${faq._id}`}
                  className="px-6 py-4 bg-white border-t border-gray-200"
                >
                  <div
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: faq.answer.replace(/\n/g, '<br />')
                    }}
                  />
                  
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Still have questions?</strong> Feel free to{' '}
          <a
            href="/contact"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            contact us
          </a>{' '}
          or call us directly for personalized assistance with your {stateLabel} travel plans.
        </p>
      </div>
    </div>
  );
};

export default FAQ;
