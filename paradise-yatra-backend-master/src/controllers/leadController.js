const Lead = require('../models/Lead');

// Only a path on our own site ("/package/india/kerala"); anything else is dropped so the admin never links off-site
const toSitePath = (value) =>
    typeof value === 'string' && /^\/(?!\/)[\w\-./%]*$/.test(value.trim()) ? value.trim().slice(0, 300) : '';

// --- spam guard: max 5 enquiries per visitor (IP) per hour; same in-memory pattern as hotel enquiries ---
const LEAD_WINDOW_MS = 60 * 60 * 1000;
const MAX_LEADS_PER_WINDOW = 5;
const leadHits = new Map();
const tooManyLeads = (ip) => {
    const now = Date.now();
    const recent = (leadHits.get(ip) || []).filter((t) => now - t < LEAD_WINDOW_MS);
    if (recent.length >= MAX_LEADS_PER_WINDOW) {
        leadHits.set(ip, recent);
        return true;
    }
    recent.push(now);
    leadHits.set(ip, recent);
    return false;
};
setInterval(() => {
    const now = Date.now();
    for (const [ip, list] of leadHits) {
        const recent = list.filter((t) => now - t < LEAD_WINDOW_MS);
        recent.length ? leadHits.set(ip, recent) : leadHits.delete(ip);
    }
}, LEAD_WINDOW_MS).unref();

// The same enquiry sent again within this time (double tap, page reload) is not saved twice
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

// Create new lead
const createLead = async (req, res) => {
    try {
        // The website's API route forwards the visitor's IP; without it every lead would share one limit
        const clientIp = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;

        // Same person = same phone, or the same email when they only shared an email
        const phoneForCheck = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
        const emailForCheck = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        if (phoneForCheck || emailForCheck) {
            const existing = await Lead.findOne({
                ...(phoneForCheck ? { phone: phoneForCheck } : { email: emailForCheck }),
                packageTitle: req.body.packageTitle || { $in: [null, undefined, ''] },
                destination: req.body.destination || { $in: [null, undefined, ''] },
                createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
            }).lean();
            if (existing) {
                return res.status(200).json({
                    success: true,
                    duplicate: true,
                    message: 'This enquiry was already received',
                    data: existing
                });
            }
        }

        if (tooManyLeads(clientIp)) {
            return res.status(429).json({
                success: false,
                message: 'Too many enquiries. Please try again later or contact us on WhatsApp.'
            });
        }

        const {
            fullName,
            email,
            phone,
            destination,
            budget,
            message,
            departureDate,
            packageTitle,
            packagePrice,
            newsletterConsent,
            source,
            destinationUrl,
            timestamp
        } = req.body;

        const newLead = new Lead({
            fullName,
            email,
            phone,
            destination,
            budget,
            message,
            departureDate,
            packageTitle,
            packagePrice,
            newsletterConsent,
            destinationUrl: toSitePath(destinationUrl),
            source: typeof source === 'string' && source.trim() ? source.trim().slice(0, 40) : undefined,
            timestamp: timestamp || new Date()
        });

        await newLead.save();

        res.status(201).json({
            success: true,
            message: 'Lead saved successfully',
            data: newLead
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save lead',
            error: error.message
        });
    }
};

// Get all leads (for admin)
const getAllLeads = async (req, res) => {
    try {
        // Chatbot enquiries have their own admin section (Chatbot Enquiries), so the Queries list leaves them out
        const leads = await Lead.find({ source: { $ne: 'chatbot' } }).sort({ timestamp: -1 });
        res.status(200).json({
            success: true,
            data: leads
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leads',
            error: error.message
        });
    }
};

// Update lead status
const updateLeadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const lead = await Lead.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lead status updated successfully',
            data: lead
        });
    } catch (error) {
        console.error('Error updating lead status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update lead status',
            error: error.message
        });
    }
};

// Update lead follow-up date
const updateFollowUpDate = async (req, res) => {
    try {
        const { id } = req.params;
        const { followUpDate } = req.body;

        const lead = await Lead.findByIdAndUpdate(
            id,
            { followUpDate: followUpDate ? new Date(followUpDate) : null },
            { new: true, runValidators: true }
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Follow-up date updated successfully',
            data: lead
        });
    } catch (error) {
        console.error('Error updating follow-up date:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update follow-up date',
            error: error.message
        });
    }
};

// Delete lead
const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await Lead.findByIdAndDelete(id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lead deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete lead',
            error: error.message
        });
    }
};

module.exports = {
    createLead,
    getAllLeads,
    updateLeadStatus,
    updateFollowUpDate,
    deleteLead
};
