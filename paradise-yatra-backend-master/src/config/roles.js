// Central permission matrix for the admin dashboard.
// Every role check in the app (route middleware, and later the admin UI)
// should read from here rather than hardcoding role lists in multiple
// places - that's exactly the kind of drift that caused the FAQ/SEO
// auth bugs we fixed earlier.

// Roles that can be assigned to a staff account via the "Create Account"
// screen. "admin" and "user" are intentionally excluded - admin accounts
// are not created through this flow, and "user" is a public signup, not
// a staff role.
const ASSIGNABLE_STAFF_ROLES = ["developer", "marketer", "packageManager", "legal"];

// Every role that should be treated as "staff" (i.e. allowed into the
// admin dashboard shell at all, even if most sections are hidden from them).
const STAFF_ROLES = ["admin", ...ASSIGNABLE_STAFF_ROLES];

// section -> which roles may access it. "admin" has access to everything
// and does not need to be listed explicitly; it's checked separately.
const SECTION_PERMISSIONS = {
  packages: ["developer", "packageManager"],
  fixedDepartures: ["developer", "packageManager"],
  blogs: ["developer", "marketer"],
  seo: ["developer", "marketer"],
  hotels: ["developer", "packageManager"],
  offers: ["developer", "marketer"], // top offer bar + home page offer cards
  customerMoments: ["developer", "marketer"], // customer photos & videos gallery
  hotelEnquiries: [], // admin-only, like leads
  faq: ["developer"],
  footer: ["developer"],
  legalPages: ["legal"], // Privacy, Terms, Cookie and Refund pages: the legal team (and admin)
  leads: [], // admin-only - no staff role gets this by default
  chats: [], // admin-only - chatbot conversation transcripts
  users: [], // admin-only - no staff role gets this by default
  staffAccounts: [], // admin-only - creating/managing other staff accounts
};

const canAccessSection = (role, section) => {
  if (role === "admin") return true;
  const allowed = SECTION_PERMISSIONS[section];
  return Array.isArray(allowed) && allowed.includes(role);
};

module.exports = {
  ASSIGNABLE_STAFF_ROLES,
  STAFF_ROLES,
  SECTION_PERMISSIONS,
  canAccessSection,
};