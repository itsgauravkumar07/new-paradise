// Adds SAMPLE hotels + offers for development. Safe to re-run (upserts by slug / title).
// Usage (from backend root):  node src/scripts/seedHotels.js
require("dotenv").config({ path: __dirname + "/../../.env" });
const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");
const Offer = require("../models/Offer");

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;

const hotels = [
  { name: "Himalayan Retreat Resort", slug: "himalayan-retreat-resort", city: "Manali", state: "Himachal Pradesh", starRating: 4, pricePerNight: 5200, originalPricePerNight: 6500, isFeatured: true,
    shortDescription: "Mountain-facing rooms with a bonfire lounge, 10 minutes from Mall Road.",
    description: "Wake up to snow-capped peaks. Spacious wooden-interior rooms, an in-house restaurant, bonfire evenings and easy access to Solang Valley and Mall Road.",
    amenities: ["Free WiFi", "Breakfast included", "Parking", "Restaurant", "Room heater", "Mountain view"],
    images: [img("photo-1566073771259-6a8506099945"), img("photo-1582719478250-c89cae4dc85b")] },
  { name: "Ganga View Residency", slug: "ganga-view-residency", city: "Rishikesh", state: "Uttarakhand", starRating: 3, pricePerNight: 2800, originalPricePerNight: 3400,
    shortDescription: "Riverside stay close to Laxman Jhula with a rooftop yoga deck.",
    description: "A calm riverside hotel with clean rooms, a rooftop yoga deck and cafe, walking distance from Laxman Jhula and the evening aarti.",
    amenities: ["Free WiFi", "Breakfast included", "Yoga deck", "Restaurant", "River view"],
    images: [img("photo-1551882547-ff40c63fe5fa"), img("photo-1520250497591-112f2f40a3f4")] },
  { name: "Kedar Valley Lodge", slug: "kedar-valley-lodge", city: "Guptkashi", state: "Uttarakhand", starRating: 3, pricePerNight: 2200,
    shortDescription: "Simple, warm rooms on the Kedarnath route with hot water and veg meals.",
    description: "A pilgrim-friendly lodge on the Kedarnath route offering clean rooms, hot water round the clock and freshly cooked vegetarian meals.",
    amenities: ["Hot water", "Vegetarian meals", "Parking", "Room heater"],
    images: [img("photo-1578683010236-d716f9a3f461")] },
  { name: "Bali Zen Villas", slug: "bali-zen-villas", city: "Bali", state: "", country: "Indonesia", starRating: 5, pricePerNight: 14500, originalPricePerNight: 18000, isFeatured: true,
    shortDescription: "Private pool villas in Ubud surrounded by rice terraces.",
    description: "Private pool villas with open-air bathrooms, daily breakfast and a spa, set among Ubud's rice terraces.",
    amenities: ["Free WiFi", "Breakfast included", "Swimming pool", "Spa", "Airport transfer", "Restaurant"],
    images: [img("photo-1537996194471-e657df975ab4"), img("photo-1540541338287-41700207dee6")] },
  { name: "Goa Palm Beach Resort", slug: "goa-palm-beach-resort", city: "Goa", state: "Goa", starRating: 4, pricePerNight: 7800, originalPricePerNight: 9500,
    shortDescription: "Beachfront resort with a pool bar, 2 minutes from Calangute.",
    description: "Beachfront rooms, a lagoon pool with swim-up bar and live music on weekends, just steps from Calangute beach.",
    amenities: ["Free WiFi", "Breakfast included", "Swimming pool", "Bar", "Restaurant", "Parking"],
    images: [img("photo-1571896349842-33c89424de2d"), img("photo-1445019980597-93fa8acb246c")] },
  { name: "Jaipur Haveli Heritage", slug: "jaipur-haveli-heritage", city: "Jaipur", state: "Rajasthan", starRating: 4, pricePerNight: 6100,
    shortDescription: "A restored haveli with courtyard dining near the City Palace.",
    description: "A 150-year-old restored haveli with courtyard dining, folk music evenings and a short walk to the City Palace and Hawa Mahal.",
    amenities: ["Free WiFi", "Breakfast included", "Restaurant", "Swimming pool", "Airport transfer"],
    images: [img("photo-1564501049412-61c2a3083791")] },
];

const banners = [
  { title: "Mountain escapes - up to 20% off hotels", type: "hotel", linkUrl: "/hotels/search?city=Manali", order: 1,
    imageUrl: img("photo-1506905925346-21bda4d32df4") },
  { title: "Bali honeymoon packages", type: "package", linkUrl: "/package", order: 2,
    imageUrl: img("photo-1537996194471-e657df975ab4") },
  { title: "Beach weekends in Goa", type: "hotel", linkUrl: "/hotels/search?city=Goa", order: 3,
    imageUrl: img("photo-1507525428034-b723cf961d3e") },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const h of hotels) await Hotel.updateOne({ slug: h.slug }, { $set: h }, { upsert: true });
  for (const b of banners) await Offer.updateOne({ title: b.title }, { $set: b }, { upsert: true });
  console.log(`Seeded ${hotels.length} hotels and ${banners.length} offers.`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
