const { MongoClient, ServerApiVersion } = require('mongodb');

let client;
let db;

/** Lazily connect and cache the connection (works for long-running and serverless hosts). */
async function getDb() {
  if (db) return db;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: true },
  });
  await client.connect();
  db = client.db(process.env.DB_NAME || 'studiospace');
  return db;
}

module.exports = { getDb };
