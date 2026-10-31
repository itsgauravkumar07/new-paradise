"use client";

import { useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  url: string;
  order: number;
  isActive: boolean;
  hasChildren: boolean;
  children?: MenuItem[];
}

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Home",
      url: "/",
      order: 1,
      isActive: true,
      hasChildren: false,
    },
    {
      id: "2",
      name: "Packages",
      url: "/packages",
      order: 2,
      isActive: true,
      hasChildren: true,
      children: [
        { id: "2-1", name: "Premium Packages", url: "/packages/premium", order: 1, isActive: true, hasChildren: false },
        { id: "2-2", name: "Adventure Packages", url: "/packages/adventure", order: 2, isActive: true, hasChildren: false },
      ],
    },
    {
      id: "3",
      name: "Destinations",
      url: "/destinations",
      order: 3,
      isActive: true,
      hasChildren: false,
    },
    {
      id: "4",
      name: "Blog",
      url: "/blog",
      order: 4,
      isActive: true,
      hasChildren: false,
    },
    {
      id: "5",
      name: "Contact",
      url: "/contact",
      order: 5,
      isActive: true,
      hasChildren: false,
    },
  ]);

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    order: "",
    isActive: true,
    hasChildren: false,
  });

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      url: item.url,
      order: item.order.toString(),
      isActive: item.isActive,
      hasChildren: item.hasChildren,
    });
    setShowForm(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    const updatedItems = menuItems.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            name: formData.name,
            url: formData.url,
            order: parseInt(formData.order),
            isActive: formData.isActive,
            hasChildren: formData.hasChildren,
          }
        : item
    );

    setMenuItems(updatedItems);
    setEditingItem(null);
    setFormData({
      name: "",
      url: "",
      order: "",
      isActive: true,
      hasChildren: false,
    });
    setShowForm(false);
  };

  const toggleItemStatus = (id: string) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your website navigation menu structure.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Navigation Menu</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">#{item.order}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleItemStatus(item.id)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 hover:cursor-pointer hover:scale-105 transition-all"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                {item.hasChildren && item.children && (
                  <div className="mt-3 ml-8 space-y-2">
                    {item.children.map((child) => (
                      <div key={child.id} className="flex justify-between items-center py-2 border-l-2 border-gray-200 pl-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">{child.name}</span>
                          <p className="text-xs text-gray-500">{child.url}</p>
                        </div>
                        <button
                          onClick={() => toggleItemStatus(child.id)}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            child.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {child.isActive ? "Active" : "Inactive"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm && editingItem && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Edit Menu Item - {editingItem.name}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Menu Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasChildren}
                  onChange={(e) => setFormData({ ...formData, hasChildren: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has Submenu</span>
              </label>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleUpdateItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Menu Item
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu; 