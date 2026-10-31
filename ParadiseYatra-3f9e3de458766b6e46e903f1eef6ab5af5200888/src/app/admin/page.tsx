"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LazyAdminDashboard,
  LazyAdminBlogs,
  LazyAdminSEO,
  LazyAdminMenu,
  LazyAdminFixedDepartures,
  LazyAdminPastTrips,
  LazyAdminHeroSection,
  LazyAdminFooter,
  LazyAdminTestimonials,
  LazyAdminCTASection,
  LazyAdminStats,
  LazyAdminItinerary,
  LazyAdminTags,
  LazyAdminPackages,
  LazyAdminDestinationCovers,
  LazyAdminLeads,
  LazyAdminContactEnquiries,
  LazyAdminPageContent,
  LazyAdminHotels,
  LazyAdminHotelEnquiries,
  LazyAdminChatConversations,
  LazyAdminChatbotEnquiries,
} from "@/components/lazy-admin-components";
import AdminFAQ from "@/components/admin/AdminFAQ";
import AdminDestinationFAQ from "@/components/admin/AdminDestinationFAQ";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Bell, ChevronRight, ShieldAlert } from "lucide-react";
import AdminStaffAccounts from "@/components/admin/AdminStaffAccounts";
import AdminAuditLog from "@/components/admin/AdminAuditLog";
import dynamic from "next/dynamic";
import { STAFF_ROLES, canAccessSection, roleLabels } from "@/lib/adminPermissions";

const AdminLegalPages = dynamic(() => import("@/components/admin/AdminLegalPages"), { ssr: false });
const AdminOffers = dynamic(() => import("@/components/admin/AdminOffers"), { ssr: false });
const AdminCustomerMoments = dynamic(() => import("@/components/admin/AdminCustomerMoments"), { ssr: false });

type AdminSection =
  | "dashboard"
  | "hero-section"
  | "header"
  | "footer"
  | "testimonials"
  | "cta-section"
  | "stats"
  | "menu"
  | "seo"
  | "page-content"
  | "blogs"
  | "fixed-departures"
  | "past-trips"
  | "itinerary"
  | "faq"
  | "destination-faq"
  | "tags"
  | "all-packages"
  | "destination-covers"
  | "leads"
  | "contact-enquiries"
  | "chatbot-enquiries"
  | "chat-conversations"
  | "hotels"
  | "hotel-enquiries"
  | "staff-accounts"
  | "activity-log"
  | "legal-pages"
  | "offers"
  | "customer-gallery";

const sectionLabels: Record<string, string> = {
  dashboard: "Dashboard",
  "hero-section": "Hero Section",
  footer: "Footer",
  testimonials: "Testimonials",
  "cta-section": "CTA Section",
  stats: "Statistics",
  menu: "Menu",
  seo: "SEO",
  "page-content": "Page Content",
  blogs: "Blog Management",
  "fixed-departures": "Fixed Departures",
  "past-trips": "Past Group Trips",
  itinerary: "Itinerary Management",
  faq: "FAQ Management",
  "destination-faq": "Destination FAQ",
  tags: "Tags Management",
  "all-packages": "All Packages",
  "destination-covers": "Destinations Covered",
  leads: "Queries Management",
  "staff-accounts": "Staff Accounts",
  "contact-enquiries": "Contact Enquiries",
  "chatbot-enquiries": "Chatbot Enquiries",
  "chat-conversations": "Chat Conversations",
  hotels: "Hotels",
  "hotel-enquiries": "Hotel Enquiries",
  "activity-log": "Activity Log",
  "legal-pages": "Legal Pages",
  offers: "Offers",
  "customer-gallery": "Customer Gallery",
};

// The first section each role lands on after login - whatever their most
// relevant area is, rather than dumping everyone on "dashboard" by default.
const defaultSectionForRole: Record<string, AdminSection> = {
  admin: "dashboard",
  developer: "dashboard",
  marketer: "blogs",
  packageManager: "all-packages",
  legal: "legal-pages",
};

const AccessRestricted = () => (
  <div className="flex flex-col items-center justify-center text-center py-24 px-6">
    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
      <ShieldAlert className="w-6 h-6 text-amber-500" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-1">
      You don&apos;t have access to this section
    </h3>
    <p className="text-sm text-slate-500 max-w-sm">
      This part of the dashboard is restricted. If you think you should have
      access, ask an administrator to update your account.
    </p>
  </div>
);

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["blogs"])
  );
  const [blogAction, setBlogAction] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [userRole, setUserRole] = useState<string>("admin");
  const [currentTime, setCurrentTime] = useState("");
  const router = useRouter();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) +
          " · " +
          now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken");
      const userStr = localStorage.getItem("adminUser");

      if (!token || !userStr) {
        router.push("/admin/login");
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (!STAFF_ROLES.includes(user.role)) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          router.push("/admin/login");
          return;
        }

        setAdminName(user.name || "Admin");
        setUserRole(user.role);
        setActiveSection(defaultSectionForRole[user.role] || "dashboard");

        const response = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          router.push("/admin/login");
          return;
        }

        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const handleBlogAction = (event: CustomEvent) => {
      setBlogAction(event.detail);
    };
    window.addEventListener("blogAction", handleBlogAction as EventListener);
    return () => window.removeEventListener("blogAction", handleBlogAction as EventListener);
  }, []);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  const renderActiveSection = () => {
    // Defense in depth: even if activeSection is forced to something this
    // role can't see (e.g. via devtools), don't render the real component -
    // the backend would reject the API calls anyway, this just avoids a
    // confusing half-broken screen.
    if (!canAccessSection(userRole, activeSection)) {
      return <AccessRestricted />;
    }

    switch (activeSection) {
      case "dashboard": return <LazyAdminDashboard />;
      case "hero-section": return <LazyAdminHeroSection />;
      case "footer": return <LazyAdminFooter />;
      case "testimonials": return <LazyAdminTestimonials />;
      case "cta-section": return <LazyAdminCTASection />;
      case "stats": return <LazyAdminStats />;
      case "menu": return <LazyAdminMenu />;
      case "seo": return <LazyAdminSEO />;
      case "page-content": return <LazyAdminPageContent />;
      case "blogs":
        return (
          <LazyAdminBlogs
            initialAction={blogAction}
            onActionComplete={() => setBlogAction(null)}
          />
        );
      case "fixed-departures": return <LazyAdminFixedDepartures />;
      case "past-trips": return <LazyAdminPastTrips />;
      case "itinerary": return <LazyAdminItinerary />;
      case "faq": return <AdminFAQ />;
      case "destination-faq": return <AdminDestinationFAQ />;
      case "tags": return <LazyAdminTags />;
      case "all-packages": return <LazyAdminPackages />;
      case "destination-covers": return <LazyAdminDestinationCovers />;
      case "leads": return <LazyAdminLeads />;
      case "contact-enquiries": return <LazyAdminContactEnquiries />;
      case "chatbot-enquiries": return <LazyAdminChatbotEnquiries />;
      case "chat-conversations": return <LazyAdminChatConversations />;
      case "hotels": return <LazyAdminHotels />;
      case "hotel-enquiries": return <LazyAdminHotelEnquiries />;
      case "staff-accounts": return <AdminStaffAccounts />;
      case "activity-log": return <AdminAuditLog />;
      case "legal-pages": return <AdminLegalPages />;
      case "offers": return <AdminOffers />;
      case "customer-gallery": return <AdminCustomerMoments />;
      default: return <LazyAdminDashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)" }}>
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-indigo-200 text-sm font-medium">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Sidebar — fixed width column, scrolls independently */}
      <div
        style={{
          width: "256px",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        }}
      >
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection as (section: string) => void}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          onLogout={handleLogout}
          userRole={userRole}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(0,0,0,0.07)",
            boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-semibold text-slate-700">
              {sectionLabels[activeSection] || activeSection}
            </span>
          </div>

          {/* Right: time + notifications + avatar */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:block">{currentTime}</span>

            <button
              className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "#f1f5f9" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "#e2e8f0")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9")}
            >
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-1 ring-white" />
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-700 leading-tight">{adminName}</p>
                <p className="text-[10px] text-slate-400">{roleLabels[userRole] || userRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{renderActiveSection()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;