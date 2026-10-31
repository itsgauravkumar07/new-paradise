const AllPackage = require("../models/AllPackage");
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const { processSingleImage } = require("../utils/imageUtils");
const { uploadToCloudinary, extractPublicId, deleteFromCloudinary } = require("../utils/cloudinaryUpload");

// List fields that arrive as JSON strings when the admin form is sent as multipart form data
const LIST_FIELDS = ["gallery", "knowBeforeYouGo", "thingsToCarry"];
const parseListFields = (body) => {
    LIST_FIELDS.forEach((field) => {
        if (typeof body[field] === "string") {
            try {
                const parsed = JSON.parse(body[field]);
                body[field] = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                body[field] = body[field].trim() ? [body[field].trim()] : [];
            }
        }
        if (Array.isArray(body[field])) {
            body[field] = body[field].map((v) => String(v).trim()).filter(Boolean);
        }
    });
};

// Helper function to generate slug from name
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim("-"); // Remove leading/trailing hyphens
};

// Helper function to ensure unique slug
const ensureUniqueSlug = async (baseSlug, existingId = null) => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };
        if (existingId) {
            query._id = { $ne: existingId };
        }

        const existing = await AllPackage.findOne(query);
        if (!existing) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};

// Helper function to transform image paths to full URLs
const transformPackageImageUrl = (pkg) => {
    if (pkg.image) {
        pkg.image = processSingleImage(pkg.image);
    }
    return pkg;
};

const padTimePart = (value) => String(value).padStart(2, "0");

const buildExportFilename = (prefix = "packages-export") => {
    const now = new Date();
    return `${prefix}-${now.getFullYear()}-${padTimePart(now.getMonth() + 1)}-${padTimePart(now.getDate())}_${padTimePart(now.getHours())}-${padTimePart(now.getMinutes())}.xlsx`;
};

const stripHtmlToText = (value) => {
    if (!value) return "";

    const text = String(value)
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();

    return text;
};

const normalizeTag = (tagValue) => {
    if (!tagValue) return null;

    if (typeof tagValue === "string" || tagValue instanceof mongoose.Types.ObjectId) {
        return {
            id: String(tagValue),
            name: "",
            slug: "",
        };
    }

    return {
        id: tagValue._id ? String(tagValue._id) : "",
        name: tagValue.name || "",
        slug: tagValue.slug || "",
    };
};

const toCsv = (values = []) => {
    if (!Array.isArray(values)) return "";
    return values
        .filter((item) => item !== undefined && item !== null && String(item).trim() !== "")
        .map((item) => String(item))
        .join(", ");
};

// Get all packages
const getAllPackages = async (req, res) => {
    try {
        const {
            limit = 100,
            page = 1,
            tourType,
            country,
            state,
            isActive,
            q
        } = req.query;

        let query = {};

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (tourType && ["international", "india"].includes(tourType)) {
            query.tourType = tourType;
        }

        // Helper function to escape regex special characters
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        if (country) {
            // Create a flexible regex that allows spaces or hyphens between words
            // This handles cases where URL slug "united-arab-emirates" matches DB entry "United Arab Emirates"
            // Replace both spaces AND hyphens with a pattern that matches either
            const safeCountry = escapeRegExp(country.trim()).replace(/[\s-]+/g, '[\\s-]+');
            query.country = { $regex: new RegExp(safeCountry, "i") };
        }

        if (state) {
            // Create a flexible regex that allows spaces or hyphens between words
            // This handles cases where URL slug decoding (hyphens -> spaces) matches DB entries with hyphens or varying whitespace
            // Replace both spaces AND hyphens with a pattern that matches either
            const safeState = escapeRegExp(state.trim()).replace(/[\s-]+/g, '[\\s-]+');
            query.state = { $regex: new RegExp(safeState, "i") };
        }

        if (q) {
            // Escape user input so it is matched literally (an unescaped "(" used to crash the query)
            const safeQ = escapeRegExp(String(q).trim().slice(0, 100));
            query.$or = [
                { name: { $regex: safeQ, $options: "i" } },
                { description: { $regex: safeQ, $options: "i" } },
                { location: { $regex: safeQ, $options: "i" } },
                // So "sikkim" also finds packages named after a town there ("Gangtok ...")
                { state: { $regex: safeQ, $options: "i" } },
                { country: { $regex: safeQ, $options: "i" } }
            ];
        }

        const minimal = req.query.minimal === 'true';

        let packagesQuery = AllPackage.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        if (minimal) {
            packagesQuery = packagesQuery.select('name slug state country image tourType isActive price');
        }
        
        let packages = await packagesQuery;

        let total = await AllPackage.countDocuments(query);

        // Transform image URLs
        const transformedPackages = packages.map((pkg) =>
            transformPackageImageUrl(pkg.toObject())
        );

        res.json({
            packages: transformedPackages,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / parseInt(limit)),
                hasNext: parseInt(page) * parseInt(limit) < total,
                hasPrev: parseInt(page) > 1,
                totalItems: total
            },
        });
    } catch (error) {
        console.error("Get all packages error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// Get single package
const getPackage = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if it's a valid ObjectId (24 character hex string)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

        let pkg;
        if (isObjectId) {
            // Query by ObjectId
            pkg = await AllPackage.findById(id);
        } else {
            // Query by slug
            pkg = await AllPackage.findOne({ slug: id });
        }

        if (!pkg) {
            return res.status(404).json({ message: "Package not found." });
        }

        // Increment visit count
        pkg.visitCount += 1;
        await pkg.save();

        // Transform image URL
        const transformedPackage = transformPackageImageUrl(pkg.toObject());

        res.json(transformedPackage);
    } catch (error) {
        console.error("Get package error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// Create package (Admin only)
const createPackage = async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = [
            "name",
            "description",
            "shortDescription",
            "location",
            "country",
            "tourType"
        ];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        // Validate tour type
        const validTourTypes = ["international", "india"];
        if (!validTourTypes.includes(req.body.tourType)) {
            return res.status(400).json({
                message: "Invalid tour type. Must be one of: international, india",
            });
        }

        // Generate slug from custom slug or name
        let baseSlug;
        if (req.body.slug && req.body.slug.trim()) {
            // Use custom slug if provided
            baseSlug = generateSlug(req.body.slug);
        } else {
            // Auto-generate from name if slug is empty
            baseSlug = generateSlug(req.body.name);
        }
        req.body.slug = await ensureUniqueSlug(baseSlug);

        // If image file is uploaded, upload to Cloudinary
        if (req.file) {
            const cloudinaryResult = await uploadToCloudinary(
                req.file.path,
                'packages',
                null,
                null
            );
            req.body.image = cloudinaryResult.url;
        }

        // Validate that image is provided (either via file upload or URL)
        if (!req.body.image) {
            return res.status(400).json({ message: 'Image is required (upload a file or provide a URL)' });
        }

        // Parse JSON fields if they come as strings
        if (typeof req.body.itinerary === 'string') {
            try {
                req.body.itinerary = JSON.parse(req.body.itinerary);
            } catch (e) {
                console.error("Failed to parse itinerary JSON", e);
            }
        }

        if (typeof req.body.tags === 'string' && req.body.tags.startsWith('[')) {
            try {
                req.body.tags = JSON.parse(req.body.tags);
            } catch (e) {
                console.error("Failed to parse tags JSON", e);
            }
        }

        parseListFields(req.body);
        const pkg = new AllPackage(req.body);
        await pkg.save();

        // Transform image URL
        const transformedPackage = transformPackageImageUrl(pkg.toObject());

        res.status(201).json({
            message: "Package created successfully",
            package: transformedPackage,
        });
    } catch (error) {
        console.error("Create package error:", error);
        res
            .status(500)
            .json({ message: "Server error during package creation." });
    }
};

// Update package (Admin only)
const updatePackage = async (req, res) => {
    try {
        // Validate tour type if provided
        if (req.body.tourType) {
            const validTourTypes = ["international", "india"];
            if (!validTourTypes.includes(req.body.tourType)) {
                return res.status(400).json({
                    message: "Invalid tour type. Must be one of: international, india",
                });
            }
        }

        // Generate slug from custom slug or name if being updated
        if (req.body.slug !== undefined || req.body.name) {
            let baseSlug;
            if (req.body.slug !== undefined) {
                // If slug is explicitly provided (even if empty), use it or generate from name
                if (req.body.slug.trim()) {
                    baseSlug = generateSlug(req.body.slug);
                } else if (req.body.name) {
                    baseSlug = generateSlug(req.body.name);
                } else {
                    // If slug is empty and no name provided, get existing package name
                    const existingPkg = await AllPackage.findById(req.params.id);
                    if (existingPkg) {
                        baseSlug = generateSlug(existingPkg.name);
                    }
                }
            } else if (req.body.name) {
                // Only name is being updated, generate slug from new name
                baseSlug = generateSlug(req.body.name);
            }

            if (baseSlug) {
                req.body.slug = await ensureUniqueSlug(baseSlug, req.params.id);
            }
        }

        // If image file is uploaded, upload to Cloudinary and delete old image
        if (req.file) {

            // Get the old image public_id for cleanup
            const existingPkg = await AllPackage.findById(req.params.id);
            const oldPublicId = existingPkg?.image ? extractPublicId(existingPkg.image) : null;

            const cloudinaryResult = await uploadToCloudinary(
                req.file.path,
                'packages',
                null,
                oldPublicId // This will delete the old image
            );
            req.body.image = cloudinaryResult.url;
        }

        // Parse JSON fields if they come as strings
        if (typeof req.body.itinerary === 'string') {
            try {
                req.body.itinerary = JSON.parse(req.body.itinerary);
            } catch (e) {
                console.error("Failed to parse itinerary JSON", e);
            }
        }

        if (typeof req.body.tags === 'string' && req.body.tags.startsWith('[')) {
            try {
                req.body.tags = JSON.parse(req.body.tags);
            } catch (e) {
                console.error("Failed to parse tags JSON", e);
            }
        }

        parseListFields(req.body);
        const pkg = await AllPackage.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!pkg) {
            return res.status(404).json({ message: "Package not found." });
        }

        // Transform image URL
        const transformedPackage = transformPackageImageUrl(pkg.toObject());

        res.json({
            message: "Package updated successfully",
            package: transformedPackage,
        });
    } catch (error) {
        console.error("Update package error:", error);
        res
            .status(500)
            .json({ message: "Server error during package update." });
    }
};

// Delete package (Admin only)
const deletePackage = async (req, res) => {
    try {
        const pkg = await AllPackage.findByIdAndDelete(req.params.id);

        if (!pkg) {
            return res.status(404).json({ message: "Package not found." });
        }

        // Delete image from Cloudinary if it exists
        if (pkg.image) {
            const publicId = extractPublicId(pkg.image);
            if (publicId) {
                try {
                    await deleteFromCloudinary(publicId);
                } catch (deleteError) {
                    console.error('Failed to delete image from Cloudinary:', deleteError.message);
                    // Don't fail the request if image deletion fails
                }
            }
        }

        res.json({ message: "Package deleted successfully" });
    } catch (error) {
        console.error("Delete package error:", error);
        res
            .status(500)
            .json({ message: "Server error during package deletion." });
    }
};

const exportPackages = async (req, res) => {
    try {
        const { scope, packageIds } = req.body || {};

        if (!["all", "ids"].includes(scope)) {
            return res.status(400).json({
                message: "Invalid scope. Allowed values: all, ids",
            });
        }

        let query = {};

        if (scope === "ids") {
            if (!Array.isArray(packageIds) || packageIds.length === 0) {
                return res.status(400).json({
                    message: "packageIds is required and must be a non-empty array when scope is 'ids'",
                });
            }

            const invalidIds = packageIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
            if (invalidIds.length > 0) {
                return res.status(400).json({
                    message: "packageIds contains invalid ObjectId values",
                });
            }

            const uniqueIds = [...new Set(packageIds)];
            query = { _id: { $in: uniqueIds } };
        }

        const packages = await AllPackage.find(query)
            .populate("tags", "name slug")
            .populate("holidayType", "title slug")
            .sort({ createdAt: -1 });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Paradise Yatra";
        workbook.created = new Date();

        const packagesSheet = workbook.addWorksheet("Packages");
        const tagsSheet = workbook.addWorksheet("Tags");
        const highlightsSheet = workbook.addWorksheet("Highlights");
        const inclusionsSheet = workbook.addWorksheet("Inclusions");
        const exclusionsSheet = workbook.addWorksheet("Exclusions");
        const itinerarySheet = workbook.addWorksheet("Itinerary");
        const rawSheet = workbook.addWorksheet("Raw_JSON");

        packagesSheet.columns = [
            { header: "package_id", key: "package_id", width: 26 },
            { header: "name", key: "name", width: 30 },
            { header: "slug", key: "slug", width: 32 },
            { header: "location", key: "location", width: 24 },
            { header: "country", key: "country", width: 20 },
            { header: "state", key: "state", width: 20 },
            { header: "tour_type", key: "tour_type", width: 14 },
            { header: "holiday_type_id", key: "holiday_type_id", width: 26 },
            { header: "holiday_type_title", key: "holiday_type_title", width: 24 },
            { header: "price_type", key: "price_type", width: 14 },
            { header: "price", key: "price", width: 14 },
            { header: "original_price", key: "original_price", width: 14 },
            { header: "discount", key: "discount", width: 12 },
            { header: "duration", key: "duration", width: 14 },
            { header: "is_active", key: "is_active", width: 12 },
            { header: "visit_count", key: "visit_count", width: 12 },
            { header: "image_url", key: "image_url", width: 44 },
            { header: "created_at", key: "created_at", width: 24 },
            { header: "updated_at", key: "updated_at", width: 24 },
            { header: "short_description_html", key: "short_description_html", width: 50 },
            { header: "short_description_text", key: "short_description_text", width: 50 },
            { header: "description_html", key: "description_html", width: 60 },
            { header: "description_text", key: "description_text", width: 60 },
            { header: "tags_count", key: "tags_count", width: 12 },
            { header: "highlights_count", key: "highlights_count", width: 15 },
            { header: "inclusions_count", key: "inclusions_count", width: 15 },
            { header: "exclusions_count", key: "exclusions_count", width: 15 },
            { header: "itinerary_days_count", key: "itinerary_days_count", width: 18 },
            { header: "tag_ids_csv", key: "tag_ids_csv", width: 44 },
            { header: "tag_names_csv", key: "tag_names_csv", width: 44 },
        ];

        tagsSheet.columns = [
            { header: "package_id", key: "package_id", width: 26 },
            { header: "package_name", key: "package_name", width: 30 },
            { header: "tag_id", key: "tag_id", width: 26 },
            { header: "tag_name", key: "tag_name", width: 24 },
            { header: "tag_slug", key: "tag_slug", width: 24 },
        ];

        highlightsSheet.columns = [
            { header: "package_id", key: "package_id", width: 26 },
            { header: "package_name", key: "package_name", width: 30 },
            { header: "index", key: "index", width: 12 },
            { header: "highlight", key: "highlight", width: 70 },
        ];

        inclusionsSheet.columns = [
            { header: "package_id", key: "package_id", width: 26 },
            { header: "package_name", key: "package_name", width: 30 },
            { header: "index", key: "index", width: 12 },
            { header: "inclusion", key: "inclusion", width: 70 },
        ];

        exclusionsSheet.columns = [
            { header: "package_id", key: "package_id", width: 26 },
            { header: "package_name", key: "package_name", width: 30 },
            { header: "index", key: "index", width: 12 },
            { header: "exclusion", key: "exclusion", width: 70 },
        ];

        itinerarySheet.columns = [
            { header: "package_id", key: "package_id", width: 26 },
            { header: "package_name", key: "package_name", width: 30 },
            { header: "day", key: "day", width: 10 },
            { header: "title", key: "title", width: 30 },
            { header: "activities_csv", key: "activities_csv", width: 44 },
            { header: "activities_json", key: "activities_json", width: 56 },
            { header: "accommodation", key: "accommodation", width: 24 },
            { header: "meals", key: "meals", width: 20 },
            { header: "image", key: "image", width: 44 },
        ];

        rawSheet.columns = [
            { header: "package_id", key: "package_id", width: 26 },
            { header: "raw_json", key: "raw_json", width: 120 },
        ];

        packages.forEach((pkgDoc) => {
            const pkg = pkgDoc.toObject({ virtuals: false });
            const packageId = String(pkg._id);

            const tagMeta = (Array.isArray(pkg.tags) ? pkg.tags : [])
                .map(normalizeTag)
                .filter((tag) => tag && tag.id);

            const highlights = Array.isArray(pkg.highlights) ? pkg.highlights : [];
            const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions : [];
            const exclusions = Array.isArray(pkg.exclusions) ? pkg.exclusions : [];
            const itinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];

            const holidayTypeId =
                pkg.holidayType && typeof pkg.holidayType === "object" && pkg.holidayType._id
                    ? String(pkg.holidayType._id)
                    : pkg.holidayType
                        ? String(pkg.holidayType)
                        : "";
            const holidayTypeTitle =
                pkg.holidayType && typeof pkg.holidayType === "object" && pkg.holidayType.title
                    ? pkg.holidayType.title
                    : "";

            const shortDescriptionHtml = pkg.shortDescription || "";
            const descriptionHtml = pkg.description || "";

            packagesSheet.addRow({
                package_id: packageId,
                name: pkg.name || "",
                slug: pkg.slug || "",
                location: pkg.location || "",
                country: pkg.country || "",
                state: pkg.state || "",
                tour_type: pkg.tourType || "",
                holiday_type_id: holidayTypeId,
                holiday_type_title: holidayTypeTitle,
                price_type: pkg.priceType || "per_person",
                price: pkg.price ?? "",
                original_price: pkg.originalPrice ?? "",
                discount: pkg.discount ?? "",
                duration: pkg.duration || "",
                is_active: Boolean(pkg.isActive),
                visit_count: pkg.visitCount ?? 0,
                image_url: processSingleImage(pkg.image || ""),
                created_at: pkg.createdAt ? new Date(pkg.createdAt).toISOString() : "",
                updated_at: pkg.updatedAt ? new Date(pkg.updatedAt).toISOString() : "",
                short_description_html: shortDescriptionHtml,
                short_description_text: stripHtmlToText(shortDescriptionHtml),
                description_html: descriptionHtml,
                description_text: stripHtmlToText(descriptionHtml),
                tags_count: tagMeta.length,
                highlights_count: highlights.length,
                inclusions_count: inclusions.length,
                exclusions_count: exclusions.length,
                itinerary_days_count: itinerary.length,
                tag_ids_csv: toCsv(tagMeta.map((tag) => tag.id)),
                tag_names_csv: toCsv(tagMeta.map((tag) => tag.name)),
            });

            tagMeta.forEach((tag) => {
                tagsSheet.addRow({
                    package_id: packageId,
                    package_name: pkg.name || "",
                    tag_id: tag.id,
                    tag_name: tag.name || "",
                    tag_slug: tag.slug || "",
                });
            });

            highlights.forEach((item, index) => {
                highlightsSheet.addRow({
                    package_id: packageId,
                    package_name: pkg.name || "",
                    index: index + 1,
                    highlight: item || "",
                });
            });

            inclusions.forEach((item, index) => {
                inclusionsSheet.addRow({
                    package_id: packageId,
                    package_name: pkg.name || "",
                    index: index + 1,
                    inclusion: item || "",
                });
            });

            exclusions.forEach((item, index) => {
                exclusionsSheet.addRow({
                    package_id: packageId,
                    package_name: pkg.name || "",
                    index: index + 1,
                    exclusion: item || "",
                });
            });

            itinerary.forEach((dayEntry) => {
                const activities = Array.isArray(dayEntry.activities) ? dayEntry.activities : [];
                itinerarySheet.addRow({
                    package_id: packageId,
                    package_name: pkg.name || "",
                    day: dayEntry.day ?? "",
                    title: dayEntry.title || "",
                    activities_csv: toCsv(activities),
                    activities_json: JSON.stringify(activities),
                    accommodation: dayEntry.accommodation || "",
                    meals: dayEntry.meals || "",
                    image: dayEntry.image || "",
                });
            });

            rawSheet.addRow({
                package_id: packageId,
                raw_json: JSON.stringify(pkg),
            });
        });

        const filename = buildExportFilename("packages-export");
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Cache-Control", "no-store");

        return res.status(200).send(Buffer.from(buffer));
    } catch (error) {
        console.error("Export packages error:", error);
        return res.status(500).json({ message: "Failed to export packages." });
    }
};

module.exports = {
    getAllPackages,
    getPackage,
    createPackage,
    updatePackage,
    deletePackage,
    exportPackages
};
