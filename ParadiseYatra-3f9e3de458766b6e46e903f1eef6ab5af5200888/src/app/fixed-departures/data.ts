export interface ItineraryItem {
    day: number;
    title: string;
    description: string;
    meals?: string;
    hotel?: string;
    distance?: string;
}

export interface Departure {
    _id: string;
    title: string;
    slug: string;
    subtitle?: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    duration: string;
    price: number;
    originalPrice?: number | null;
    availableSeats: number;
    totalSeats: number;
    image: string;
    tag: string;
    typeColor?: string;
    rating?: number;
    reviews?: number;
    location?: string;
    transport?: string;
    hotel?: string;
    meals?: string;
    nextDeparture?: string;
    shortDescription: string;
    longDescription: string;
    highlights: string[];
    suitableFor: string[];
    notSuitableFor: string[];
    itinerary: ItineraryItem[];
    inclusions: string[];
    exclusions: string[];
    hotels?: string[];
    paymentPolicy?: string[];
    cancellationPolicy?: string[];
    departures?: { date: string; price: number; seats: number; status: string }[];
}

export const dummyFixedDepartures: Departure[] = [
    {
        _id: "1",
        title: "Char Dham Yatra Ex Haridwar",
        subtitle: "A Complete Pilgrimage to Yamunotri, Gangotri, Kedarnath and Badrinath",
        slug: "char-dham-yatra-haridwar",
        destination: "Uttarakhand",
        image: "https://images.unsplash.com/photo-1612438214708-f428a707dd4e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        price: 23000,
        originalPrice: null,
        duration: "9N/10D",
        departureDate: "2026-05-15",
        returnDate: "2026-05-24",
        tag: "Spiritual Tour",
        location: "Uttarakhand Himalayas",
        nextDeparture: "15 May 2026",
        availableSeats: 8,
        totalSeats: 20,

        shortDescription:
            "A spiritually fulfilling Char Dham Yatra starting from Haridwar, covering all four sacred shrines with comfortable transport, meals and accommodation.",

        longDescription:
            "This Char Dham Yatra from Haridwar is designed for devotees who wish to visit Yamunotri, Gangotri, Kedarnath and Badrinath in a planned and affordable manner. The journey takes you through the scenic Himalayan landscapes of Uttarakhand while ensuring proper rest, temple visits and essential facilities. The tour includes accommodation, daily meals and transfers, making it suitable for families, groups and first-time Char Dham travellers.",

        highlights: [
            "Visit all four sacred dhams in one journey",
            "Well-planned itinerary with temple darshan",
            "Comfortable stays in economy and deluxe hotels",
            "Daily breakfast and dinner included",
            "Scenic Himalayan routes and holy river confluences",
            "Stops at Mussoorie, Rishikesh and Mana Village"
        ],

        suitableFor: [
            "Devotees seeking a complete Char Dham pilgrimage",
            "Families travelling together for religious purposes",
            "First-time Char Dham visitors",
            "Group travellers on a budget",
            "Pilgrims comfortable with long travel hours",
            "People capable of completing the Kedarnath trek or using horse or helicopter services"
        ],

        notSuitableFor: [
            "People with serious heart or breathing problems",
            "Travellers expecting luxury or premium hotels",
            "Those unable to walk or trek at high altitude",
            "People sensitive to cold weather",
            "Travellers requiring five-star facilities"
        ],

        departures: [
            { date: "15 May 2026", price: 23000, seats: 8, status: "limited" },
            { date: "22 May 2026", price: 23000, seats: 15, status: "available" },
            { date: "29 May 2026", price: 24000, seats: 20, status: "available" }
        ],

        itinerary: [
            {
                day: 1,
                title: "Haridwar to Barkot",
                description:
                    "After breakfast, depart from Haridwar towards Barkot. En route, enjoy scenic views of Mussoorie, Kempty Falls and nearby attractions. Arrival at Barkot by evening, followed by hotel check-in and rest.",

            },
            {
                day: 2,
                title: "Barkot to Yamunotri and back to Barkot",
                description:
                    "Early morning drive to Janki Chatti. From here, begin the 6 km trek to Yamunotri Temple. Pilgrims may walk or use horse or palki services at extra cost. After darshan and holy bath, return to Janki Chatti and drive back to Barkot.",

            },
            {
                day: 3,
                title: "Barkot to Uttarkashi",
                description:
                    "Post breakfast, check out and proceed to Uttarkashi. Visit Shivgufa Temple on the way. After arrival, visit Kashi Vishwanath Temple, also known as Chota Kashi. Evening free for rest.",

            },
            {
                day: 4,
                title: "Uttarkashi to Gangotri and back",
                description:
                    "Drive to Gangotri Temple after breakfast. Stop at Gangnani to take a holy dip in Garam Kund. Enjoy views of Harsil Valley and surrounding landscapes. After darshan, return to Uttarkashi for overnight stay.",

            },
            {
                day: 5,
                title: "Uttarkashi to Guptkashi",
                description:
                    "After breakfast, begin the long scenic drive to Guptkashi. Enjoy views of rivers, valleys and mountain towns along the route. Reach Guptkashi by evening and rest at the hotel.",

            },
            {
                day: 6,
                title: "Guptkashi to Kedarnath",
                description:
                    "Early morning departure towards Gaurikund. From here, start the 18 km trek to Kedarnath Temple. Pilgrims can walk or use horse, palki or helicopter services at extra cost. Visit Kedarnath Temple and Bhairav Temple. Overnight stay near Kedarnath subject to availability.",

            },
            {
                day: 7,
                title: "Kedarnath to Guptkashi and onward to Badrinath",
                description:
                    "After morning darshan, descend from Kedarnath and proceed towards Badrinath. Upon arrival, check into the hotel. Visit Tap Kund and attend evening darshan at Badrinath Temple.",

            },
            {
                day: 8,
                title: "Badrinath to Rudraprayag",
                description:
                    "Morning visit to Mana Village, the last village near the Indo-Tibetan border. See Bhim Pul, Vyas Gufa and Vasundhara Falls. Later drive to Rudraprayag with en route sightseeing.",

            },
            {
                day: 9,
                title: "Rudraprayag to Haridwar",
                description:
                    "After breakfast, drive back to Haridwar. Visit Dhari Devi Temple, Devprayag and Rishikesh on the way. Arrival in Haridwar by evening and hotel check-in.",

            },
            {
                day: 10,
                title: "Departure from Haridwar",
                description:
                    "After breakfast, check out from the hotel and proceed to the railway station or airport for onward journey.",

            }
        ],

        inclusions: [
            "Nine nights accommodation on twin sharing basis",
            "Daily breakfast and dinner at hotels",
            "All transfers and sightseeing by Tempo Traveller",
            "AC in plains only",
            "Hot and cold water facilities in hotels",
            "Driver allowance, fuel, toll taxes and parking",
            "All applicable state taxes and GST"
        ],

        exclusions: [
            "Lunch during the tour",
            "Personal expenses such as laundry and phone calls",
            "Heater charges in hotels",
            "Horse, palki or helicopter charges for Kedarnath",
            "Entrance fees at monuments or attractions",
            "Travel insurance",
            "Any service not mentioned in inclusions"
        ],

        hotels: [
            "Barkot - Hotel Aswal Deluxe",
            "Uttarkashi - Hotel J8",
            "Guptkashi - Himalaya Inn or Hotel Rana",
            "Kedarnath - GMVN or BHEL Ashram",
            "Badrinath - Maa Urwashi",
            "Rudraprayag - Hotel Anmol",
            "Haridwar - Standard hotel"
        ]
    }
    ,
    {
        _id: "2",
        title: "Do Dham Yatra Ex Haridwar",
        subtitle: "Sacred Journey to Kedarnath and Badrinath",
        slug: "do-dham-yatra-haridwar",
        destination: "Uttarakhand",
        image: "https://images.unsplash.com/photo-1601821139314-66a4d14cfc00?q=80&w=1488&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        price: 14000,
        originalPrice: null,
        duration: "6N/7D",
        departureDate: "2026-05-20",
        returnDate: "2026-05-26",
        tag: "Spiritual Tour",
        location: "Uttarakhand Himalayas",
        transport: "Tempo Traveller (AC in plains only)",
        nextDeparture: "20 May 2026",
        availableSeats: 12,
        totalSeats: 24,

        shortDescription:
            "A budget-friendly Do Dham Yatra from Haridwar covering Kedarnath and Badrinath with essential facilities, meals and accommodation.",

        longDescription:
            "This Do Dham Yatra package from Haridwar is ideal for pilgrims seeking blessings at Kedarnath and Badrinath within a shorter duration. The tour is planned with proper rest days, temple darshan and scenic Himalayan routes. Accommodation is provided in economy hotels with daily meals and transfers, making this journey suitable for budget travellers and group pilgrims.",

        highlights: [
            "Visit Kedarnath and Badrinath temples",
            "Overnight stay near Kedarnath",
            "Holy Ganga Aarti at Har Ki Pauri",
            "Mana Village sightseeing at Badrinath",
            "Daily breakfast and dinner included",
            "Affordable Do Dham pilgrimage package"
        ],

        suitableFor: [
            "Pilgrims planning Kedarnath and Badrinath together",
            "Budget-conscious travellers",
            "Groups and families on pilgrimage",
            "People comfortable with Kedarnath trek or helicopter option",
            "First-time Do Dham visitors"
        ],

        notSuitableFor: [
            "Travellers seeking luxury hotels",
            "People with severe medical conditions",
            "Those unable to walk or trek at high altitude",
            "Non-vegetarian food seekers",
            "Travellers expecting relaxed travel hours"
        ],

        departures: [
            { date: "20 May 2026", price: 14000, seats: 12, status: "available" },
            { date: "27 May 2026", price: 14500, seats: 20, status: "available" },
            { date: "03 June 2026", price: 15000, seats: 24, status: "available" }
        ],

        itinerary: [
            {
                day: 1,
                title: "Arrival in Haridwar",
                description:
                    "Arrival at Haridwar railway station and transfer to the hotel. Later visit Har Ki Pauri and Mansa Devi Temple. In the evening, witness the holy Ganga Aarti. Overnight stay at Haridwar.",

            },
            {
                day: 2,
                title: "Haridwar to Guptkashi",
                description:
                    "After breakfast, drive from Haridwar to Guptkashi. En route enjoy scenic views of Moolgarh and Lambgaon. Arrival by evening followed by hotel check-in and rest.",


            },
            {
                day: 3,
                title: "Guptkashi to Kedarnath",
                description:
                    "Early morning departure towards Gaurikund. Begin the 18 km trek to Kedarnath Temple. Pilgrims may walk or use horse, palki or helicopter services at extra cost. Visit Kedarnath Temple and Bhairav Temple. Overnight stay near Kedarnath.",

            },
            {
                day: 4,
                title: "Kedarnath to Guptkashi",
                description:
                    "Early morning darshan at Kedarnath Temple followed by trek down to Gaurikund. Drive back to Guptkashi and rest at the hotel.",

            },
            {
                day: 5,
                title: "Guptkashi to Badrinath",
                description:
                    "After breakfast, drive towards Badrinath. Upon arrival, check into the hotel. Visit Tap Kund and attend darshan at Badrinath Temple.",

            },
            {
                day: 6,
                title: "Badrinath to Rudraprayag",
                description:
                    "Morning visit to Mana Village including Bhim Pul, Vyas Gufa, Saraswati River and Vasundhara Falls. Later drive to Rudraprayag for overnight stay.",

            },
            {
                day: 7,
                title: "Rudraprayag to Haridwar Departure",
                description:
                    "After breakfast, drive back to Haridwar railway station for onward journey. Tour concludes with spiritual memories.",

            }
        ],

        inclusions: [
            "Six nights accommodation on quad sharing basis",
            "Daily breakfast and dinner",
            "All transfers and sightseeing by Tempo Traveller",
            "Parking, toll taxes, fuel charges and driver allowance",
            "Hot and cold water facilities in hotels",
            "Welcome drink on arrival",
            "All applicable state taxes"
        ],

        exclusions: [
            "Lunch during the tour",
            "Personal expenses such as laundry and phone calls",
            "Heater charges in hotels",
            "Horse, palki or helicopter charges for Kedarnath",
            "Entrance fees at sightseeing places",
            "Anything not mentioned in inclusions"
        ],

        hotels: [
            "Haridwar - Hotel Sachin International",
            "Guptkashi - Himalaya Inn or Hotel Rana",
            "Kedarnath - GMVN or BHEL Ashram",
            "Badrinath - Maa Urwashi",
            "Rudraprayag - Hotel Samrat"
        ],

        paymentPolicy: [
            "25 percent of the package cost at the time of booking",
            "50 percent payment before 30 days of departure",
            "Remaining balance to be paid 15 days before departure"
        ],

        cancellationPolicy: [
            "10 percent of total tour cost if cancelled 45 days prior to arrival",
            "30 percent of total tour cost if cancelled 30 days prior to arrival",
            "50 percent of total tour cost if cancelled between 15 and 29 days prior to tour"
        ],


    }
    ,
    {
        _id: "3",
        title: "Char Dham Yatra Ex Delhi",
        subtitle: "Complete Chardham Group Pilgrimage from Delhi",
        slug: "char-dham-yatra-delhi",
        destination: "Uttarakhand",
        image: "https://images.unsplash.com/photo-1630307357687-8222c5ac88dd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        price: 25000,
        originalPrice: null,
        duration: "11N/12D",
        departureDate: "2026-05-15",
        returnDate: "2026-05-26",
        tag: "Spiritual Tour",
        location: "Uttarakhand Himalayas",
        transport: "Bus and Tempo Traveller (AC in plains only)",

        nextDeparture: "15 May 2026",
        availableSeats: 14,
        totalSeats: 30,

        shortDescription:
            "A complete Char Dham Yatra from Delhi covering Yamunotri, Gangotri, Kedarnath and Badrinath with guided transfers, meals and accommodation.",

        longDescription:
            "This Char Dham Yatra from Delhi is a well-planned group pilgrimage covering all four sacred dhams of Uttarakhand. Starting from Delhi, the journey takes you through Haridwar, Barkot, Uttarkashi, Guptkashi and Badrinath, offering a balanced mix of devotion, scenic beauty and spiritual experiences. The tour includes economy hotel stays, daily meals and comfortable transport, making it suitable for pilgrims looking for a complete and affordable Chardham journey.",

        highlights: [
            "Complete Char Dham pilgrimage from Delhi",
            "Holy Ganga Aarti at Har Ki Pauri",
            "Yamunotri and Gangotri temple darshan",
            "Overnight stay near Kedarnath",
            "Mana Village sightseeing at Badrinath",
            "Group tour with experienced drivers"
        ],

        suitableFor: [
            "Pilgrims planning a full Char Dham Yatra",
            "Group and family travellers",
            "First-time Char Dham visitors",
            "Budget-conscious devotees",
            "Travellers comfortable with long road journeys",
            "Pilgrims able to trek to Kedarnath or use helicopter services"
        ],

        notSuitableFor: [
            "Travellers seeking luxury accommodation",
            "People with serious medical conditions",
            "Those unable to walk or trek in high altitude",
            "Non-vegetarian food seekers",
            "Travellers expecting short daily travel hours"
        ],

        departures: [
            { date: "15 May 2026", price: 25000, seats: 14, status: "limited" },
            { date: "22 May 2026", price: 25000, seats: 20, status: "available" },
            { date: "29 May 2026", price: 26000, seats: 30, status: "available" }
        ],

        itinerary: [
            {
                day: 1,
                title: "Delhi to Haridwar",
                description:
                    "Pickup before noon from Delhi Airport or Railway Station and drive to Haridwar. After hotel check-in, visit Har Ki Pauri in the evening to attend the holy Ganga Aarti.",

            },
            {
                day: 2,
                title: "Haridwar to Barkot",
                description:
                    "After breakfast, drive towards Barkot. En route visit Mussoorie, Kempty Falls, Bhatta Falls and nearby scenic spots. Arrival at Barkot by evening followed by hotel check-in.",

            },
            {
                day: 3,
                title: "Barkot to Yamunotri and back",
                description:
                    "Early morning drive to Janki Chatti. From here, begin the 6 km trek to Yamunotri Temple by foot or horse or palki at extra cost. After darshan and holy bath, return to Barkot.",

            },
            {
                day: 4,
                title: "Barkot to Uttarkashi",
                description:
                    "Post breakfast, check out and drive to Uttarkashi. Visit Shivgufa Temple en route. Upon arrival, visit Kashi Vishwanath Temple, also known as Chota Kashi.",

            },
            {
                day: 5,
                title: "Uttarkashi to Gangotri and back",
                description:
                    "Drive to Gangotri Temple after breakfast. Stop at Gangnani for holy bath in Garam Kund. Enjoy views of Harsil Valley and Lanka Bridge. After darshan, return to Uttarkashi.",

            },
            {
                day: 6,
                title: "Uttarkashi to Guptkashi",
                description:
                    "After breakfast, drive towards Guptkashi. En route enjoy views of Moolgarh and Lambgaon. Arrival by evening and overnight stay at hotel.",

            },
            {
                day: 7,
                title: "Guptkashi to Kedarnath",
                description:
                    "Early morning drive to Gaurikund followed by the 18 km trek to Kedarnath Temple. Options include walking, horse, palki or helicopter at extra cost. Visit Kedarnath Temple and Bhairav Temple.",

            },
            {
                day: 8,
                title: "Kedarnath to Guptkashi",
                description:
                    "Morning darshan at Kedarnath Temple followed by trek down to Gaurikund. Drive back to Guptkashi for overnight stay.",

            },
            {
                day: 9,
                title: "Guptkashi to Badrinath",
                description:
                    "After breakfast, drive towards Badrinath. Upon arrival, check into the hotel. Visit Tap Kund and attend darshan at Badrinath Temple.",

            },
            {
                day: 10,
                title: "Badrinath to Rudraprayag",
                description:
                    "Morning visit to Mana Village including Bhim Pul, Vyas Gufa, Saraswati River and Vasundhara Falls. Later drive to Rudraprayag via Joshimath.",

            },
            {
                day: 11,
                title: "Rudraprayag to Haridwar",
                description:
                    "After breakfast, drive back to Haridwar. En route visit Dhari Devi Temple, Devprayag and Rishikesh. Overnight stay at Haridwar.",

            },
            {
                day: 12,
                title: "Haridwar to Delhi Departure",
                description:
                    "After breakfast, drive back to Delhi Airport or Railway Station for onward journey.",

            }
        ],

        inclusions: [
            "Accommodation in economy hotels on twin sharing basis",
            "All sightseeing and transfers by Bus or Tempo Traveller",
            "Welcome drink on arrival",
            "Daily breakfast and dinner",
            "Hot and cold water facilities in hotels",
            "All toll taxes, parking, fuel charges and driver allowance",
            "All applicable state taxes"
        ],

        exclusions: [
            "Lunch during the tour",
            "Personal expenses such as laundry and phone calls",
            "5 percent GST",
            "Heater charges in hotels",
            "Horse, palki or helicopter charges",
            "Entrance fees at sightseeing places",
            "Anything not mentioned in inclusions"
        ],

        hotels: [
            "Haridwar - Hotel Grand Shiva",
            "Barkot - Hotel Aswal Deluxe",
            "Harsil - Hotel Kalp Kedar",
            "Uttarkashi - Hotel J8",
            "Guptkashi - Himalaya Inn or Hotel Rana",
            "Kedarnath - GMVN or BHEL Ashram",
            "Badrinath - Maa Urwashi",
            "Rudraprayag - Hotel Anmol",
            "Haridwar - Hotel Royal Galaxy"
        ]
    },
    {
        _id: "4",
        title: "North East Tour Package",
        subtitle: "Gangtok & Darjeeling Scenic Holiday",
        slug: "north-east-gangtok-darjeeling-tour",
        destination: "Sikkim & West Bengal",
        image: "https://images.unsplash.com/photo-1641233122088-9562e3ef0105?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        price: 16000,
        originalPrice: null,
        duration: "5N/6D",
        departureDate: "2025-02-25",
        returnDate: "2025-03-02",
        tag: "Hill Station Tour",
        location: "Gangtok & Darjeeling",
        transport: "Tempo Traveller / Shared Vehicle (AC in plains only)",
        nextDeparture: "25 Feb 2025",
        availableSeats: 20,
        totalSeats: 30,

        shortDescription:
            "A beautiful North East tour covering Gangtok and Darjeeling with lakes, monasteries, tea gardens and Himalayan views.",

        longDescription:
            "This North East tour package offers a perfect blend of nature, culture and mountain charm. Starting from NJP/Bagdogra, the journey covers Gangtok and Darjeeling with visits to Tsomgo Lake, Baba Mandir, monasteries, tea estates and Tiger Hill sunrise. Ideal for families, couples and first-time visitors to the North East.",

        highlights: [
            "Tsomgo Lake and Baba Mandir excursion",
            "Optional Nathula Pass visit",
            "Gangtok local sightseeing",
            "Darjeeling Tiger Hill sunrise",
            "Toy Train & Tea Estate visit",
            "Comfortable hotel stays"
        ],

        suitableFor: [
            "Families and couples",
            "First-time North East travellers",
            "Nature and mountain lovers",
            "Budget-friendly holiday seekers",
            "Short vacation planners"
        ],

        notSuitableFor: [
            "Luxury hotel seekers",
            "Travellers with severe altitude sickness",
            "Those expecting private transport throughout",
            "Adventure trekking travellers"
        ],

        departures: [
            { date: "25 Feb 2025", price: 16000, seats: 20, status: "available" }
        ],

        itinerary: [
            {
                day: 1,
                title: "Arrival & Transfer to Gangtok",
                description:
                    "Pickup from NJP Railway Station / Bagdogra Airport / Kakarbitta border and transfer to Gangtok. Evening free to explore MG Road and local markets.",

            },
            {
                day: 2,
                title: "Excursion to Tsomgo Lake & Baba Mandir",
                description:
                    "After breakfast, proceed for a full-day excursion to Tsomgo Lake and Baba Mandir. Optional Nathula Pass visit subject to permit and weather conditions.",

            },
            {
                day: 3,
                title: "Gangtok Local Sightseeing",
                description:
                    "Full-day sightseeing including Directorate of Handicrafts & Handloom, Research Institute of Tibetology, Do Drul Chorten, Enchey Monastery, Rumtek Monastery, Flower Show and viewpoints.",

            },
            {
                day: 4,
                title: "Transfer to Darjeeling",
                description:
                    "After breakfast, drive to Darjeeling. Visit Tea Estates, Himalayan Mountaineering Institute, Padmaja Naidu Zoo and enjoy evening leisure time.",

            },
            {
                day: 5,
                title: "Darjeeling Local Sightseeing",
                description:
                    "Early morning visit to Tiger Hill for sunrise. Later visit Ghoom Monastery, Batasia Loop, Ropeway, Tibetan Refugee Centre, Tea Garden and Peace Pagoda.",

            },
            {
                day: 6,
                title: "Departure",
                description:
                    "After breakfast, drop at NJP Railway Station or Bagdogra Airport for onward journey.",

            }
        ],

        inclusions: [
            "Accommodation in deluxe hotels on double or triple sharing basis",
            "All sightseeing and transfers by shared vehicle",
            "Welcome drink (non-alcoholic)",
            "Daily breakfast and dinner",
            "Hot and cold water facilities",
            "Nathula Pass permit (if applicable)",
            "All toll taxes, parking, fuel charges and driver allowance",
            "All applicable state taxes"
        ],

        exclusions: [
            "Lunch during the tour",
            "Personal expenses like laundry and phone calls",
            "5 percent GST",
            "Heater charges",
            "Entrance fees",
            "Anything not mentioned in inclusions"
        ],

        hotels: [
            "Gangtok - Glory Boutique Hotel",
            "Darjeeling - Rare Himalayas / Hotel Golden Potala"
        ]
    }


];
