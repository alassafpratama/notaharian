const { MongoClient } = require('mongodb');

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

let db;

async function connectDB() {
  await client.connect();
  db = client.db("kasir_db");
  console.log("MongoDB Connected");
}

function getDB() {
  return db;
}

module.exports = { connectDB, getDB };