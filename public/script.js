// FORMAT RUPIAH
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(angka || 0);
}

function updateWaktu() {
    const sekarang = new Date();
    const opsi = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    // Menggunakan format Indonesia
    document.getElementById('waktu-skrg').innerText = sekarang.toLocaleDateString('id-ID', opsi);
}

// Jalankan setiap detik
setInterval(updateWaktu, 1000);
updateWaktu();

// LOAD TOTAL
async function loadTotal() {
  const res = await fetch('/data', { cache: 'no-store' });
  const data = await res.json();

  document.getElementById('total').innerText = formatRupiah(data.total);
}

// SIMPAN (BATCH)
async function simpan() {
  const items = [
    "RITA","DOMPUL","VENTURA","ISIMPLE",
    "MKIOS","BON","QRIS","DANA","BRIMO","CASH","SAYUR","SALDO"
  ];

  let dataKirim = [];

  for (let nama of items) {
    const val = document.getElementById(nama).value;

    if (val && val != 0) {
      dataKirim.push({
        nama,
        jumlah: parseInt(val)
      });
    }
  }

  await fetch('/tambah-banyak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: dataKirim })
  });

  loadTotal();
}

// RESET
async function resetDatabase() {
  await fetch('/reset', { method: 'POST' });

  document.querySelectorAll("input").forEach(i => i.value = '');

  setTimeout(loadTotal, 300);
}

// FILTER ANGKA
document.querySelectorAll("input").forEach(input => {
  input.addEventListener("input", function() {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
});

// LOAD AWAL
loadTotal();