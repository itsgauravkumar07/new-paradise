const mongoose = require('mongoose');
const DestinationFAQ = require('./models/DestinationFAQ');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const data = await DestinationFAQ.findOne({ destination: 'andaman and nicobar islands' });
        console.log('---BEG---');
        console.log(JSON.stringify(data));
        console.log('---END---');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
