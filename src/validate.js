const CATEGORIES = ['Photo Studio', 'Film Stage', 'Podcast Lounge', 'Music Suite', 'Workshop'];

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const num = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));

/** Validates and normalises a studio payload. Returns { error } or { data }. */
function parseStudio(body) {
  const title = str(body.title);
  const category = str(body.category);
  const location = str(body.location);
  const image = str(body.image);
  const overview = str(body.overview);
  const hourlyRate = num(body.hourlyRate);
  const securityDeposit = num(body.securityDeposit);
  const maxCapacity = num(body.maxCapacity);

  if (title.length < 3) return { error: 'Title must be at least 3 characters.' };
  if (!CATEGORIES.includes(category)) return { error: 'Please choose a valid category.' };
  if (!(hourlyRate > 0)) return { error: 'Hourly rate must be greater than zero.' };
  if (!(securityDeposit >= 0)) return { error: 'Security deposit cannot be negative.' };
  if (!(maxCapacity >= 1)) return { error: 'Max capacity must be at least 1.' };
  if (location.length < 3) return { error: 'Please enter a location or address.' };
  if (!/^https?:\/\//i.test(image)) return { error: 'Please provide a valid image URL.' };
  if (overview.length < 20) return { error: 'Overview should be at least 20 characters.' };

  const list = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
  const gallery = list(body.gallery).filter((u) => /^https?:\/\//i.test(u)).slice(0, 8);
  const amenities = [...new Set(list(body.amenities))].slice(0, 30);

  return {
    data: {
      title,
      category,
      location,
      image,
      gallery: [image, ...gallery.filter((g) => g !== image)],
      overview,
      amenities,
      hourlyRate,
      securityDeposit,
      maxCapacity,
    },
  };
}

module.exports = { CATEGORIES, parseStudio };
