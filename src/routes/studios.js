const express = require('express');
const { ObjectId } = require('mongodb');
const { verifyToken } = require('../middleware/auth');
const { parseStudio } = require('../validate');

const router = express.Router();

const toId = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/studios  – search / filter / sort / limit
router.get('/', async (req, res, next) => {
  try {
    const { q, category, sort = 'newest', minPrice, maxPrice, limit } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (q && q.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [{ title: rx }, { location: rx }, { category: rx }, { amenities: rx }];
    }
    if (minPrice || maxPrice) {
      filter.hourlyRate = {};
      if (minPrice) filter.hourlyRate.$gte = Number(minPrice);
      if (maxPrice) filter.hourlyRate.$lte = Number(maxPrice);
    }
    const sorts = {
      newest: { createdAt: -1 },
      rating: { rating: -1, reviewCount: -1 },
      priceAsc: { hourlyRate: 1 },
      priceDesc: { hourlyRate: -1 },
    };
    let cursor = req.db.collection('studios').find(filter).sort(sorts[sort] || sorts.newest);
    const n = parseInt(limit, 10);
    if (n > 0) cursor = cursor.limit(Math.min(n, 60));
    res.json(await cursor.toArray());
  } catch (e) {
    next(e);
  }
});

// GET /api/studios/mine – listings owned by the signed-in user
router.get('/mine', verifyToken, async (req, res, next) => {
  try {
    const docs = await req.db
      .collection('studios')
      .find({ ownerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(docs);
  } catch (e) {
    next(e);
  }
});

// GET /api/studios/:id
router.get('/:id', async (req, res, next) => {
  try {
    const _id = toId(req.params.id);
    if (!_id) return res.status(404).json({ message: 'Studio not found.' });
    const studio = await req.db.collection('studios').findOne({ _id });
    if (!studio) return res.status(404).json({ message: 'Studio not found.' });
    res.json(studio);
  } catch (e) {
    next(e);
  }
});

// GET /api/studios/:id/availability?date=YYYY-MM-DD – already reserved slots
router.get('/:id/availability', async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return res.status(400).json({ message: 'A valid date is required.' });
    const slots = await req.db
      .collection('bookings')
      .find({ studioId: req.params.id, date, status: { $in: ['Pending', 'Confirmed'] } })
      .project({ startHour: 1, endHour: 1, _id: 0 })
      .toArray();
    res.json(slots);
  } catch (e) {
    next(e);
  }
});

// POST /api/studios
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { data, error } = parseStudio(req.body);
    if (error) return res.status(400).json({ message: error });
    const doc = {
      ...data,
      ownerEmail: req.user.email,
      ownerName: req.user.name,
      ownerPhoto: req.user.picture,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      createdAt: new Date(),
    };
    const result = await req.db.collection('studios').insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (e) {
    next(e);
  }
});

// PUT /api/studios/:id – owner only
router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const _id = toId(req.params.id);
    if (!_id) return res.status(404).json({ message: 'Studio not found.' });
    const existing = await req.db.collection('studios').findOne({ _id });
    if (!existing) return res.status(404).json({ message: 'Studio not found.' });
    if (existing.ownerEmail !== req.user.email) return res.status(403).json({ message: 'You can only edit your own listings.' });
    const { data, error } = parseStudio(req.body);
    if (error) return res.status(400).json({ message: error });
    await req.db.collection('studios').updateOne({ _id }, { $set: { ...data, updatedAt: new Date() } });
    res.json({ ...existing, ...data });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/studios/:id – owner only; pending requests are cancelled
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const _id = toId(req.params.id);
    if (!_id) return res.status(404).json({ message: 'Studio not found.' });
    const existing = await req.db.collection('studios').findOne({ _id });
    if (!existing) return res.status(404).json({ message: 'Studio not found.' });
    if (existing.ownerEmail !== req.user.email) return res.status(403).json({ message: 'You can only delete your own listings.' });
    await req.db.collection('studios').deleteOne({ _id });
    await req.db
      .collection('bookings')
      .updateMany({ studioId: req.params.id, status: { $in: ['Pending', 'Confirmed'] } }, { $set: { status: 'Cancelled' } });
    res.json({ deleted: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/studios/:id/reviews – one review per user, recalculates rating
router.post('/:id/reviews', verifyToken, async (req, res, next) => {
  try {
    const _id = toId(req.params.id);
    const studio = _id && (await req.db.collection('studios').findOne({ _id }));
    if (!studio) return res.status(404).json({ message: 'Studio not found.' });
    if (studio.ownerEmail === req.user.email) return res.status(403).json({ message: "You can't review your own studio." });

    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ message: 'Please choose a rating between 1 and 5.' });
    if (comment.length < 5) return res.status(400).json({ message: 'Please write a short comment (5+ characters).' });

    const review = {
      name: req.user.name,
      email: req.user.email,
      photo: req.user.picture,
      rating: Math.round(rating),
      comment: comment.slice(0, 600),
      createdAt: new Date(),
    };
    const reviews = [review, ...(studio.reviews || []).filter((r) => r.email !== req.user.email)];
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await req.db
      .collection('studios')
      .updateOne({ _id }, { $set: { reviews, reviewCount: reviews.length, rating: Math.round(avg * 10) / 10 } });
    res.status(201).json({ reviews, reviewCount: reviews.length, rating: Math.round(avg * 10) / 10 });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
