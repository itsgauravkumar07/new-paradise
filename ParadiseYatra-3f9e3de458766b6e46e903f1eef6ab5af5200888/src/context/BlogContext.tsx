"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
  status: "published" | "draft";
  faqs?: { question: string; answer: string; order?: number }[];
}

interface BlogContextType {
  blogs: BlogPost[];
  addBlog: (blog: Omit<BlogPost, "id">) => void;
  updateBlog: (id: string, blog: Partial<BlogPost>) => void;
  deleteBlog: (id: string) => void;
  toggleBlogStatus: (id: string) => void;
  getPublishedBlogs: () => BlogPost[];
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const initialBlogs: BlogPost[] = [
  {
    id: "1",
    title: "Best Time to Visit Uttarakhand: A Complete Seasonal Guide",
    content:
      "Uttarakhand, the 'Land of Gods,' offers a unique experience in every season. Spring (March-May) brings blooming rhododendrons and pleasant weather, making it perfect for trekking and sightseeing. Summer (June-August) is ideal for visiting hill stations like Mussoorie and Nainital, though monsoon brings heavy rainfall. Autumn (September-November) offers clear skies and stunning views of the Himalayas, making it the best time for photography and outdoor activities. Winter (December-February) transforms the region into a winter wonderland, perfect for snow activities and experiencing the magical beauty of snow-capped peaks. The Chardham Yatra typically opens from April/May to November, with the best time being May-June and September-October when the weather is pleasant and the routes are accessible. Plan your visit based on your interests - adventure seekers prefer autumn, while spiritual travelers find spring and autumn most suitable for the sacred journey.",
    excerpt:
      "Discover the perfect seasons to explore Uttarakhand's pristine beauty, from the blooming rhododendrons in spring to the snow-capped peaks in winter. Plan your trip with our comprehensive seasonal guide.",
    author: "Travel Expert",
    publishDate: "2024-01-15",
    readTime: "8 min read",
    category: "Travel Guide",
    image: "🏔️",
    slug: "best-time-to-visit-uttarakhand",
    status: "published",
  },
  {
    id: "2",
    title: "Complete Chardham Yatra Itinerary: Tips for a Spiritual Journey",
    content:
      "The sacred Chardham Yatra encompasses four holy shrines: Yamunotri, Gangotri, Kedarnath, and Badrinath. Start your journey from Yamunotri, the source of River Yamuna, accessible via a 6km trek from Janki Chatti. Next, visit Gangotri, the origin of River Ganga, located at 3,048 meters. Kedarnath, dedicated to Lord Shiva, requires a 14km trek from Gaurikund or helicopter service. Finally, visit Badrinath, the abode of Lord Vishnu, accessible by road. Essential tips: Carry warm clothes as temperatures drop significantly at high altitudes, book accommodations in advance, carry essential medicines, and respect local customs. The best time for Chardham Yatra is May-June and September-October. Consider hiring a local guide for better understanding of the spiritual significance and safer navigation through challenging terrains. Remember to carry sufficient cash as ATMs may not be available at all locations.",
    excerpt:
      "Embark on the sacred Chardham Yatra with our detailed itinerary covering Yamunotri, Gangotri, Kedarnath, and Badrinath. Essential tips for a smooth spiritual journey.",
    author: "Spiritual Guide",
    publishDate: "2024-01-10",
    readTime: "12 min read",
    category: "Spiritual Journey",
    image: "🕉️",
    slug: "chardham-yatra-itinerary-tips",
    status: "published",
  },
  {
    id: "3",
    title:
      "Adventure Activities in Uttarakhand: From Trekking to River Rafting",
    content:
      "Uttarakhand is a paradise for adventure enthusiasts. Popular trekking destinations include Valley of Flowers (6-7 days), Kedarnath Trek (2-3 days), and Roopkund Trek (8-9 days). River rafting on the Ganga in Rishikesh offers thrilling rapids ranging from Grade I to Grade V. Other adventure activities include paragliding in Mussoorie, rock climbing in Rishikesh, and camping in Auli. For wildlife enthusiasts, Corbett National Park offers jeep safaris to spot tigers and other wildlife. The state also offers mountain biking trails, zip-lining, and bungee jumping. Always ensure you have proper permits and hire certified guides for safety. The best seasons for adventure activities are spring and autumn when weather conditions are favorable.",
    excerpt:
      "Explore the thrilling adventure opportunities in Uttarakhand, including trekking routes, river rafting spots, and camping destinations for adrenaline seekers.",
    author: "Adventure Specialist",
    publishDate: "2024-01-08",
    readTime: "10 min read",
    category: "Adventure",
    image: "🏃‍♂️",
    slug: "adventure-activities-uttarakhand",
    status: "published",
  },
  {
    id: "4",
    title: "Local Cuisine of Uttarakhand: Traditional Dishes You Must Try",
    content:
      "Uttarakhand's cuisine reflects its rich cultural heritage and mountainous terrain. Must-try dishes include Garhwali Thali featuring Kafuli (spinach curry), Phaanu (lentil curry), and Chainsoo (black gram curry). Kumaoni specialties include Bhatt ki Churkani (black soybean curry), Aloo ke Gutke (spiced potatoes), and Singal (sweet dish). Don't miss the traditional breads like Mandua ki Roti (finger millet bread) and Gahat ki Dal. For sweets, try Bal Mithai, Singori, and Arsa. Local beverages include Buransh juice (rhododendron) and various herbal teas. Most dishes are prepared with locally sourced ingredients and traditional cooking methods, making them not just delicious but also nutritious and suitable for the cold mountain climate.",
    excerpt:
      "Savor the authentic flavors of Uttarakhand with our guide to traditional dishes, from Garhwali thali to Kumaoni specialties that will delight your taste buds.",
    author: "Food Blogger",
    publishDate: "2024-01-05",
    readTime: "6 min read",
    category: "Local Culture",
    image: "🍽️",
    slug: "uttarakhand-local-cuisine",
    status: "published",
  },
  {
    id: "5",
    title: "Photography Guide: Capturing Uttarakhand's Natural Beauty",
    content:
      "Uttarakhand offers endless photography opportunities. For landscape photography, visit Valley of Flowers during monsoon, Auli for snow-capped peaks, and Kedarnath for spiritual architecture. Wildlife photography enthusiasts should visit Corbett National Park and Rajaji National Park. For cultural photography, explore local villages and capture traditional festivals. Best photography spots include Nainital Lake at sunrise, Kedarnath Temple during golden hour, and Valley of Flowers in full bloom. Essential tips: Carry extra batteries as cold weather drains them faster, use polarizing filters for landscape shots, and respect local customs when photographing people. The golden hours (sunrise and sunset) provide the best lighting conditions for capturing the majestic Himalayas.",
    excerpt:
      "Master the art of photography in Uttarakhand with tips on capturing stunning landscapes, wildlife, and cultural moments in the lap of the Himalayas.",
    author: "Photography Expert",
    publishDate: "2024-01-03",
    readTime: "9 min read",
    category: "Photography",
    image: "📸",
    slug: "photography-guide-uttarakhand",
    status: "published",
  },
  {
    id: "6",
    title: "Budget Travel Tips for Exploring Uttarakhand",
    content:
      "Explore Uttarakhand on a budget with these practical tips. Travel during off-season (monsoon and winter) for lower accommodation rates. Stay in homestays and guesthouses instead of luxury hotels. Use public transportation like buses and shared taxis. Book train tickets in advance for better rates. Eat at local dhabas and small restaurants for authentic and affordable food. Carry your own water bottle and snacks to avoid overpriced items at tourist spots. Consider group tours for adventure activities as they're more cost-effective. Many attractions have different rates for Indian and foreign tourists, so carry proper identification. Plan your itinerary to minimize travel costs between destinations.",
    excerpt:
      "Plan your Uttarakhand adventure on a budget with our comprehensive guide covering accommodation, transportation, and activities that won't break the bank.",
    author: "Budget Traveler",
    publishDate: "2024-01-01",
    readTime: "7 min read",
    category: "Budget Travel",
    image: "💰",
    slug: "budget-travel-uttarakhand",
    status: "published",
  },
];

export const BlogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);

  const addBlog = (blogData: Omit<BlogPost, "id">) => {
    const newBlog: BlogPost = {
      ...blogData,
      id: Date.now().toString(),
    };
    setBlogs((prev) => [...prev, newBlog]);
  };

  const updateBlog = (id: string, updates: Partial<BlogPost>) => {
    setBlogs((prev) =>
      prev.map((blog) => (blog.id === id ? { ...blog, ...updates } : blog))
    );
  };

  const deleteBlog = (id: string) => {
    setBlogs((prev) => prev.filter((blog) => blog.id !== id));
  };

  const toggleBlogStatus = (id: string) => {
    setBlogs((prev) =>
      prev.map((blog) =>
        blog.id === id
          ? {
              ...blog,
              status: blog.status === "published" ? "draft" : "published",
            }
          : blog
      )
    );
  };

  const getPublishedBlogs = () => {
    return blogs.filter((blog) => blog.status === "published");
  };

  return (
    <BlogContext.Provider
      value={{
        blogs,
        addBlog,
        updateBlog,
        deleteBlog,
        toggleBlogStatus,
        getPublishedBlogs,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlogs = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlogs must be used within a BlogProvider");
  }
  return context;
};
