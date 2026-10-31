const THEME_OVERVIEWS: Record<string, string> = {
  honeymoon:
    "Celebrate your love with our romantic honeymoon packages, featuring breathtaking destinations, luxury accommodations, and unforgettable experiences designed just for couples. Enjoy candlelit dinners on private beaches, relaxing couples spa treatments, and seamless itineraries that let you focus entirely on each other. Let us turn your dream romantic getaway into a beautiful reality with our handpicked selections.",
  luxury:
    "Indulge in unparalleled opulence with our premium luxury packages, offering exclusive stays, personalized services, and extraordinary travel experiences. From five-star heritage palaces and private villas to seamless chauffeur-driven transfers and bespoke gourmet dining, every detail is meticulously curated. Experience the world in ultimate comfort, style, and exclusivity, catering to the most discerning travelers.",
  adventure:
    "Satisfy your thrill-seeking spirit with our adventure tours, offering exciting activities like trekking, scuba diving, and wildlife safaris in stunning landscapes. Challenge yourself with high-altitude mountain climbing, navigate thrilling white-water rapids, and camp under the stars in remote wilderness. Designed for adrenaline junkies and nature lovers, these packages guarantee heart-pounding excitement and lifelong memories.",
  family:
    "Create lasting memories with our family-friendly vacation packages, curated to provide fun, safe, and engaging experiences for travelers of all ages. Enjoy spacious accommodations, exciting theme park visits, kid-friendly cultural activities, and hassle-free transportation. We take the stress out of planning so you can focus on bonding, exploring new sights, and sharing joyful moments with your loved ones.",
  spiritual:
    "Embark on a divine journey with our pilgrimage and spiritual tours, connecting you to sacred sites, ancient temples, and peaceful retreats. Participate in soulful rituals, meditate in tranquil ashrams, and explore the deep-rooted religious history of the world's holiest destinations. These thoughtfully planned itineraries offer a profound sense of inner peace, spiritual awakening, and cultural enlightenment.",
  trending:
    "Explore the most sought-after destinations of the season with our trending packages, handpicked to offer the best travel experiences right now. From viral social media hotspots and newly opened luxury resorts to exclusive seasonal festivals, these tours keep you ahead of the travel curve. Discover what makes these destinations so popular and join the trend with our expertly crafted itineraries.",
  "weekend-getaway":
    "Escape the routine with our refreshing weekend getaways, perfect for a quick recharge amidst nature or in vibrant cityscapes. Leave the hustle of daily life behind as you relax in cozy mountain retreats, explore nearby historical towns, or unwind at a luxury spa resort just a short drive away. Designed for maximum relaxation in minimal time, these short trips are your perfect weekend antidote.",
  "char-dham":
    "Embark on a sacred journey to the Char Dham, seeking spiritual enlightenment and divine blessings amidst the majestic Himalayas. Visit the holy shrines of Yamunotri, Gangotri, Kedarnath, and Badrinath with our expertly guided and well-organized pilgrimage tours. We ensure safe travel, comfortable accommodations, and VIP darshan assistance, allowing you to focus entirely on your devotion and spiritual awakening.",
};

// One-liners for theme cards (e.g. the "Explore By Holiday Themes" rail)
const THEME_SHORT_DESCRIPTIONS: Record<string, string> = {
  honeymoon: "Romantic escapes with private dinners, couple spa sessions and dreamy stays.",
  luxury: "Five-star stays, private transfers and bespoke experiences, curated to the last detail.",
  adventure: "Treks, dives and safaris for travellers who chase the thrill.",
  family: "Easy, fun-filled holidays planned for every age in the family.",
  spiritual: "Sacred temples, peaceful ashrams and soulful journeys to holy places.",
  trending: "This season's most-loved destinations, handpicked by our travel experts.",
  "weekend-getaway": "Quick, refreshing breaks to recharge, close to home.",
  "char-dham": "Guided pilgrimage to Yamunotri, Gangotri, Kedarnath and Badrinath.",
};

const getFirstSentence = (value: string) => value.match(/^.*?[.!?](\s|$)/)?.[0].trim() || value;

export const getThemeShortDescription = (
  slug: string,
  tagDescription: string | undefined,
  formattedName: string
) =>
  THEME_SHORT_DESCRIPTIONS[slug] ||
  (slug === "char-dham-yatra" ? THEME_SHORT_DESCRIPTIONS["char-dham"] : undefined) ||
  (tagDescription ? getFirstSentence(tagDescription) : undefined) ||
  `Handpicked ${formattedName} with balanced itineraries and expert support.`;

export const getThemeOverviewDescription = (
  slug: string,
  tagDescription: string | undefined,
  formattedName: string
) =>
  THEME_OVERVIEWS[slug] ||
  (slug === "char-dham-yatra" ? THEME_OVERVIEWS["char-dham"] : undefined) ||
  tagDescription ||
  `Explore our expertly handpicked ${formattedName} packages, thoughtfully designed to offer you the ultimate travel experience. Discover unique local activities, breathtaking scenic views, and perfectly balanced itineraries that cater to your specific travel style. Whether you are looking for relaxation, adventure, or cultural immersion, our curated selections guarantee a seamless and deeply rewarding vacation.`;
