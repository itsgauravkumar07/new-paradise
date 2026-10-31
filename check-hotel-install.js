// Checks that the latest hotel feature files are installed in YOUR project.
// Run from the folder that contains both ParadiseYatra-... and paradise-yatra-backend-master:
//     node check-hotel-install.js
// (or pass that folder:  node check-hotel-install.js "C:\path\to\paradise-yatra-main-site-main")
const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || process.cwd());
const dirs = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const feName = dirs.find((d) => /^ParadiseYatra/i.test(d));
const beName = dirs.find((d) => /^paradise-yatra-backend/i.test(d));
if (!feName || !beName) {
  console.log("Could not find the frontend (ParadiseYatra...) and backend (paradise-yatra-backend...) folders inside:\n  " + root);
  process.exit(1);
}
const FE = path.join(root, feName, "src");
const BE = path.join(root, beName, "src");

let problems = 0;
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null);
const rel = (f) => path.relative(root, f);

// file must exist; optional marker text proves it is the NEW version
const need = (file, marker, what) => {
  const text = read(file);
  if (text === null) { problems++; return console.log("MISSING   " + rel(file) + "   <- " + what); }
  if (marker && !text.includes(marker)) { problems++; return console.log("OLD FILE  " + rel(file) + "   <- " + what); }
  console.log("ok        " + rel(file));
};
const stale = (p, what) => {
  if (fs.existsSync(p)) { problems++; console.log("DELETE    " + rel(p) + "   <- " + what); }
};

console.log("\n=== Frontend ===");
need(path.join(FE, "app/hotels/page.tsx"), "HotelsPageClient", "landing route (without it /hotels is a 404)");
need(path.join(FE, "app/hotels/HotelsPageClient.tsx"), "/api/hotels/banners", "landing page with banners");
need(path.join(FE, "app/hotels/search/HotelSearchClient.tsx"), "HotelFilters", "results page with left filters");
need(path.join(FE, "app/hotels/[slug]/HotelDetailClient.tsx"), "HotelEnquiryForm", "detail page with the booking form");
need(path.join(FE, "components/hotels/HotelEnquiryForm.tsx"), "/api/hotels/enquiries", "booking enquiry form");
need(path.join(FE, "app/api/hotels/enquiries/route.ts"), "", "enquiry API route");
need(path.join(FE, "app/api/hotels/banners/route.ts"), "", "banners API route");
need(path.join(FE, "app/api/hotels-admin/route.ts"), "", "admin API route");
need(path.join(FE, "components/admin/AdminHotels.tsx"), "", "admin: Hotels");
need(path.join(FE, "components/admin/AdminHotelEnquiries.tsx"), "", "admin: Hotel Enquiries");
need(path.join(FE, "components/admin/AdminHotelPromos.tsx"), "", "admin: Banners");
need(path.join(FE, "components/admin/hotels/shared.tsx"), "", "admin helper");
need(path.join(FE, "app/admin/page.tsx"), "LazyAdminHotelEnquiries", "admin page wiring");
need(path.join(FE, "components/admin/AdminSidebar.tsx"), "hotel-enquiries", "admin sidebar entries");
need(path.join(FE, "components/lazy-admin-components.tsx"), "LazyAdminHotelEnquiries", "admin lazy loaders");
need(path.join(FE, "lib/adminPermissions.ts"), "hotel-banners", "admin permissions");
stale(path.join(FE, "app/api/hotels/offers"), "old offers route, no longer used");

console.log("\n=== Backend ===");
need(path.join(BE, "server.js"), 'require("./routes/hotels")', "server must load ./routes/hotels (NOT ./src/routes/hotels)");
need(path.join(BE, "routes/hotels.js"), "enquiries", "hotel routes incl. enquiries and banners");
need(path.join(BE, "controllers/hotelEnquiryController.js"), "", "enquiry controller");
need(path.join(BE, "controllers/hotelPromoController.js"), "", "banner controller");
need(path.join(BE, "models/HotelEnquiry.js"), "hotel-enquiries", "enquiry model");
need(path.join(BE, "models/HotelBanner.js"), "", "banner model");
need(path.join(BE, "config/roles.js"), "hotelEnquiries", "roles");
stale(path.join(BE, "models/HotelOffer.js"), "old offers model, no longer used");

console.log(problems
  ? `\n${problems} problem(s). Copy the files from hotel-admin-and-enquiries.zip over your project (replace when asked), delete the DELETE items, then stop both servers, delete the frontend's .next folder, and start them again.`
  : "\nAll hotel files are the latest version. If something still looks wrong, restart both servers and hard-refresh the browser (Ctrl+Shift+R).");