"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown, MapPin, Eye, EyeOff, AlertCircle } from 'lucide-react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FAQEntry {
    _id?: string;
    question: string;
    answer: string;
    order: number;
}

interface DestinationFAQ {
    _id: string;
    destination: string;
    tourType: string;
    faqs: FAQEntry[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const MAX_FAQS = 5;

// Helper to get the admin token from localStorage (admin panel uses "adminToken", not "auth_token")
const getAdminToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('adminToken');
    }
    return null;
};

const AdminDestinationFAQ = () => {
    const [destinations, setDestinations] = useState<{ india: string[]; international: string[] }>({ india: [], international: [] });
    const [loading, setLoading] = useState(false);
    const [fetchingDestinations, setFetchingDestinations] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);



    // Selected destination for viewing/editing
    const [selectedDestination, setSelectedDestination] = useState<string>('');
    const [selectedTourType, setSelectedTourType] = useState<string>('india');

    // Current FAQ document being edited
    const [currentFAQDoc, setCurrentFAQDoc] = useState<DestinationFAQ | null>(null);

    // Add/Edit states
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formQuestion, setFormQuestion] = useState('');
    const [formAnswer, setFormAnswer] = useState('');
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    useEffect(() => {
        fetchDestinations();
    }, []);

    useEffect(() => {
        if (selectedDestination && selectedTourType) {
            fetchFAQsForDestination();
        } else {
            setCurrentFAQDoc(null);
        }
    }, [selectedDestination, selectedTourType]);

    const fetchDestinations = async () => {
        try {
            setFetchingDestinations(true);
            const response = await fetch('/api/all-packages?limit=1000&isActive=true&minimal=true');
            if (response.ok) {
                const data = await response.json();
                const packages = data.packages || data || [];

                const indiaStates = new Set<string>();
                const intlCountries = new Set<string>();

                packages.forEach((pkg: any) => {
                    const tt = (pkg.tourType || '').toLowerCase();
                    if (tt === 'india' && pkg.state) {
                        indiaStates.add(pkg.state.toLowerCase().trim());
                    } else if (tt === 'international' && pkg.country) {
                        intlCountries.add(pkg.country.toLowerCase().trim());
                    }
                });

                setDestinations({
                    india: Array.from(indiaStates).filter(Boolean).sort(),
                    international: Array.from(intlCountries).filter(Boolean).sort(),
                });
            }
        } catch (err) {
            console.error('Error fetching destinations:', err);
        } finally {
            setFetchingDestinations(false);
        }
    };

    const fetchFAQsForDestination = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(
                `/api/destination-faqs?destination=${encodeURIComponent(selectedDestination)}&tourType=${selectedTourType}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.destinationFaq) {
                    setCurrentFAQDoc({
                        ...data.destinationFaq,
                        faqs: normalizeFaqs(data.destinationFaq.faqs || []),
                    });
                } else {
                    setCurrentFAQDoc(null);
                }
            } else {
                setCurrentFAQDoc(null);
                const data = await response.json().catch(() => ({}));
                if (response.status === 404) {
                    setError('Backend API route not found. Please ensure you have added the Destination FAQ routes to your backend server.');
                } else {
                    setError(data.message || 'Failed to connect to backend');
                }
            }
        } catch (err) {
            console.error('Error fetching destination FAQs:', err);
            setCurrentFAQDoc(null);
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const normalizeFaqs = (faqs: FAQEntry[] = []): FAQEntry[] => {
        return [...faqs]
            .sort((a, b) => a.order - b.order)
            .map((faq, index) => ({
                ...faq,
                order: index + 1,
            }));
    };

    const toFaqPayload = (faqs: FAQEntry[]) => {
        return normalizeFaqs(faqs).map(({ question, answer, order }) => ({
            question: question.trim(),
            answer: answer.trim(),
            order,
        }));
    };

    const handleSaveNewFAQ = async () => {
        if (!formQuestion.trim() || !formAnswer.trim()) {
            setError('Please fill in both question and answer.');
            return;
        }

        if (!selectedDestination) {
            setError('Please select a destination first.');
            return;
        }

        const currentFaqs = currentFAQDoc?.faqs || [];
        if (currentFaqs.length >= MAX_FAQS) {
            setError(`Maximum ${MAX_FAQS} FAQs allowed per destination.`);
            return;
        }

        const newFaq: FAQEntry = {
            question: formQuestion.trim(),
            answer: formAnswer.trim(),
            order: currentFaqs.length + 1,
        };

        const updatedFaqs = [...currentFaqs, newFaq];

        try {
            setError(null);
            if (currentFAQDoc) {
                // Update existing document
                const response = await fetch(`/api/destination-faqs/${currentFAQDoc._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(getAdminToken() && { 'Authorization': `Bearer ${getAdminToken()}` })
                    },
                    body: JSON.stringify({ faqs: toFaqPayload(updatedFaqs) }),
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to update');
                }
            } else {
                // Create new document
                const response = await fetch('/api/destination-faqs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(getAdminToken() && { 'Authorization': `Bearer ${getAdminToken()}` })
                    },
                    body: JSON.stringify({
                        destination: selectedDestination.toLowerCase(),
                        tourType: selectedTourType,
                        faqs: toFaqPayload(updatedFaqs),
                        isActive: true,
                    }),
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to create');
                }
            }

            setFormQuestion('');
            setFormAnswer('');
            setShowAddForm(false);
            showSuccess('FAQ added successfully!');
            fetchFAQsForDestination();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to save FAQ';
            if (msg.toLowerCase().includes('route not found')) {
                setError('Backend route not found. Please add the Destination FAQ reference code to your backend repository.');
            } else {
                setError(msg);
            }
        }
    };

    const handleUpdateFAQ = async () => {
        if (editingIndex === null || !currentFAQDoc) return;
        if (!formQuestion.trim() || !formAnswer.trim()) {
            setError('Please fill in both question and answer.');
            return;
        }

        const updatedFaqs = currentFAQDoc.faqs.map((faq, idx) => {
            if (idx !== editingIndex) return faq;
            return {
                ...faq,
                question: formQuestion.trim(),
                answer: formAnswer.trim(),
            };
        });

        try {
            setError(null);
            const response = await fetch(`/api/destination-faqs/${currentFAQDoc._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(getAdminToken() && { 'Authorization': `Bearer ${getAdminToken()}` })
                },
                body: JSON.stringify({ faqs: toFaqPayload(updatedFaqs) }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update');
            }

            setEditingIndex(null);
            setFormQuestion('');
            setFormAnswer('');
            showSuccess('FAQ updated successfully!');
            fetchFAQsForDestination();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update FAQ');
        }
    };

    const handleDeleteFAQ = async (index: number) => {
        if (!currentFAQDoc) return;

        const updatedFaqs = currentFAQDoc.faqs.filter((_, i) => i !== index);

        try {
            setError(null);
            setDeletingIndex(index);
            const response = await fetch(`/api/destination-faqs/${currentFAQDoc._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(getAdminToken() && { 'Authorization': `Bearer ${getAdminToken()}` })
                },
                body: JSON.stringify({ faqs: toFaqPayload(updatedFaqs) }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.message || `Server error (${response.status})`;
                alert(`Delete Failed: ${errMsg}`);
                throw new Error(errMsg);
            }

            showSuccess('FAQ deleted successfully!');
            fetchFAQsForDestination();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete FAQ');
        } finally {
            setDeletingIndex(null);
        }
    };

    const handleReorder = async (index: number, direction: 'up' | 'down') => {
        if (!currentFAQDoc) return;
        const faqs = [...currentFAQDoc.faqs];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= faqs.length) return;

        [faqs[index], faqs[swapIndex]] = [faqs[swapIndex], faqs[index]];

        try {
            setError(null);
            const response = await fetch(`/api/destination-faqs/${currentFAQDoc._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(getAdminToken() && { 'Authorization': `Bearer ${getAdminToken()}` })
                },
                body: JSON.stringify({ faqs: toFaqPayload(faqs) }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to reorder');
            }

            fetchFAQsForDestination();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder FAQ');
        }
    };

    const handleToggleActive = async () => {
        if (!currentFAQDoc) return;

        try {
            setError(null);
            const response = await fetch(`/api/destination-faqs/${currentFAQDoc._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(getAdminToken() && { 'Authorization': `Bearer ${getAdminToken()}` })
                },
                body: JSON.stringify({ isActive: !currentFAQDoc.isActive }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to toggle');
            }

            showSuccess(`FAQs ${currentFAQDoc.isActive ? 'disabled' : 'enabled'} successfully!`);
            fetchFAQsForDestination();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle active state');
        }
    };

    const handleDeleteAll = async () => {
        if (!currentFAQDoc) return;

        try {
            setError(null);
            setIsDeletingAll(true);
            const response = await fetch(`/api/destination-faqs/${currentFAQDoc._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(getAdminToken() && { 'Authorization': `Bearer ${getAdminToken()}` })
                },
                body: JSON.stringify({ faqs: [] }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.message || `Server error (${response.status})`;
                alert(`Delete Failed: ${errMsg}`);
                throw new Error(errMsg);
            }

            showSuccess('All FAQs deleted for this destination.');
            setCurrentFAQDoc({ ...currentFAQDoc, faqs: [] });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete destination FAQs');
        } finally {
            setIsDeletingAll(false);
        }
    };

    const startEdit = (index: number) => {
        if (!currentFAQDoc) return;
        setEditingIndex(index);
        setFormQuestion(currentFAQDoc.faqs[index].question);
        setFormAnswer(currentFAQDoc.faqs[index].answer);
        setShowAddForm(false);
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setFormQuestion('');
        setFormAnswer('');
    };

    const startAdd = () => {
        setShowAddForm(true);
        setEditingIndex(null);
        setFormQuestion('');
        setFormAnswer('');
    };

    const currentDestinations = selectedTourType === 'india' ? destinations.india : destinations.international;
    const faqCount = currentFAQDoc?.faqs?.length || 0;
    const canAddMore = faqCount < MAX_FAQS;

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Destination FAQ</h1>
                    <p className="text-sm text-slate-600 mt-1">Configure localized FAQs to boost SEO and help travelers</p>
                </div>
            </div>

            {/* Success/Error Alerts */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                    <span className="font-medium">{successMessage}</span>
                    <Button variant="ghost" size="icon" onClick={() => setSuccessMessage(null)} className="h-8 w-8 text-emerald-600 hover:bg-emerald-100">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span className="font-medium">{error}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setError(null)} className="h-8 w-8 text-rose-600 hover:bg-rose-100">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Destination Selection Card */}
            <Card className="shadow-md border-slate-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        Select Destination
                    </CardTitle>
                    <CardDescription>Choose a location to manage its specific FAQs</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tour Type</label>
                            <Select
                                value={selectedTourType}
                                onValueChange={(val) => {
                                    setSelectedTourType(val);
                                    setSelectedDestination('');
                                }}
                            >
                                <SelectTrigger className="w-full bg-white border-slate-300">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="india">India Tours</SelectItem>
                                    <SelectItem value="international">International Tours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</label>
                            <Select
                                value={selectedDestination}
                                onValueChange={setSelectedDestination}
                                disabled={fetchingDestinations || currentDestinations.length === 0}
                            >
                                <SelectTrigger className="w-full bg-white border-slate-300 capitalize">
                                    <SelectValue placeholder={fetchingDestinations ? "Loading..." : "Choose destination"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {currentDestinations.map((dest) => (
                                        <SelectItem key={dest} value={dest} className="capitalize">
                                            {dest}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>

                    {currentDestinations.length === 0 && !fetchingDestinations && (
                        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2 text-slate-600 text-sm">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            No active packages found for {selectedTourType === 'india' ? 'India' : 'International'} tours.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Management Area */}
            {selectedDestination && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                    <Card className="shadow-lg border-indigo-100 overflow-hidden">
                        <CardHeader className="bg-slate-50/80 border-b flex flex-row items-center justify-between py-4 space-y-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <MapPin className="w-5 h-5 text-indigo-700" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-slate-900 flex items-center gap-2 capitalize">
                                        {selectedDestination}
                                        <Badge variant="secondary" className="bg-slate-200 text-slate-700 font-mono">
                                            {faqCount}/{MAX_FAQS}
                                        </Badge>
                                    </CardTitle>
                                    {currentFAQDoc && (
                                        <div className="mt-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleToggleActive}
                                                className={`h-6 px-2 text-[10px] uppercase tracking-widest font-bold rounded-full ${currentFAQDoc.isActive
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                                    }`}
                                            >
                                                {currentFAQDoc.isActive ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                                                {currentFAQDoc.isActive ? 'Active on site' : 'Draft mode'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {currentFAQDoc && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDeleteAll}
                                        disabled={isDeletingAll}
                                        className="h-9 px-4"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {isDeletingAll ? 'Deleting...' : 'Delete All'}
                                    </Button>
                                )}
                                {canAddMore && (
                                    <Button
                                        onClick={startAdd}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 shadow-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-2 border-2 rounded-full" />
                                        Add FAQ
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6">
                            {loading ? (
                                <div className="space-y-4 py-8">
                                    <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                                    <div className="h-12 bg-slate-100 rounded-lg animate-pulse shadow-inner" />
                                    <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                                </div>
                            ) : (
                                <>
                                    {/* Inline Add/Edit Form */}
                                    {(showAddForm || editingIndex !== null) && (
                                        <div className="bg-slate-50 border-2 border-indigo-100 rounded-xl p-6 mb-8 shadow-sm animate-in zoom-in-95 duration-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                    {editingIndex !== null ? <Edit className="w-4 h-4 text-indigo-600" /> : <Plus className="w-4 h-4 text-indigo-600" />}
                                                    {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
                                                </h4>
                                                <Button variant="ghost" size="icon" onClick={editingIndex !== null ? cancelEdit : () => setShowAddForm(false)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-600 ml-1">The Question</label>
                                                    <Input
                                                        value={formQuestion}
                                                        onChange={(e) => setFormQuestion(e.target.value)}
                                                        placeholder="e.g., What is the best time to visit?"
                                                        className="bg-white border-slate-300 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-slate-600 ml-1">The Answer</label>
                                                    <Textarea
                                                        value={formAnswer}
                                                        onChange={(e) => setFormAnswer(e.target.value)}
                                                        rows={4}
                                                        placeholder="Provide a helpful, detailed response..."
                                                        className="bg-white border-slate-300 focus:ring-indigo-500 resize-none"
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-3 pt-2">
                                                    <Button variant="ghost" onClick={editingIndex !== null ? cancelEdit : () => setShowAddForm(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={editingIndex !== null ? handleUpdateFAQ : handleSaveNewFAQ}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        {editingIndex !== null ? 'Update FAQ' : 'Create FAQ'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Questions Stack */}
                                    {faqCount === 0 && !showAddForm ? (
                                        <div className="text-center py-20 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
                                            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                                                <Plus className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-800">No questions yet</h3>
                                            <p className="text-slate-500 mb-6 max-w-xs mx-auto text-sm">Add the most common questions travelers ask about {selectedDestination}.</p>
                                            <Button
                                                onClick={startAdd}
                                                className="bg-indigo-600 hover:bg-indigo-700 shadow-lg px-8"
                                            >
                                                Create Your First FAQ
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {currentFAQDoc?.faqs
                                                .map((faq, index) => (
                                                    <div
                                                        key={faq._id || `${faq.order}-${index}`}
                                                        className={`group border rounded-xl transition-all duration-300 hover:border-indigo-200 hover:shadow-md ${editingIndex === index ? 'ring-2 ring-indigo-500' : 'bg-white'
                                                            }`}
                                                    >
                                                        <div className="flex">
                                                            {/* Order Handle Column */}
                                                            <div className="bg-slate-50 w-12 flex flex-col items-center justify-center gap-1 border-r group-hover:bg-indigo-50/50 transition-colors">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleReorder(index, 'up')}
                                                                    disabled={index === 0}
                                                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                                                                >
                                                                    <ArrowUp className="w-4 h-4" />
                                                                </Button>
                                                                <span className="text-xs font-black text-slate-400 font-mono">0{faq.order}</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleReorder(index, 'down')}
                                                                    disabled={index === (currentFAQDoc?.faqs.length || 0) - 1}
                                                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                                                                >
                                                                    <ArrowDown className="w-4 h-4" />
                                                                </Button>
                                                            </div>

                                                            {/* Content Column */}
                                                            <div className="flex-1 p-5">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-bold text-slate-900 mb-2 leading-tight">{faq.question}</h4>
                                                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => startEdit(index)}
                                                                            className="h-9 w-9 flex items-center justify-center rounded-md text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors"
                                                                            title="Edit FAQ"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteFAQ(index)}
                                                                            disabled={deletingIndex === index}
                                                                            className="h-9 w-9 flex items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                                                                            title="Delete FAQ"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    {faqCount > 0 && !canAddMore && !showAddForm && (
                                        <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-full">
                                                <AlertCircle className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <p className="text-indigo-800 text-sm font-medium">
                                                You've reached the limit of **{MAX_FAQS} questions** for this destination.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminDestinationFAQ;
