const Tag = require("../models/Tag");
const Package = require("../models/Package");
const AllPackage = require("../models/AllPackage");

// Get all tags
exports.getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find()
            .populate("parent", "name slug")
            .populate("packages", "image title name");
        res.status(200).json({
            success: true,
            count: tags.length,
            data: tags,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// Get single tag
exports.getTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id)
            .populate("packages", "image title name location country state price duration")
            .populate("parent", "name slug");
        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found",
            });
        }
        res.status(200).json({
            success: true,
            data: tag,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// Get single tag by slug
exports.getTagBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const tag = await Tag.findOne({ slug }).populate({
            path: 'packages',
            model: 'AllPackage' // Specifically populate from AllPackage
        });

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found",
            });
        }
        res.status(200).json({
            success: true,
            data: tag,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// Create tag
exports.createTag = async (req, res) => {
    try {
        const tagData = { ...req.body };
        if (tagData.parent === "") {
            tagData.parent = null;
        }

        const tag = await Tag.create(tagData);

        // If packages are linked during creation, update those packages too
        if (tag.packages && tag.packages.length > 0) {
            await AllPackage.updateMany(
                { _id: { $in: tag.packages } },
                { $addToSet: { tags: tag._id } }
            );
            await Package.updateMany(
                { _id: { $in: tag.packages } },
                { $addToSet: { tags: tag._id } }
            );
        }

        res.status(201).json({
            success: true,
            data: tag,
        });
    } catch (error) {
        console.error("Create Tag Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Tag with this name or slug already exists",
            });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// Update tag
exports.updateTag = async (req, res) => {
    try {
        let tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found",
            });
        }

        const updateData = { ...req.body };
        if (updateData.parent === "") {
            updateData.parent = null;
        }

        // Get old packages to handle removal/addition
        const oldPackages = tag.packages.map(p => p.toString());
        const newPackages = updateData.packages || [];

        tag = await Tag.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        // Update package associations if packages changed
        if (updateData.packages) {
            // Remove tag from packages that are no longer linked
            const removedPackages = oldPackages.filter(p => !newPackages.includes(p));
            if (removedPackages.length > 0) {
                await AllPackage.updateMany(
                    { _id: { $in: removedPackages } },
                    { $pull: { tags: tag._id } }
                );
                await Package.updateMany(
                    { _id: { $in: removedPackages } },
                    { $pull: { tags: tag._id } }
                );
            }

            // Add tag to packages that are newly linked
            const addedPackages = newPackages.filter(p => !oldPackages.includes(p));
            if (addedPackages.length > 0) {
                await AllPackage.updateMany(
                    { _id: { $in: addedPackages } },
                    { $addToSet: { tags: tag._id } }
                );
                await Package.updateMany(
                    { _id: { $in: addedPackages } },
                    { $addToSet: { tags: tag._id } }
                );
            }
        }

        res.status(200).json({
            success: true,
            data: tag,
        });
    } catch (error) {
        console.error("Update Tag Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Tag with this name or slug already exists",
            });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// Delete tag
exports.deleteTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found",
            });
        }

        await Package.updateMany(
            { tags: tag._id },
            { $pull: { tags: tag._id } }
        );

        // Remove this tag from all-packages
        await AllPackage.updateMany(
            { tags: tag._id },
            { $pull: { tags: tag._id } }
        );

        await tag.deleteOne();

        res.status(200).json({
            success: true,
            message: "Tag deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// Add packages to tag
exports.addPackagesToTag = async (req, res) => {
    try {
        const { packageIds } = req.body; // Array of package IDs
        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found",
            });
        }

        // Update tag's packages array
        tag.packages = [...new Set([...tag.packages.map(p => p.toString()), ...packageIds])];
        await tag.save();

        // Update each package's tags array
        await Package.updateMany(
            { _id: { $in: packageIds } },
            { $addToSet: { tags: tag._id } }
        );

        // Update each all-package's tags array
        await AllPackage.updateMany(
            { _id: { $in: packageIds } },
            { $addToSet: { tags: tag._id } }
        );

        res.status(200).json({
            success: true,
            data: tag,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

// Remove packages from tag
exports.removePackagesFromTag = async (req, res) => {
    try {
        const { packageIds } = req.body;
        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found",
            });
        }

        tag.packages = tag.packages.filter(p => !packageIds.includes(p.toString()));
        await tag.save();

        await Package.updateMany(
            { _id: { $in: packageIds } },
            { $pull: { tags: tag._id } }
        );

        await AllPackage.updateMany(
            { _id: { $in: packageIds } },
            { $pull: { tags: tag._id } }
        );

        res.status(200).json({
            success: true,
            data: tag,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};
