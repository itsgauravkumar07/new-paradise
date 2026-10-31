const mongoose = require('mongoose');

const updateImages = async () => {
  try {
    await mongoose.connect('mongodb+srv://dikshusharma11:Fluzion11@cluster0.w6ybkdx.mongodb.net/paradise-yatra?appName=Cluster0');
    const db = mongoose.connection.db;
    
    await db.collection('tags').updateOne({ slug: 'winter' }, { $set: { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80' } });
    await db.collection('tags').updateOne({ slug: 'summer' }, { $set: { image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' } });
    await db.collection('tags').updateOne({ slug: 'monsoon-magic' }, { $set: { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' } });
    await db.collection('tags').updateOne({ slug: 'spring-blossoms' }, { $set: { image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' } });
    
    console.log('Valid Unsplash images updated successfully');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

updateImages();
