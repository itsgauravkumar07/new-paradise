require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const AllPackage = require("../models/AllPackage");

const runUpdate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Varanasi - Ganges / Boat / Ghats
    await AllPackage.findOneAndUpdate(
        { slug: "varanasi-spiritual-tour" },
        { image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80" } 
    );

    // Char Dham - majestic mountains / Himalayas
    await AllPackage.findOneAndUpdate(
        { slug: "char-dham-yatra" },
        { image: "https://images.unsplash.com/photo-1626083543160-5755106a77e5?w=800&q=80" } 
    );

    // Tirupati - magnificent temple
    await AllPackage.findOneAndUpdate(
        { slug: "tirupati-darshan" },
        { image: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=800&q=80" } 
    );

    console.log("Images updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed", error);
    process.exit(1);
  }
};
runUpdate();
