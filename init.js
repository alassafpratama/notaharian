const { connectDB, getDB } = require('./db');

async function init() {
  await connectDB();
  const db = getDB();

  await db.collection("transaksi_harian").insertOne({
    tanggal: new Date().toISOString().split('T')[0],
    items: [],
    total: 0,
    createdAt: new Date()
  });

  console.log("Database & Collection berhasil dibuat");
}

init();