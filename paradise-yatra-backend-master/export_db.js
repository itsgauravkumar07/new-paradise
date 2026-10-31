const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function exportData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');

    const modelsPath = path.join(__dirname, 'models');
    const modelFiles = fs.readdirSync(modelsPath).filter(file => file.endsWith('.js'));
    
    const allData = {};

    for (const file of modelFiles) {
      const modelName = file.replace('.js', '');
      const Model = require(path.join(modelsPath, file));
      
      if (Model && Model.find) {
        console.log(`Exporting ${modelName}...`);
        const data = await Model.find({});
        allData[modelName] = data;
      } else {
        console.log(`Skipping ${modelName} as it does not export a Mongoose model`);
      }
    }

    const outputPath = path.join(__dirname, 'website_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
    console.log(`Successfully exported data to ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Error exporting data:', error);
    process.exit(1);
  }
}

exportData();
