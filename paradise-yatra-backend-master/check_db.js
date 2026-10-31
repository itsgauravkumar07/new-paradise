const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FixedDeparture = require('./src/models/FixedDeparture');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradise-yatra', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    const doc = await FixedDeparture.findOne({ slug: 'char-dham-yatra-haridwar' });
    console.log('Document images:', doc.images);
    console.log('Document title:', doc.title);
    mongoose.disconnect();
})
.catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
});
