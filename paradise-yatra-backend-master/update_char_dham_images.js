const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FixedDeparture = require('./src/models/FixedDeparture');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paradise-yatra', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('Connected to MongoDB');
    const result = await FixedDeparture.updateMany(
        { title: { $regex: /Char Dham/i } },
        { $set: { images: ["/char_dham_collage.png"] } }
    );
    console.log('Modified', result.modifiedCount, 'documents.');
    mongoose.disconnect();
})
.catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
});
