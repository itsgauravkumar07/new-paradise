// Shared permission matrix for the admin dashboard frontend.
// Mirrors paradise-yatra-backend-master/src/config/roles.js - the backend
// is the real enforcement point (every write route checks requireRole), this
// file only controls what the UI shows, so a staff member isn't presented
// with a button that will just 403 when pressed.

export type StaffRole = "admin" | "developer" | "marketer" | "packageManager" | "legal";

export const STAFF_ROLES: StaffRole[] = [
  "admin",
  "developer",
  "marketer",
  "packageManager",
  "legal",
];

// sidebar/section id -> roles allowed to see it (besides admin, who always
// sees everything). Anything not listed here is admin-only by default.
const SECTION_ACCESS: Record<string, StaffRole[]> = {
  dashboard: ["developer", "marketer", "packageManager"],
  "all-packages": ["developer", "packageManager"],
  "destination-covers": ["developer", "packageManager"],
  "fixed-departures": ["developer", "packageManager"],
  "past-trips": ["developer", "packageManager"],
  itinerary: ["developer", "packageManager"],
  hotels: ["developer", "packageManager"],
  offers: ["developer", "marketer"],
  "customer-gallery": ["developer", "marketer"],
  // "hotel-enquiries", "chatbot-enquiries" and "chat-conversations" are admin-only (not listed), like leads
  blogs: ["developer", "marketer"],
  seo: ["developer", "marketer"],
  faq: ["developer"],
  footer: ["developer"],
  "legal-pages": ["legal"],
};

export function canAccessSection(role: string, sectionId: string): boolean {
  if (role === "admin") return true;
  const allowed = SECTION_ACCESS[sectionId];
  return Array.isArray(allowed) && allowed.includes(role as StaffRole);
}

export const roleLabels: Record<string, string> = {
  admin: "Administrator",
  developer: "Developer",
  marketer: "Digital Marketer",
  packageManager: "Package Manager",
  legal: "Legal Team",
};