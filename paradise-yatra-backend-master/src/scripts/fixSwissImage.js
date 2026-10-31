require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const AllPackage = require("../models/AllPackage");

const runUpdate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // The image 1528901166007-3784c7dd3653 is an office. We need a romantic Swiss Alps photo.
    const romanticSwissImage = "https://images.unsplash.com/photo-1528901166007-3784c7dd3653"; // Wait, that's the WRONG one!
    const correctSwissImage = "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80"; // A Swiss alps mountain landscape

    await AllPackage.updateOne(
        { slug: "swiss-romance" },
        { $set: { image: correctSwissImage } }
    );
    
    console.log("Updated Swiss Romance image");
    process.exit(0);
  } catch (error) {
    console.error("Error", error);
    process.exit(1);
  }
};

runUpdate();
