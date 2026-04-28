const express = require('express');
const { connectDB, getDB } = require('./db');

const app = express();
app.use(express.json());
app.use(express.static('public'));

let db;

// Fungsi Helper untuk dapat tanggal YYYY-MM-DD sesuai waktu Indonesia (WIB)
const getTodayDate = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
};

// ================= START SERVER =================
async function start() {
  try {
    await connectDB();
    db = getDB();
    console.log("Koneksi Database Berhasil.");

    await autoCreateToday();

    app.listen(3000, '0.0.0.0', () => {
      console.log("-----------------------------------------");
      console.log("Server jalan di http://localhost:3000");
      console.log("Tanggal sistem (WIB):", getTodayDate());
      console.log("-----------------------------------------");
    });
  } catch (err) {
    console.error("Gagal menjalankan server:", err);
  }
}
start();

// ================= AUTO HARIAN (Cek/Buat Dokumen Baru) =================
async function autoCreateToday() {
  const today = getTodayDate();
  const exist = await db.collection('transaksi_harian').findOne({ tanggal: today });

  if (!exist) {
    await db.collection('transaksi_harian').insertOne({
      tanggal: today,
      items: [],
      total: 0
    });
    console.log(`[System] Dokumen baru untuk tanggal ${today} telah dibuat.`);
  } else {
    console.log(`[System] Dokumen tanggal ${today} sudah tersedia.`);
  }
}

// ================= TAMBAH BANYAK (Simpan Kasir) =================
app.post('/tambah-banyak', async (req, res) => {
  try {
    const { items } = req.body;
    const today = getTodayDate();

    console.log(`\n[Input] Menerima simpan data untuk: ${today}`);
    console.log("Detail Data:", items);

    if (!items || items.length === 0) {
      console.log("[Warn] Data yang dikirim kosong.");
      return res.status(400).send("Kosong");
    }

    // Hitung total dari array items yang masuk
    let totalTambah = 0;
    items.forEach(item => {
      totalTambah += Number(item.jumlah) || 0;
    });

    const result = await db.collection('transaksi_harian').updateOne(
      { tanggal: today },
      {
        $push: { items: { $each: items } },
        $inc: { total: totalTambah }
      },
      { upsert: true }
    );

    console.log("[Success] MongoDB Update:", result.acknowledged);
    res.send("OK");
  } catch (err) {
    console.error("[Error] Gagal simpan data:", err);
    res.status(500).send("Database Error");
  }
});

// ================= RESET (Hapus Data Hari Ini) =================
app.post('/reset', async (req, res) => {
  try {
    const today = getTodayDate();
    await db.collection('transaksi_harian').updateOne(
      { tanggal: today },
      {
        $set: { items: [], total: 0 }
      },
      { upsert: true }
    );
    console.log(`[System] Data tanggal ${today} direset.`);
    res.send("RESET OK");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ================= GET DATA (Ambil untuk Tampilan) =================
app.get('/data', async (req, res) => {
  const today = getTodayDate();
  const data = await db.collection('transaksi_harian').findOne({ tanggal: today });
  
  // Jika data tidak ada, kirim template kosong
  res.json(data || { total: 0, items: [] });
});

// ================= KURANG (Manual) =================
app.post('/kurang', async (req, res) => {
  const { jumlah } = req.body;
  const today = getTodayDate();

  await db.collection('transaksi_harian').updateOne(
    { tanggal: today },
    {
      $push: { items: { nama: "Pengurangan", jumlah: -Number(jumlah) } },
      $inc: { total: -Number(jumlah) }
    },
    { upsert: true }
  );
  res.send("OK");
});