"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface DestinationCover {
  _id: string;
  name: string;
}

const AdminDestinationCovers = () => {
  const [destinations, setDestinations] = useState<DestinationCover[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/destination-covers");
      if (res.ok) {
        const data = await res.json();
        setDestinations(data || []);
      } else {
        toast.error("Failed to load destinations");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/destination-covers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (res.ok) {
        const newDest = await res.json();
        setDestinations([...destinations, newDest]);
        setNewName("");
        toast.success("Destination Cover added successfully!");
      } else {
        toast.error("Failed to add destination cover");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding destination cover");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;

    try {
      const res = await fetch(`/api/destination-covers?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDestinations(destinations.filter(d => d._id !== id));
        toast.success("Destination deleted!");
      } else {
        toast.error("Failed to delete destination");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting destination");
    }
  };

  const filteredDestinations = destinations.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Destinations Covered</h1>
          <p className="text-gray-500 text-sm mt-1">Manage global destination names for your packages.</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 text-yellow-800">
        <AlertCircle className="shrink-0 w-5 h-5" />
        <div className="text-sm">
          <p className="font-semibold">Development Mode</p>
          <p>These destinations are currently managed locally. Once your backend developer adds the new table, this page can be updated to connect to the live remote API.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Add New Destination</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Manali, Rohtang Pass..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !newName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Destination
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-gray-700"
            />
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {filteredDestinations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No destinations found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 font-medium text-gray-600 text-sm">Destination Name</th>
                    <th className="px-6 py-4 font-medium text-gray-600 text-sm w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDestinations.map((dest) => (
                    <tr key={dest._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{dest.name}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(dest._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Destination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDestinationCovers;
