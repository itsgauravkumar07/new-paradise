const SEOSettings = require("../models/SEOSettings");

// Get SEO settings for dynamic package pages
const getDynamicSEOSettings = async (req, res) => {
  try {
    const { tourType, location } = req.query;

    if (!tourType || !location) {
      return res.status(400).json({
        success: false,
        message: "tourType and location are required",
      });
    }

    const page = `packages-dynamic-${tourType}-${location}`;
    let seoSettings = await SEOSettings.findOne({ page: page });

    // If no settings exist, return default for this location
    if (!seoSettings) {
      const isIndia = tourType === "india";
      const tourTypeLabel = isIndia ? "India" : "International";

      seoSettings = {
        page: page,
        title: `${location} ${tourTypeLabel} Tour Packages | Paradise Yatra`,
        description: `Discover amazing ${tourTypeLabel.toLowerCase()} tour packages in ${location}. Book your dream vacation with Paradise Yatra and explore the best destinations in ${location}.`,
        keywords: [
          `${location} tour packages`,
          `${location} ${tourTypeLabel.toLowerCase()} tours`,
          `${location} travel packages`,
          `${location} holiday packages`,
          `${tourTypeLabel.toLowerCase()} tours ${location}`,
          `travel to ${location}`,
          `${location} vacation packages`,
          `Paradise Yatra ${location}`,
          `${location} destinations`,
          `${tourTypeLabel.toLowerCase()} travel ${location}`,
        ],
        ogImage: "/banner.jpeg",
        canonical: `/packages/${tourType}/${encodeURIComponent(
          location.toLowerCase().replace(/\s+/g, "-")
        )}`,
        robots: "index,follow",
        tourType: tourType,
        location: location,
      };
    }

    res.json({
      success: true,
      data: seoSettings,
    });
  } catch (error) {
    console.error("Error fetching dynamic SEO settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get SEO settings for a specific page
const getSEOSettings = async (req, res) => {
  try {
    const { page } = req.params;

    let seoSettings = await SEOSettings.findOne({ page: page.toLowerCase() });

    // If no settings exist, return default for specific pages
    if (!seoSettings) {
      switch (page) {
        case "homepage":
          seoSettings = {
            page: "homepage",
            title:
              "Paradise Yatra - Your Trusted Travel Partner | Best Travel Agency in Dehradun",
            description:
              "Discover the world with Paradise Yatra, the best travel agency in Dehradun. We offer customized international and domestic tour packages, trekking adventures, and unforgettable travel experiences. 5000+ happy travelers, 25+ countries covered.",
            keywords: [
              "travel agency Dehradun",
              "best travel agency Dehradun",
              "international tours",
              "India tour packages",
              "trekking adventures",
              "travel packages",
              "vacation packages",
              "Paradise Yatra",
              "travel booking",
              "adventure travel",
            ],
            ogImage: "/hero.jpg",
            canonical: "/",
            robots: "index,follow",
          };
          break;
        case "packages-category":
          seoSettings = {
            page: "packages-category",
            title:
              "Tour Packages by Category | Paradise Yatra - Best Travel Packages",
            description:
              "Explore our curated tour packages by category. From trending destinations to popular packages, adventure escapes to premium tours - find your perfect travel experience with Paradise Yatra.",
            keywords: [
              "tour packages by category",
              "trending tour packages",
              "popular tour packages",
              "adventure tour packages",
              "premium tour packages",
              "budget tour packages",
              "travel packages India",
              "Paradise Yatra packages",
              "tour categories",
              "travel deals",
            ],
            ogImage: "/banner.jpeg",
            canonical: "/packages/category",
            robots: "index,follow",
          };
          break;
        case "packages-tourtype":
          seoSettings = {
            page: "packages-tourtype",
            title: "International & India Tour Packages | Paradise Yatra",
            description:
              "Discover amazing tour packages by type - International tours to exotic destinations and India tour packages covering all states. Book your dream vacation with Paradise Yatra.",
            keywords: [
              "international tour packages",
              "India tour packages",
              "tour packages by type",
              "international destinations",
              "India destinations",
              "tour types",
              "travel packages by region",
              "Paradise Yatra tours",
              "holiday packages",
              "vacation packages",
            ],
            ogImage: "/banner.jpeg",
            canonical: "/packages",
            robots: "index,follow",
          };
          break;
        default:
          // Handle dynamic package pages
          if (page.startsWith("packages-dynamic-")) {
            const [, tourType, location] = page.split("-");
            if (tourType && location) {
              const isIndia = tourType === "india";
              const locationType = isIndia ? "state" : "country";
              const tourTypeLabel = isIndia ? "India" : "International";

              seoSettings = {
                page: page,
                title: `${location} ${tourTypeLabel} Tour Packages | Paradise Yatra`,
                description: `Discover amazing ${tourTypeLabel.toLowerCase()} tour packages in ${location}. Book your dream vacation with Paradise Yatra and explore the best destinations in ${location}.`,
                keywords: [
                  `${location} tour packages`,
                  `${location} ${tourTypeLabel.toLowerCase()} tours`,
                  `${location} travel packages`,
                  `${location} holiday packages`,
                  `${tourTypeLabel.toLowerCase()} tours ${location}`,
                  `travel to ${location}`,
                  `${location} vacation packages`,
                  `Paradise Yatra ${location}`,
                  `${location} destinations`,
                  `${tourTypeLabel.toLowerCase()} travel ${location}`,
                ],
                ogImage: "/banner.jpeg",
                canonical: `/packages/${tourType}/${encodeURIComponent(
                  location.toLowerCase().replace(/\s+/g, "-")
                )}`,
                robots: "index,follow",
                tourType: tourType,
                location: location,
              };
            }
          }
          break;
      }
    }

    if (!seoSettings) {
      return res.status(404).json({
        success: false,
        message: "SEO settings not found for this page",
      });
    }

    res.json({
      success: true,
      data: seoSettings,
    });
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create or update dynamic SEO settings
const updateDynamicSEOSettings = async (req, res) => {
  try {
    const { tourType, location } = req.body;
    const updateData = req.body;

    if (!tourType || !location) {
      return res.status(400).json({
        success: false,
        message: "tourType and location are required",
      });
    }

    const page = `packages-dynamic-${tourType}-${location}`;

    // Validate required fields
    if (!updateData.title || !updateData.description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Validate title length
    if (updateData.title.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Title should be 60 characters or less",
      });
    }

    // Validate description length
    if (updateData.description.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Description should be 160 characters or less",
      });
    }

    // Ensure page field matches the constructed page name
    updateData.page = page;
    updateData.tourType = tourType;
    updateData.location = location;
    updateData.lastUpdated = new Date();

    const seoSettings = await SEOSettings.findOneAndUpdate(
      { page: page },
      updateData,
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Dynamic SEO settings updated successfully",
      data: seoSettings,
    });
  } catch (error) {
    console.error("Error updating dynamic SEO settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create or update SEO settings for a page
const updateSEOSettings = async (req, res) => {
  try {
    const { page } = req.params;
    const updateData = req.body;

    // Validate required fields
    if (!updateData.title || !updateData.description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Validate title length
    if (updateData.title.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Title should be 60 characters or less",
      });
    }

    // Validate description length
    if (updateData.description.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Description should be 160 characters or less",
      });
    }

    // Ensure page field matches the URL parameter
    updateData.page = page.toLowerCase();
    updateData.lastUpdated = new Date();

    const seoSettings = await SEOSettings.findOneAndUpdate(
      { page: page.toLowerCase() },
      updateData,
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "SEO settings updated successfully",
      data: seoSettings,
    });
  } catch (error) {
    console.error("Error updating SEO settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all SEO settings
const getAllSEOSettings = async (req, res) => {
  try {
    const seoSettings = await SEOSettings.find({}).sort({ page: 1 });

    res.json({
      success: true,
      data: seoSettings,
    });
  } catch (error) {
    console.error("Error fetching all SEO settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete SEO settings for a page
const deleteSEOSettings = async (req, res) => {
  try {
    const { page } = req.params;

    const seoSettings = await SEOSettings.findOneAndDelete({
      page: page.toLowerCase(),
    });

    if (!seoSettings) {
      return res.status(404).json({
        success: false,
        message: "SEO settings not found for this page",
      });
    }

    res.json({
      success: true,
      message: "SEO settings deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting SEO settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getSEOSettings,
  updateSEOSettings,
  getAllSEOSettings,
  deleteSEOSettings,
  getDynamicSEOSettings,
  updateDynamicSEOSettings,
};
