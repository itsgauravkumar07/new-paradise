"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StatItem {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  category: 'general' | 'testimonial' | 'trust';
}

const AdminStats = () => {
  const [stats, setStats] = useState<StatItem[]>([
    {
      id: "1",
      label: "Total Packages",
      value: "24",
      icon: "📦",
      color: "text-blue-600",
      category: "general"
    },
    {
      id: "2",
      label: "Active Blogs",
      value: "18",
      icon: "📝",
      color: "text-green-600",
      category: "general"
    },
    {
      id: "3",
      label: "Total Bookings",
      value: "156",
      icon: "📅",
      color: "text-purple-600",
      category: "general"
    },
    {
      id: "4",
      label: "Revenue",
      value: "$12,450",
      icon: "💰",
      color: "text-yellow-600",
      category: "general"
    },
    {
      id: "5",
      label: "Happy Travelers",
      value: "5000+",
      icon: "Users",
      color: "text-blue-600",
      category: "testimonial"
    },
    {
      id: "6",
      label: "Average Rating",
      value: "4.9/5",
      icon: "Star",
      color: "text-yellow-600",
      category: "testimonial"
    },
    {
      id: "7",
      label: "Satisfaction Rate",
      value: "98%",
      icon: "ThumbsUp",
      color: "text-green-600",
      category: "testimonial"
    },
    {
      id: "8",
      label: "4.9 Rating",
      value: "4.9/5",
      icon: "Star",
      color: "text-yellow-400",
      category: "trust"
    },
    {
      id: "9",
      label: "500+ Happy Travelers",
      value: "500+",
      icon: "Users",
      color: "text-blue-200",
      category: "trust"
    },
    {
      id: "10",
      label: "24/7 Support",
      value: "24/7",
      icon: "Clock",
      color: "text-green-200",
      category: "trust"
    },
    {
      id: "11",
      label: "Safe & Secure",
      value: "100%",
      icon: "Shield",
      color: "text-pink-200",
      category: "trust"
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingStat, setEditingStat] = useState<StatItem | null>(null);
  const [formData, setFormData] = useState<Omit<StatItem, 'id'>>({
    label: "",
    value: "",
    icon: "",
    color: "",
    category: "general"
  });

  const handleAddNew = () => {
    setEditingStat(null);
    setFormData({
      label: "",
      value: "",
      icon: "",
      color: "",
      category: "general"
    });
    setShowForm(true);
  };

  const handleEdit = (stat: StatItem) => {
    setEditingStat(stat);
    setFormData({
      label: stat.label,
      value: stat.value,
      icon: stat.icon,
      color: stat.color,
      category: stat.category
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingStat) {
      // Update existing stat
      setStats(stats.map(s => 
        s.id === editingStat.id 
          ? { ...formData, id: editingStat.id }
          : s
      ));
    } else {
      // Add new stat
      const newStat: StatItem = {
        ...formData,
        id: Date.now().toString()
      };
      setStats([...stats, newStat]);
    }
    setShowForm(false);
    setEditingStat(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this statistic?")) {
      setStats(stats.filter(s => s.id !== id));
    }
  };

  const getStatsByCategory = (category: StatItem['category']) => {
    return stats.filter(stat => stat.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics Management</h1>
          <p className="text-gray-600">Manage website statistics and trust indicators displayed throughout your site.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
          Add Statistic
        </Button>
      </div>

      {/* Statistics by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dashboard Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Dashboard Statistics</h2>
            <p className="text-sm text-gray-600">Stats shown on admin dashboard</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {getStatsByCategory('general').map((stat) => (
                <div key={stat.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{stat.label}</div>
                      <div className="text-sm text-gray-600">{stat.value}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(stat)}
                      size="sm"
                      variant="admin-outline"
                      className="hover:cursor-pointer hover:scale-105 transition-transform"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(stat.id)}
                      size="sm"
                      variant="admin-secondary"
                      className="hover:cursor-pointer hover:scale-105 transition-transform"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Testimonial Statistics</h2>
            <p className="text-sm text-gray-600">Stats shown in testimonial section</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {getStatsByCategory('testimonial').map((stat) => (
                <div key={stat.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{stat.label}</div>
                      <div className="text-sm text-gray-600">{stat.value}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(stat)}
                      size="sm"
                      variant="admin-outline"
                      className="hover:cursor-pointer hover:scale-105 transition-transform"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(stat.id)}
                      size="sm"
                      variant="admin-secondary"
                      className="hover:cursor-pointer hover:scale-105 transition-transform"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Trust Indicators</h2>
            <p className="text-sm text-gray-600">Trust indicators shown in header/footer</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {getStatsByCategory('trust').map((stat) => (
                <div key={stat.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{stat.label}</div>
                      <div className="text-sm text-gray-600">{stat.value}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(stat)}
                      size="sm"
                      variant="admin-outline"
                      className="hover:cursor-pointer hover:scale-105 transition-transform"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(stat.id)}
                      size="sm"
                      variant="admin-secondary"
                      className="hover:cursor-pointer hover:scale-105 transition-transform"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingStat ? "Edit Statistic" : "Add New Statistic"}
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Total Packages"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., 24"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji or Icon Name)</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📦 or Package"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Class</label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="text-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as StatItem['category'] })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">Dashboard Statistics</option>
                <option value="testimonial">Testimonial Statistics</option>
                <option value="trust">Trust Indicators</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {editingStat ? "Update Statistic" : "Add Statistic"}
            </Button>
            <Button 
              onClick={() => setShowForm(false)} 
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStats; 