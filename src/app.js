require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getDb } = require('./db');
const studios = require('./routes/studios');
const bookings = require('./routes/bookings');

const app = express();

const origins = (process.env.CLIENT_URLS || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: origins, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.json({ name: 'StudioSpace API', status: 'ok' }));

app.use('/api', async (req, res, next) => {
  try {
    req.db = await getDb();
    next();
  } catch (e) {
    next(e);
  }
});

app.use('/api/studios', studios);
app.use('/api/bookings', bookings);

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
});

module.exports = app;
