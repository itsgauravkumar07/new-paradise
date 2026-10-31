const mongoose = require('mongoose');

const uri = 'mongodb://dikshusharma11:Fluzion11@ac-8ytuxkq-shard-00-00.w6ybkdx.mongodb.net:27017,ac-8ytuxkq-shard-00-01.w6ybkdx.mongodb.net:27017,ac-8ytuxkq-shard-00-02.w6ybkdx.mongodb.net:27017/paradise-yatra?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
