const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB for import');

    const inputPath = path.join(__dirname, 'website_data.json');
    if (!fs.existsSync(inputPath)) {
      console.error('website_data.json not found!');
      process.exit(1);
    }

    const allData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    const modelsPath = path.join(__dirname, 'src/models');
    
    // First try the src/models directory, if not try models/
    let actualModelsPath = fs.existsSync(modelsPath) ? modelsPath : path.join(__dirname, 'models');
    
    const modelFiles = fs.readdirSync(actualModelsPath).filter(file => file.endsWith('.js'));

    for (const file of modelFiles) {
      const modelName = file.replace('.js', '');
      const Model = require(path.join(actualModelsPath, file));
      
      if (Model && Model.insertMany && allData[modelName] && allData[modelName].length > 0) {
        console.log(`Importing ${modelName}... (${allData[modelName].length} records)`);
        await Model.deleteMany({}); // Clear existing data to prevent duplicates
        await Model.insertMany(allData[modelName]);
        console.log(`Successfully imported ${modelName}`);
      } else {
        console.log(`Skipping ${modelName} - either no data or not a valid Mongoose model`);
      }
    }

    console.log(`Finished importing all data!`);
    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importData();
