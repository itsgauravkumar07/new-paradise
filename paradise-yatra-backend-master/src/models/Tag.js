const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tag name is required"],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        packages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "AllPackage",
            },
        ],
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag",
            default: null,
        },
        image: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create slug from name before saving
tagSchema.pre("validate", function (next) {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w ]+/g, "")
            .replace(/ +/g, "-");
    }
    next();
});

module.exports = mongoose.model("Tag", tagSchema);
