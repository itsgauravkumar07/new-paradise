// Sample "Past Group Trips" for previewing the section design.
// Every record is clearly labelled "[Sample]" and uses placeholder reviewer names, because they are
// NOT real customer reviews. Replace them with real trips (or delete them) before going live.
//
//   node src/scripts/seedPastTrips.js            add the sample trips (skips any that already exist)
//   node src/scripts/seedPastTrips.js --hidden   add them hidden (visible in the admin only)
//   node src/scripts/seedPastTrips.js --remove   delete every "[Sample]" trip

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const FDExperience = require('../models/FDExperience');
const FixedDeparture = require('../models/FixedDeparture');

const PREFIX = '[Sample] ';

const samples = [
  {
    title: 'Manali Group Tour – Winter Batch',
    destination: 'Manali',
    departureTitle: /manali/i,
    tripDate: 'January 2026',
    duration: '3N/4D',
    groupSize: 16,
    coverImage: '/Destination%20Pages/Himachal%20Pradesh.webp',
    gallery: ['/images/himalaya-trek.png', '/images/fixed-departure-hero.png', '/Destination%20Pages/Ladakh.webp'],
    story:
      'SAMPLE CONTENT – replace with the real story of this batch.\n\nThis is where you describe how the trip went: the drive into the valley, the snow day at Solang, evenings at the bonfire, and how the group got along.',
    highlights: ['Snow day at Solang Valley', 'Old Manali café walk', 'Hadimba Temple visit', 'Bonfire night'],
    reviews: [
      { name: 'Sample Reviewer 1', location: 'Delhi', rating: 5, text: 'Sample review text. Replace this with what a real traveller from this group said about the trip.' },
      { name: 'Sample Reviewer 2', location: 'Dehradun', rating: 5, text: 'Sample review text. A second traveller’s feedback goes here.' },
      { name: 'Sample Reviewer 3', location: 'Chandigarh', rating: 4, text: 'Sample review text. Shorter or longer reviews both display well.' },
    ],
    order: 1,
  },
  {
    title: 'Kedarnath Yatra – May Batch',
    destination: 'Kedarnath',
    departureTitle: /kedarnath/i,
    tripDate: 'May 2026',
    duration: '3N/4D',
    groupSize: 22,
    coverImage: '/Destination%20Pages/Char%20Dham.webp',
    gallery: ['/images/char_dham_collage.png', '/Destination%20Pages/Uttarakhand.webp'],
    story:
      'SAMPLE CONTENT – replace with the real story of this batch.\n\nDescribe the trek from Gaurikund, the darshan, the stay arrangements and how the team looked after the group.',
    highlights: ['Kedarnath darshan', 'Trek from Gaurikund', 'Evening aarti'],
    reviews: [
      { name: 'Sample Reviewer 4', location: 'Mumbai', rating: 5, text: 'Sample review text. Replace this with a real review from the Kedarnath group.' },
      { name: 'Sample Reviewer 5', location: 'Jaipur', rating: 5, text: 'Sample review text. Another traveller’s feedback goes here.' },
    ],
    order: 2,
  },
  {
    title: 'Kartik Swami Temple Trek – Weekend Batch',
    destination: 'Kanakchauri, Rudraprayag',
    departureTitle: /kartik/i,
    tripDate: 'March 2026',
    duration: '1N/2D',
    groupSize: 12,
    coverImage: '/Destination%20Pages/Uttarakhand.webp',
    gallery: ['/images/himalaya-trek.png'],
    story:
      'SAMPLE CONTENT – replace with the real story of this batch.\n\nA short weekend trek: the sunrise view of the Himalayan peaks from the temple and the village stay.',
    highlights: ['Sunrise over Himalayan peaks', 'Village homestay'],
    reviews: [
      { name: 'Sample Reviewer 6', location: 'Haridwar', rating: 5, text: 'Sample review text. Replace this with a real review from the weekend group.' },
    ],
    order: 3,
  },
];

async function run() {
  const remove = process.argv.includes('--remove');
  const hidden = process.argv.includes('--hidden');

  await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
  console.log(`Connected to database "${mongoose.connection.name}"`);

  if (remove) {
    const result = await FDExperience.deleteMany({ title: { $regex: '^\\[Sample\\] ' } });
    console.log(`Removed ${result.deletedCount} sample trip(s).`);
    return;
  }

  for (const sample of samples) {
    const { departureTitle, ...data } = sample;
    const title = PREFIX + data.title;
    if (await FDExperience.exists({ title })) {
      console.log(`- skipped (already exists): ${title}`);
      continue;
    }
    const departure = await FixedDeparture.findOne({ title: departureTitle }).select('_id').lean();
    await FDExperience.create({ ...data, title, fixedDeparture: departure?._id || null, isActive: !hidden });
    console.log(`+ added${hidden ? ' (hidden)' : ''}: ${title}`);
  }
}

run()
  .catch((error) => {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
