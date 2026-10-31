const User = require('../models/User');
const Signup = require('../models/Signup');
const mongoose = require('mongoose');
const AllPackage = require('../models/AllPackage');
const FixedDeparture = require('../models/FixedDeparture');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If populate query param is present, return full package details
        if (req.query.populate === 'true') {
            try {
                const wishlistIds = user.wishlist || [];

                if (wishlistIds.length === 0) {
                    return res.status(200).json({ wishlist: [], count: 0 });
                }

                console.log(`Populating wishlist for ${user.email}, IDs:`, wishlistIds);

                // Fetch from both collections in parallel
                const [allPackages, fixedDepartures] = await Promise.all([
                    AllPackage.find({ _id: { $in: wishlistIds } }).lean(),
                    FixedDeparture.find({ _id: { $in: wishlistIds } }).lean()
                ]);

                console.log(`Found ${allPackages.length} packages and ${fixedDepartures.length} fixed departures`);

                // Map AllPackage items
                const packageItems = allPackages.map(pkg => ({
                    _id: pkg._id,
                    title: pkg.name || pkg.title || 'Untitled Package',
                    destination: pkg.location || pkg.destination || pkg.state || 'India',
                    duration: pkg.duration || 'N/A',
                    price: pkg.price || 0,
                    images: pkg.image ? [pkg.image] : [],
                    image: pkg.image || '',
                    slug: pkg.slug || pkg._id.toString(),
                    type: 'package'
                }));

                // Map FixedDeparture items
                const fdItems = fixedDepartures.map(fd => ({
                    _id: fd._id,
                    title: fd.title || 'Untitled Departure',
                    destination: fd.destination || fd.state || 'India',
                    duration: fd.duration || 'N/A',
                    price: fd.price || 0,
                    images: fd.images || [],
                    image: (fd.images && fd.images.length > 0) ? fd.images[0] : '',
                    slug: fd.slug || fd._id.toString(),
                    type: 'fixed-departure'
                }));

                // Combine and maintain original wishlist order
                const allItems = [...packageItems, ...fdItems];
                const itemMap = new Map(allItems.map(item => [item._id.toString(), item]));

                // Return in the same order as the user's wishlist
                const orderedWishlist = wishlistIds
                    .map(id => itemMap.get(id.toString()))
                    .filter(item => item !== undefined && item !== null);

                return res.status(200).json({
                    wishlist: orderedWishlist,
                    count: orderedWishlist.length
                });

            } catch (err) {
                console.error("Error populating wishlist:", err);
                return res.status(200).json({ wishlist: [], count: 0, error: "Population failed" });
            }
        }

        res.status(200).json({ wishlist: user.wishlist || [] });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle item in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res) => {
    try {
        const { packageId } = req.body;
        const user = req.user;

        if (!packageId) {
            return res.status(400).json({ message: 'Package ID is required' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Toggling wishlist for user: ${user.email}, Package: ${packageId}`);

        // Initialize wishlist if it doesn't exist
        if (!user.wishlist) {
            user.wishlist = [];
        }

        // Convert both to strings for reliable comparison
        const targetId = packageId.toString();
        const wishlistStrings = user.wishlist.map(id => id.toString());

        const index = wishlistStrings.indexOf(targetId);

        if (index > -1) {
            // Remove from wishlist
            user.wishlist.splice(index, 1);
            console.log(`✅ DISPATCH: Removing package ${targetId} from wishlist of ${user.email}`);
        } else {
            // Add to wishlist
            user.wishlist.push(new mongoose.Types.ObjectId(targetId));
            console.log(`✅ DISPATCH: Adding package ${targetId} to wishlist of ${user.email}`);
        }

        // CRITICAL: Explicitly tell Mongoose the wishlist array has changed
        user.markModified('wishlist');

        const savedUser = await user.save();
        console.log(`✅ SUCCESS: Wishlist updated. New count: ${savedUser.wishlist.length}`);

        res.status(200).json({
            success: true,
            message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist',
            wishlist: savedUser.wishlist
        });
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
