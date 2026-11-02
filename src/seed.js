/* Seeds the studios collection with demo listings.  Usage: npm run seed */
require('dotenv').config();
const { getDb } = require('./db');

const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const HOST = { ownerEmail: 'host@studiospace.demo', ownerName: 'Maya Fontaine', ownerPhoto: '' };

const reviewers = [
  ['Daniel Okafor', 'Great light, easy loading dock, and the host answered every question within minutes.'],
  ['Priya Nair', 'Spotless space and exactly as pictured. We wrapped a full-day shoot without a single issue.'],
  ['Luca Moretti', 'Acoustics were fantastic. Would book again for our next session without hesitation.'],
  ['Hana Sato', 'Fair pricing, clear rules and a very helpful host. The amenities list was accurate.'],
];

const base = [
  {
    title: 'Halo Cyclorama Loft',
    category: 'Photo Studio',
    location: 'Williamsburg, Brooklyn, NY',
    hourlyRate: 65,
    securityDeposit: 150,
    maxCapacity: 12,
    image: U('photo-1516035069371-29a1b244cc32'),
    amenities: ['Infinity cyc wall', 'Strobe kit', 'Makeup station', 'Freight elevator', 'Wi-Fi', 'Backdrop rack'],
    overview:
      'A 1,800 sq ft white-wall loft with a seamless 12-foot cyclorama, north-facing windows and a full strobe package. Ideal for e-commerce, editorial and portrait work. Includes a private makeup room and a 2-minute walk to the subway.',
    rating: 4.8,
  },
  {
    title: 'Blackbox Sound Stage 7',
    category: 'Film Stage',
    location: 'Burbank, Los Angeles, CA',
    hourlyRate: 210,
    securityDeposit: 800,
    maxCapacity: 60,
    image: U('photo-1485846234645-a62644f84728'),
    amenities: ['Soundproofed stage', 'Lighting grid', 'Green screen', '3-phase power', 'Green room', 'Loading dock'],
    overview:
      'A 5,000 sq ft acoustically treated sound stage with a 24-foot ceiling and a motorised lighting grid. Built for commercials, short films and music videos, with a production office and dedicated green room on site.',
    rating: 4.9,
  },
  {
    title: 'The Velvet Mic Podcast Lounge',
    category: 'Podcast Lounge',
    location: 'East Austin, TX',
    hourlyRate: 45,
    securityDeposit: 60,
    maxCapacity: 6,
    image: U('photo-1478737270239-2f02b77fc618'),
    amenities: ['4 Shure SM7B mics', 'Rodecaster Pro', 'Acoustic panels', '4K camera setup', 'Coffee bar', 'Wi-Fi'],
    overview:
      'A warm, velvet-draped lounge set up for four-person video podcasts. Mics, mixer and three 4K cameras are ready to roll, and an in-house engineer can be added for a small fee.',
    rating: 4.7,
  },
  {
    title: 'Nightshift Recording Suite',
    category: 'Music Suite',
    location: 'Hackney, London, UK',
    hourlyRate: 80,
    securityDeposit: 200,
    maxCapacity: 8,
    image: U('photo-1598488035139-bdbb2231ce04'),
    amenities: ['Neve console', 'Vocal booth', 'Grand piano', 'Studio monitors', 'Backline amps', 'Engineer available'],
    overview:
      'An analogue-meets-digital recording suite with a vintage Neve desk, isolated vocal booth and a tuned grand piano. Perfect for tracking vocals, strings and small band sessions with the option to hire an engineer.',
    rating: 4.9,
  },
  {
    title: 'Clay & Canvas Workshop',
    category: 'Workshop',
    location: 'Fremont, Seattle, WA',
    hourlyRate: 38,
    securityDeposit: 50,
    maxCapacity: 20,
    image: U('photo-1460661419201-fd4cecdf8a8b'),
    amenities: ['Easels', 'Pottery wheels', 'Kiln access', 'Sink & wash station', 'Natural light', 'Storage racks'],
    overview:
      'A sunlit art workshop with easels, two pottery wheels and kiln access. Great for classes, collaborative painting days and product-making photo shoots. Drop cloths and cleaning supplies provided.',
    rating: 4.6,
  },
  {
    title: 'Golden Hour Rooftop Studio',
    category: 'Photo Studio',
    location: 'Wynwood, Miami, FL',
    hourlyRate: 90,
    securityDeposit: 250,
    maxCapacity: 15,
    image: U('photo-1471341971476-ae15ff5dd4ea'),
    amenities: ['Rooftop terrace', 'Natural light', 'Wind-safe stands', 'Lounge area', 'Wi-Fi', 'Power outlets'],
    overview:
      'A sun-drenched rooftop studio with an indoor daylight room for weather backup. Skyline views, warm golden-hour light and plenty of space for fashion and lifestyle campaigns.',
    rating: 4.5,
  },
  {
    title: 'Echo Chamber Mixing Room',
    category: 'Music Suite',
    location: 'Kreuzberg, Berlin, DE',
    hourlyRate: 55,
    securityDeposit: 100,
    maxCapacity: 4,
    image: U('photo-1519892300165-cb5542fb47c7'),
    amenities: ['Treated control room', 'Adam monitors', 'Modular synths', 'Pro Tools rig', 'Headphone amp', 'Tea & coffee'],
    overview:
      'A tight, beautifully treated mixing and production room with a synth wall and flagship monitors. Designed for producers who need an honest listening environment and fast creative flow.',
    rating: 4.8,
  },
  {
    title: 'Noir Interview Set',
    category: 'Film Stage',
    location: 'Midtown, Atlanta, GA',
    hourlyRate: 120,
    securityDeposit: 300,
    maxCapacity: 25,
    image: U('photo-1492691527719-9d1e07e534b4'),
    amenities: ['Three-point lighting', 'Teleprompter', 'Dolly track', 'Makeup chairs', 'Client lounge', 'Backdrop options'],
    overview:
      'A cinematic interview and documentary set with dolly track, a teleprompter and four interchangeable backdrops. Includes a client viewing lounge so your team can watch the take comfortably.',
    rating: 4.4,
  },
  {
    title: 'Sunday Sessions Podcast Nook',
    category: 'Podcast Lounge',
    location: 'Gastown, Vancouver, CA',
    hourlyRate: 32,
    securityDeposit: 40,
    maxCapacity: 3,
    image: U('photo-1590602847861-f357a9332bbc'),
    amenities: ['2 mic kit', 'Soundproof booth', 'Headphones', 'Remote guest line', 'Wi-Fi'],
    overview:
      'A compact and affordable podcast booth with two broadcast microphones and a remote-guest line. Quiet building, easy parking and a friendly host who can help with your first setup.',
    rating: 4.3,
  },
  {
    title: 'Kiln & Kerning Print Workshop',
    category: 'Workshop',
    location: 'Fitzroy, Melbourne, AU',
    hourlyRate: 42,
    securityDeposit: 75,
    maxCapacity: 14,
    image: U('photo-1513364776144-60967b0f800f'),
    amenities: ['Screen-print press', 'Letterpress', 'Drying racks', 'Large tables', 'Ink supplies', 'Natural light'],
    overview:
      'A hands-on print workshop with a four-colour screen-print press, a vintage letterpress and big work tables. Book for classes, small-batch merch runs or art-direction shoots.',
    rating: 4.7,
  },
  {
    title: 'Concrete Light Studio',
    category: 'Photo Studio',
    location: 'Södermalm, Stockholm, SE',
    hourlyRate: 58,
    securityDeposit: 120,
    maxCapacity: 10,
    image: U('photo-1527011046414-4781f1f94f8c'),
    amenities: ['Concrete backdrops', 'Skylights', 'Continuous lights', 'Seamless paper', 'Steamer', 'Wi-Fi'],
    overview:
      'A minimalist industrial studio with raw concrete walls and big skylights. Soft diffused daylight makes it a favourite for product, beauty and interior photography.',
    rating: 4.6,
  },
  {
    title: 'Reel Room Motion Capture Stage',
    category: 'Film Stage',
    location: 'Gulshan, Dhaka, BD',
    hourlyRate: 95,
    securityDeposit: 220,
    maxCapacity: 30,
    image: U('photo-1536440136628-849c177e76a1'),
    amenities: ['Cyc wall', 'LED panels', 'Teleprompter', 'Generator backup', 'Air conditioning', 'Parking'],
    overview:
      'A fully air-conditioned stage with generator backup, LED lighting and a white cyc wall. Popular with advertising agencies and drama crews who need dependable power and quiet shooting hours.',
    rating: 4.5,
  },
];

async function run() {
  const db = await getDb();
  const col = db.collection('studios');
  await col.deleteMany({ ownerEmail: HOST.ownerEmail });

  const now = Date.now();
  const docs = base.map((s, i) => {
    const reviews = reviewers.slice(0, 2 + (i % 3)).map(([name, comment], j) => ({
      name,
      email: `reviewer${j}@studiospace.demo`,
      photo: '',
      rating: Math.min(5, Math.max(3, Math.round(s.rating) - (j === 2 ? 1 : 0))),
      comment,
      createdAt: new Date(now - (i * 5 + j + 1) * 86400000),
    }));
    return {
      ...HOST,
      ...s,
      gallery: [s.image],
      reviews,
      reviewCount: reviews.length,
      createdAt: new Date(now - i * 3600000 * 9),
    };
  });
  const res = await col.insertMany(docs);
  console.log(`Seeded ${res.insertedCount} studios.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
