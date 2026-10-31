"use client";

import {
  BarChart3,
  FolderOpen,
  Settings,
  Scale,
  BadgePercent,
  FileText,
  Calendar,
  Star,
  Map,
  HelpCircle,
  Tag,
  Package,
  Users,
  Globe,
  ChevronDown,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Image as ImageIcon,
  Megaphone,
  Search,
  Menu,
  ShieldCheck,
  History,
  Mail,
  BedDouble,
  MessageCircle,
  Bot,
  Camera,
} from "lucide-react";
import Image from "next/image";
import { canAccessSection } from "@/lib/adminPermissions";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  expandedSections: Set<string>;
  toggleSection: (section: string) => void;
  onLogout?: () => void;
  userRole: string;
}

type MenuItem =
  | { isHeader: true; label: string }
  | {
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
      hasSubmenu: boolean;
      subItems?: { id: string; label: string }[];
    };

const AdminSidebar = ({
  activeSection,
  setActiveSection,
  expandedSections,
  toggleSection,
  onLogout,
  userRole,
}: AdminSidebarProps) => {
  const rawMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      hasSubmenu: false,
    },
    {
      id: "leads",
      label: "Queries",
      icon: Users,
      hasSubmenu: false,
    },
    {
      id: "contact-enquiries",
      label: "Contact Enquiries",
      icon: Mail,
      hasSubmenu: false,
    },
    {
      id: "chatbot-enquiries",
      label: "Chatbot Enquiries",
      icon: Bot,
      hasSubmenu: false,
    },
    {
      id: "chat-conversations",
      label: "Chat Conversations",
      icon: MessageCircle,
      hasSubmenu: false,
    },
    {
      isHeader: true,
      label: "CONTENT MANAGEMENT",
    },
    {
      id: "page-content",
      label: "Page Content",
      icon: FileText,
      hasSubmenu: false,
    },
    {
      id: "hero-section",
      label: "Hero Section",
      icon: ImageIcon,
      hasSubmenu: false,
    },
    {
      id: "customer-gallery",
      label: "Customer Gallery",
      icon: Camera,
      hasSubmenu: false,
    },
    {
      id: "offers",
      label: "Offers",
      icon: BadgePercent,
      hasSubmenu: false,
    },
    {
      id: "legal-pages",
      label: "Legal Pages",
      icon: Scale,
      hasSubmenu: false,
    },
    {
      id: "footer",
      label: "Footer",
      icon: Settings,
      hasSubmenu: false,
    },
    {
      id: "testimonials",
      label: "Testimonials",
      icon: Star,
      hasSubmenu: false,
    },
    {
      id: "cta-section",
      label: "CTA Section",
      icon: Megaphone,
      hasSubmenu: false,
    },
    {
      id: "stats",
      label: "Statistics",
      icon: BarChart3,
      hasSubmenu: false,
    },
    {
      isHeader: true,
      label: "PACKAGE MANAGEMENT",
    },
    {
      id: "packages-group",
      label: "Packages",
      icon: Package,
      hasSubmenu: true,
      subItems: [
        { id: "all-packages", label: "All Packages" },
        { id: "destination-covers", label: "Destinations Covered" },
      ],
    },
    {
      id: "fixed-departures",
      label: "Fixed Departures",
      icon: Calendar,
      hasSubmenu: false,
    },
    {
      id: "past-trips",
      label: "Past Group Trips",
      icon: Camera,
      hasSubmenu: false,
    },
    {
      id: "itinerary",
      label: "Itinerary",
      icon: Map,
      hasSubmenu: false,
    },
    {
      id: "tags",
      label: "Tags",
      icon: Tag,
      hasSubmenu: false,
    },
    {
      isHeader: true,
      label: "HOTELS",
    },
    {
      id: "hotels",
      label: "Hotels",
      icon: BedDouble,
      hasSubmenu: false,
    },
    {
      id: "hotel-enquiries",
      label: "Hotel Enquiries",
      icon: Mail,
      hasSubmenu: false,
    },
    {
      isHeader: true,
      label: "CONTENT & SEO",
    },
    {
      id: "blogs",
      label: "Blog",
      icon: FileText,
      hasSubmenu: true,
      subItems: [
        { id: "create-blog", label: "Create Blog" },
        { id: "all-blogs", label: "All Blogs" },
      ],
    },
    {
      id: "menu",
      label: "Menu",
      icon: Menu,
      hasSubmenu: false,
    },
    {
      id: "seo",
      label: "SEO",
      icon: Search,
      hasSubmenu: false,
    },
    {
      id: "faq",
      label: "FAQ Management",
      icon: HelpCircle,
      hasSubmenu: false,
    },
    {
      id: "destination-faq",
      label: "Destination FAQ",
      icon: Globe,
      hasSubmenu: false,
    },
    {
      isHeader: true,
      label: "ADMINISTRATION",
    },
    {
      id: "staff-accounts",
      label: "Staff Accounts",
      icon: ShieldCheck,
      hasSubmenu: false,
    },
    {
      id: "activity-log",
      label: "Activity Log",
      icon: History,
      hasSubmenu: false,
    },
  ];

  // Filter by role: drop items the user can't access, drop submenu entries
  // they can't access (note: "create-blog"/"all-blogs" both map to the
  // "blogs" permission, not their own id), and drop any header whose entire
  // group ends up empty as a result.
  const visibleMenuItems: MenuItem[] = [];
  let pendingHeader: MenuItem | null = null;
  let groupHasVisibleItem = false;

  const flushHeader = () => {
    if (pendingHeader && groupHasVisibleItem) {
      visibleMenuItems.push(pendingHeader);
    }
    pendingHeader = null;
    groupHasVisibleItem = false;
  };

  for (const item of rawMenuItems) {
    if ("isHeader" in item) {
      flushHeader();
      pendingHeader = item;
      continue;
    }

    if (item.hasSubmenu && item.subItems) {
      // "packages-group" itself isn't a real section - check its children.
      // "blogs" submenu items both gate on the "blogs" permission.
      const permissionId = item.id === "blogs" ? "blogs" : null;
      const visibleSubItems = item.subItems.filter((sub) =>
        permissionId
          ? canAccessSection(userRole, permissionId)
          : canAccessSection(userRole, sub.id)
      );
      if (visibleSubItems.length === 0) continue;

      groupHasVisibleItem = true;
      if (pendingHeader) {
        visibleMenuItems.push(pendingHeader);
        pendingHeader = null;
      }
      visibleMenuItems.push({ ...item, subItems: visibleSubItems });
      continue;
    }

    if (!canAccessSection(userRole, item.id)) continue;

    groupHasVisibleItem = true;
    if (pendingHeader) {
      visibleMenuItems.push(pendingHeader);
      pendingHeader = null;
    }
    visibleMenuItems.push(item);
  }

  const menuItems = visibleMenuItems;

  const handleItemClick = (itemId: string) => {
    const item = menuItems.find((i) => !("isHeader" in i) && i.id === itemId) as
      | Extract<MenuItem, { id: string }>
      | undefined;
    if (item?.hasSubmenu) {
      toggleSection(itemId);
    } else {
      setActiveSection(itemId);
    }
  };

  return (
    <div
      className="w-64 min-h-screen flex flex-col text-white"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)"
      }}
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="relative rounded-xl overflow-hidden p-1"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
          >
            <Image
              src="/headerLogo.png"
              alt="logo"
              width={48}
              height={48}
              className="rounded-lg object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: "#ffffff" }}>Paradise Yatra</p>
            <p className="text-xs mt-0.5" style={{ color: "#a5b4fc" }}>Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item, idx) => {
          if ("isHeader" in item) {
            return (
              <div key={idx} className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#818cf8" }}>
                  {item.label}
                </p>
                <div className="mt-1.5 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = activeSection === item.id ||
            (item.hasSubmenu && item.subItems?.some(s => activeSection === s.id));
          const isExpanded = expandedSections.has(item.id!);

          return (
            <div key={item.id}>
              <button
                onClick={() => handleItemClick(item.id!)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
                style={
                  isActive
                    ? {
                        background: "linear-gradient(90deg, rgba(99,102,241,0.35), rgba(99,102,241,0.1))",
                        boxShadow: "inset 3px 0 0 #6366f1",
                      }
                    : {}
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "";
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={
                      isActive
                        ? { background: "rgba(99,102,241,0.4)" }
                        : { background: "rgba(255,255,255,0.1)" }
                    }
                  >
                    <Icon
                      className="w-4 h-4 transition-colors"
                      style={{ color: isActive ? "#c7d2fe" : "#a5b4fc" }}
                    />
                  </div>
                  <span
                    className="text-sm font-semibold transition-colors"
                    style={{ color: isActive ? "#ffffff" : "#e2e8f0" }}
                  >
                    {item.label}
                  </span>
                </div>
                {item.hasSubmenu && (
                  <span style={{ color: "#94a3b8" }}>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                )}
              </button>

              {/* Submenu */}
              {item.hasSubmenu && isExpanded && (
                <div className="ml-11 mt-1 space-y-0.5">
                  {item.subItems?.map(subItem => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveSection(item.id === "blogs" ? "blogs" : subItem.id);
                        if (subItem.id === "create-blog") {
                          window.dispatchEvent(new CustomEvent("blogAction", { detail: "create" }));
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150"
                      style={{
                        color: activeSection === "blogs" ? "#ffffff" : "#cbd5e1",
                        background: activeSection === "blogs" ? "rgba(99,102,241,0.15)" : "transparent",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          activeSection === "blogs" ? "rgba(99,102,241,0.15)" : "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          activeSection === "blogs" ? "#ffffff" : "#cbd5e1";
                      }}
                    >
                      · {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      {onLogout && (
        <div className="p-3 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
            style={{ color: "#94a3b8" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.12)" }}
            >
              <LogOut className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;