const Hotel = require('../models/Hotel');

const HOTEL_FIELDS = [
  'name', 'slug', 'description', 'shortDescription', 'city', 'state', 'country', 'address',
  'pricePerNight', 'originalPricePerNight', 'starRating', 'features', 'amenities', 'images',
  'contactPhone', 'contactEmail', 'isActive', 'isFeatured',
];
const pickHotelFields = (body = {}) =>
  HOTEL_FIELDS.reduce((out, k) => (body[k] !== undefined ? { ...out, [k]: body[k] } : out), {});
const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toList = (value) =>
  String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const SORTS = {
  recommended: { isFeatured: -1, createdAt: -1 },
  'price-asc': { pricePerNight: 1 },
  'price-desc': { pricePerNight: -1 },
  rating: { starRating: -1, isFeatured: -1 },
};

const HOTEL_FEATURE_AMENITIES = {
  breakfastIncluded: ['breakfast included', 'free breakfast'],
  dinnerIncluded: ['dinner included', 'free dinner'],
  allMealsIncluded: ['all meals included', 'all-inclusive', 'all inclusive'],
  freeWifi: ['free wifi', 'free wi-fi', 'wifi', 'wi-fi'],
  parking: ['parking', 'free parking'],
  swimmingPool: ['swimming pool', 'pool'],
  airportTransfer: ['airport transfer', 'airport shuttle'],
  familyRooms: ['family rooms', 'family room'],
  petFriendly: ['pet friendly', 'pets allowed'],
  airConditioning: ['air conditioning', 'air-conditioned', 'ac'],
  roomHeater: ['room heater', 'heater'],
  spaWellness: ['spa', 'wellness'],
  flexibleCancellation: ['flexible cancellation', 'free cancellation'],
};
const HOTEL_FEATURES = new Set(Object.keys(HOTEL_FEATURE_AMENITIES));
const hasOnlyKnownFeatures = (features) =>
  features === undefined || (Array.isArray(features) && features.every((feature) => HOTEL_FEATURES.has(feature)));

const getAllHotels = async (req, res) => {
  try {
    const { city, search, minPrice, maxPrice, stars, amenities, features, sort, limit, page } = req.query;

    const filter = { isActive: true };
    if (city) filter.city = new RegExp(`^${escapeRegex(String(city).trim())}$`, 'i');
    if (search) {
      const regex = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ name: regex }, { city: regex }, { state: regex }];
    }

    const price = {};
    if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) price.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) price.$lte = Number(maxPrice);
    if (Object.keys(price).length) filter.pricePerNight = price;

    const starList = toList(stars).map(Number).filter((n) => n >= 1 && n <= 5);
    if (starList.length) filter.starRating = { $in: starList };

    const amenityList = toList(amenities);
    if (amenityList.length) {
      // one condition per amenity (hotel must have all of them); portable across Mongo-compatible servers
      filter.$and = amenityList.map((a) => ({ amenities: new RegExp(`^${escapeRegex(a)}$`, 'i') }));
    }

    const featureList = [...new Set(toList(features))];
    if (featureList.some((feature) => !HOTEL_FEATURES.has(feature))) {
      return res.status(400).json({ success: false, message: 'One or more hotel features are invalid.' });
    }
    if (featureList.length) {
      filter.$and = [
        ...(filter.$and || []),
        ...featureList.map((feature) => ({
          $or: [
            { features: feature },
            {
              amenities: {
                $in: HOTEL_FEATURE_AMENITIES[feature].map(
                  (amenity) => new RegExp(`^${escapeRegex(amenity)}$`, 'i')
                ),
              },
            },
          ],
        })),
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    const [hotels, total] = await Promise.all([
      Hotel.find(filter)
        .sort(SORTS[sort] || SORTS.recommended)
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      Hotel.countDocuments(filter),
    ]);

    res.json({ success: true, hotels, total, page: pageNum, pageSize });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hotels.' });
  }
};

const getHotelBySlug = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ slug: req.params.slug, isActive: true });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }
    res.json({ success: true, hotel });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hotel.' });
  }
};

const getAvailableCities = async (req, res) => {
  try {
    const cities = await Hotel.distinct('city', { isActive: true });
    res.json({ success: true, cities: cities.filter(Boolean).sort() });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities.' });
  }
};

// Options for the filter sidebar on the search page
const getHotelFilters = async (req, res) => {
  try {
    const [cities, amenities, priceRange] = await Promise.all([
      Hotel.distinct('city', { isActive: true }),
      Hotel.distinct('amenities', { isActive: true }),
      Hotel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, min: { $min: '$pricePerNight' }, max: { $max: '$pricePerNight' } } },
      ]),
    ]);
    res.json({
      success: true,
      cities: cities.filter(Boolean).sort(),
      amenities: amenities.filter(Boolean).sort(),
      minPrice: priceRange[0]?.min ?? 0,
      maxPrice: priceRange[0]?.max ?? 0,
    });
  } catch (error) {
    console.error('Error fetching hotel filters:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch filters.' });
  }
};

// --- Admin ---

const getAllHotelsAdmin = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json({ success: true, hotels });
  } catch (error) {
    console.error('Error fetching hotels (admin):', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hotels.' });
  }
};

const createHotel = async (req, res) => {
  try {
    const data = pickHotelFields(req.body);
    if (!hasOnlyKnownFeatures(data.features)) {
      return res.status(400).json({ success: false, message: 'One or more hotel features are invalid.' });
    }
    data.slug = slugify(data.slug || data.name);
    if (!data.slug) {
      return res.status(400).json({ success: false, message: 'A hotel name or slug is required.' });
    }
    // The server runs with autoIndex off, so don't rely on the unique index alone.
    if (await Hotel.exists({ slug: data.slug })) {
      return res.status(400).json({ success: false, message: 'A hotel with this slug already exists.' });
    }
    const hotel = await Hotel.create(data);
    res.status(201).json({ success: true, hotel });
  } catch (error) {
    console.error('Error creating hotel:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A hotel with this slug already exists.' });
    }
    res.status(400).json({ success: false, message: 'Failed to create hotel. Check all required fields.' });
  }
};

const updateHotel = async (req, res) => {
  try {
    const data = pickHotelFields(req.body);
    if (!hasOnlyKnownFeatures(data.features)) {
      return res.status(400).json({ success: false, message: 'One or more hotel features are invalid.' });
    }
    if (data.slug !== undefined) {
      data.slug = slugify(data.slug);
      if (!data.slug) {
        return res.status(400).json({ success: false, message: 'Slug cannot be empty.' });
      }
      if (await Hotel.exists({ slug: data.slug, _id: { $ne: req.params.id } })) {
        return res.status(400).json({ success: false, message: 'A hotel with this slug already exists.' });
      }
    }
    data.updatedAt = new Date();
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }
    res.json({ success: true, hotel });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(400).json({ success: false, message: 'Failed to update hotel. Check the field values.' });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }
    res.json({ success: true, message: 'Hotel deleted successfully.' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ success: false, message: 'Failed to delete hotel.' });
  }
};

module.exports = {
  getHotelFilters,
  getAllHotels,
  getHotelBySlug,
  getAvailableCities,
  getAllHotelsAdmin,
  createHotel,
  updateHotel,
  deleteHotel,
};