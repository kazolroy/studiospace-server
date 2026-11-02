const express = require('express');
const { ObjectId } = require('mongodb');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

const ACTIVE = ['Pending', 'Confirmed'];

// POST /api/bookings – creates a "Pending" reservation
router.post('/', async (req, res, next) => {
  try {
    const { studioId, date, startTime, note } = req.body;
    const hours = parseInt(req.body.hours, 10);
    if (!ObjectId.isValid(studioId)) return res.status(400).json({ message: 'Invalid studio.' });
    const studio = await req.db.collection('studios').findOne({ _id: new ObjectId(studioId) });
    if (!studio) return res.status(404).json({ message: 'This studio is no longer available.' });
    if (studio.ownerEmail === req.user.email) return res.status(403).json({ message: "You can't book your own studio." });

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return res.status(400).json({ message: 'Please choose a date.' });
    const startHour = parseInt(String(startTime || '').split(':')[0], 10);
    if (!(startHour >= 0 && startHour <= 23)) return res.status(400).json({ message: 'Please choose a start time.' });
    if (!(hours >= 1 && hours <= 12)) return res.status(400).json({ message: 'You can book between 1 and 12 hours.' });
    const endHour = startHour + hours;
    if (endHour > 24) return res.status(400).json({ message: 'Bookings must finish by midnight.' });

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    if (date < today) return res.status(400).json({ message: 'Please choose a future date.' });

    const clash = await req.db.collection('bookings').findOne({
      studioId,
      date,
      status: { $in: ACTIVE },
      startHour: { $lt: endHour },
      endHour: { $gt: startHour },
    });
    if (clash) return res.status(409).json({ message: 'That time slot has just been taken. Please pick another.' });

    const pad = (n) => String(n).padStart(2, '0');
    const doc = {
      studioId,
      studioTitle: studio.title,
      studioImage: studio.image,
      studioLocation: studio.location,
      hostEmail: studio.ownerEmail,
      hostName: studio.ownerName,
      bookerEmail: req.user.email,
      bookerName: req.user.name,
      date,
      startTime: `${pad(startHour)}:00`,
      endTime: `${pad(endHour % 24)}:00`,
      startHour,
      endHour,
      hours,
      hourlyRate: studio.hourlyRate,
      securityDeposit: studio.securityDeposit,
      total: studio.hourlyRate * hours + studio.securityDeposit,
      note: String(note || '').trim().slice(0, 400),
      status: 'Pending',
      createdAt: now,
    };
    const result = await req.db.collection('bookings').insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (e) {
    next(e);
  }
});

// GET /api/bookings/mine – reservations I made
router.get('/mine', async (req, res, next) => {
  try {
    res.json(await req.db.collection('bookings').find({ bookerEmail: req.user.email }).sort({ createdAt: -1 }).toArray());
  } catch (e) {
    next(e);
  }
});

// GET /api/bookings/requests – reservations on studios I host
router.get('/requests', async (req, res, next) => {
  try {
    res.json(await req.db.collection('bookings').find({ hostEmail: req.user.email }).sort({ createdAt: -1 }).toArray());
  } catch (e) {
    next(e);
  }
});

// PATCH /api/bookings/:id/status
// guest: Pending -> Cancelled | host: Pending -> Confirmed/Cancelled, Confirmed -> Completed/Cancelled
router.patch('/:id/status', async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Booking not found.' });
    const _id = new ObjectId(req.params.id);
    const booking = await req.db.collection('bookings').findOne({ _id });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const next_ = req.body.status;
    const isGuest = booking.bookerEmail === req.user.email;
    const isHost = booking.hostEmail === req.user.email;
    const allowed = [];
    if (isGuest && booking.status === 'Pending') allowed.push('Cancelled');
    if (isHost) {
      if (booking.status === 'Pending') allowed.push('Confirmed', 'Cancelled');
      if (booking.status === 'Confirmed') allowed.push('Completed', 'Cancelled');
    }
    if (!allowed.includes(next_)) return res.status(400).json({ message: `This booking can't be changed to "${next_}".` });

    await req.db.collection('bookings').updateOne({ _id }, { $set: { status: next_, updatedAt: new Date() } });
    res.json({ ...booking, status: next_ });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
