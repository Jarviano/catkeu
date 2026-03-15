// === KONFIGURASI KEAMANAN (Base64 Obfuscation) ===
const _0x1a2b = 'aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6TGhld09DOVhMOFR4VFBTZ3ZTX29yVzVJQmFQRmNHR1hMMTc2aG9fUnJneXpoOTVzQktxOUVmSzVoYUpjOFJWaTZ4US9leGVj'; // API URL
const _0x3c4d = 'amFydmk='; // Username
const _0x5e6f = 'QW5vdmlqYXIwMjE3MTMh'; // Password
const getApiUrl = () => atob(_0x1a2b);

Chart.defaults.color = '#e5e7eb';
let myChart = null;

document.addEventListener("DOMContentLoaded", function() {
    const currentMonth = new Date().getMonth() + 1;
    const namaBulan = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    document.getElementById('filterBulan').value = currentMonth.toString();
    document.getElementById('text-bulan').innerText = namaBulan[currentMonth];

    if (localStorage.getItem('isLoggedIn') === 'true') {
    pindahPage('page-dashboard');
    loadData();
    }
});

function prosesLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    if (btoa(user) === _0x3c4d && btoa(pass) === _0x5e6f) {
    localStorage.setItem('isLoggedIn', 'true');
    document.getElementById('loginError').classList.add('hidden');
    pindahPage('page-dashboard');
    loadData();
    } else {
    document.getElementById('loginError').classList.remove('hidden');
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    pindahPage('page-login');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function pindahPage(pageId) {
    document.getElementById('page-login').classList.add('hidden');
    document.getElementById('page-dashboard').classList.add('hidden');
    document.getElementById('page-form').classList.add('hidden');
    document.getElementById(pageId).classList.remove('hidden');
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeOpen = document.getElementById('eye-open');
    const eyeClosed = document.getElementById('eye-closed');
    
    if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeOpen.classList.add('hidden');
    eyeClosed.classList.remove('hidden');
    } else {
    passwordInput.type = 'password';
    eyeOpen.classList.remove('hidden');
    eyeClosed.classList.add('hidden');
    }
}

function formatRupiah(input) {
    let angka = input.value.replace(/[^,\d]/g, '').toString();
    let split = angka.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
    let separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
    }
    input.value = rupiah;
}

// === TAMBAHKAN VARIABEL GLOBAL INI DI BAWAH let myChart = null; ===
    let globalChartData = [];
    let globalTotal = 0;

    async function loadData() {
      const urlApi = getApiUrl();
      if (!urlApi.includes('script.google.com')) return alert('Konfigurasi URL API salah!');
      
      // 1. TAMPILKAN SKELETON
      document.getElementById('totalPengeluaran').classList.add('hidden');
      document.getElementById('skeleton-total').classList.remove('hidden');
      
      document.getElementById('pieChart').classList.add('hidden');
      document.getElementById('skeleton-chart').classList.remove('hidden');
      
      document.getElementById('kategori-header').classList.add('hidden'); // Sembunyikan chips
      document.getElementById('kategori-list-container').classList.add('hidden');
      document.getElementById('skeleton-list').classList.remove('hidden');

      const bulan = document.getElementById('filterBulan').value;
      const tahun = document.getElementById('filterTahun').value;

      try {
        const response = await fetch(`${urlApi}?bulan=${bulan}&tahun=${tahun}`);
        const data = await response.json();
        
        // 2. TAMPILKAN DATA ASLI
        document.getElementById('skeleton-total').classList.add('hidden');
        document.getElementById('totalPengeluaran').classList.remove('hidden');
        
        document.getElementById('skeleton-chart').classList.add('hidden');
        document.getElementById('pieChart').classList.remove('hidden');
        
        document.getElementById('skeleton-list').classList.add('hidden');
        document.getElementById('kategori-header').classList.remove('hidden'); // Tampilkan chips
        document.getElementById('kategori-list-container').classList.remove('hidden');
        
        document.getElementById('totalPengeluaran').innerText = 'Rp ' + data.total.toLocaleString('id-ID');
        renderChart(data.kategori);
      } catch (error) {
        document.getElementById('skeleton-total').classList.add('hidden');
        document.getElementById('totalPengeluaran').classList.remove('hidden');
        document.getElementById('skeleton-chart').classList.add('hidden');
        document.getElementById('pieChart').classList.remove('hidden');
        document.getElementById('skeleton-list').classList.add('hidden');
        document.getElementById('kategori-header').classList.remove('hidden');
        document.getElementById('kategori-list-container').classList.remove('hidden');
        
        showToast('Gagal memuat data dari server.', false);
        console.error(error);
      }
    }

    function renderChart(dataKategori) {
      const labels = Object.keys(dataKategori);
      const dataValues = Object.values(dataKategori);
      const chartColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#008080', '#3b82f6', '#a855f7', '#ec4899', '#64748b'];

      if (myChart != null) myChart.destroy();

      const ctx = document.getElementById('pieChart').getContext('2d');
      globalTotal = dataValues.reduce((a, b) => a + b, 0);

      // Simpan data ke variabel global agar bisa disortir kapan saja tanpa memanggil API lagi
      globalChartData = labels.map((label, index) => {
        return {
          nama: label,
          jumlah: dataValues[index],
          warna: chartColors[index % chartColors.length] // Simpan warna agar tidak tertukar saat disortir
        };
      });

      // Render Grafik Chart.js
      myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: chartColors,
            borderWidth: 2,
            borderColor: '#1f2937' 
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { 
            legend: { 
              position: 'bottom',
              labels: { color: '#d1d5db', padding: 15, boxWidth: 15 }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(1);
                  const formattedValue = 'Rp ' + value.toLocaleString('id-ID');
                  return `${label}: ${percentage}% (${formattedValue})`;
                }
              }
            }
          } 
        }
      });

      // Panggil fungsi sortir (default: Tertinggi)
      sortKategori('desc');
    }

    // === FUNGSI BARU: SORTIR KATEGORI ===
    function sortKategori(tipe) {
      const btnDesc = document.getElementById('btn-sort-desc');
      const btnAsc = document.getElementById('btn-sort-asc');
      const container = document.getElementById('kategori-list-container');

      // Ubah gaya tombol (aktif/tidak aktif) dan lakukan penyortiran
      if (tipe === 'desc') {
        btnDesc.className = "px-3 py-1 text-xs font-semibold rounded-full bg-[#008080] text-white transition focus:outline-none";
        btnAsc.className = "px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition focus:outline-none";
        
        // Sortir dari terbesar ke terkecil
        globalChartData.sort((a, b) => b.jumlah - a.jumlah);
      } else {
        btnAsc.className = "px-3 py-1 text-xs font-semibold rounded-full bg-[#008080] text-white transition focus:outline-none";
        btnDesc.className = "px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition focus:outline-none";
        
        // Sortir dari terkecil ke terbesar
        globalChartData.sort((a, b) => a.jumlah - b.jumlah);
      }

      // Bersihkan list dan render ulang
      container.innerHTML = '';
      
      globalChartData.forEach(item => {
        const percentage = globalTotal === 0 ? 0 : ((item.jumlah / globalTotal) * 100).toFixed(1);
        const categoryRowHtml = `
          <div class="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700 relative z-10">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full" style="background-color: ${item.warna}"></div>
              <span class="text-sm font-medium text-gray-200">${item.nama}</span>
            </div>
            <div class="text-right">
              <span class="text-sm font-semibold text-white">Rp ${item.jumlah.toLocaleString('id-ID')}</span>
              <span class="text-xs text-gray-400 block">${percentage}%</span>
            </div>
          </div>
        `;
        container.innerHTML += categoryRowHtml;
      });
    }

async function submitForm(event) {
  event.preventDefault();
  
  const btn = document.getElementById('btnSubmit');
  btn.innerText = 'Menyimpan...';
  btn.disabled = true;

  const data = {
    nama: document.getElementById('nama').value,
    jumlah: document.getElementById('jumlah').value,
    kategori: document.getElementById('kategori').value
  };

  try {
    await fetch(getApiUrl(), {
      method: 'POST',
      mode: 'no-cors', 
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });

    // Reset Form dan Pindah Halaman
    document.getElementById('formTransaksi').reset();
    pindahPage('page-dashboard');
    loadData();
    
    // MUNCULKAN TOAST SUKSES (Warna Hijau)
    showToast('Transaksi berhasil ditambahkan', true);

  } catch (error) {
    console.error(error);
    
    // MUNCULKAN TOAST ERROR (Warna Merah)
    showToast('Transaksi gagal ditambahkan, tunggu beberapa saat lalu coba lagi nanti', false);
    
  } finally {
    // Mengembalikan tombol ke kondisi awal
    btn.innerText = 'Tambahkan Transaksi';
    btn.disabled = false;
  }
}

// === FUNGSI CUSTOM DROPDOWN ===
function toggleList(id) {
    document.getElementById(id).classList.toggle('hidden');
}

function pilihBulan(nilai, teks) {
    document.getElementById('filterBulan').value = nilai;
    document.getElementById('text-bulan').innerText = teks;
    document.getElementById('list-bulan').classList.add('hidden');
    loadData(); 
}

function pilihTahun(nilai, teks) {
    document.getElementById('filterTahun').value = nilai;
    document.getElementById('text-tahun').innerText = teks;
    document.getElementById('list-tahun').classList.add('hidden');
    loadData(); 
}

function showKategori() {
    document.getElementById('list-kategori').classList.remove('hidden');
}

function pilihKategori(nilai) {
    document.getElementById('kategori').value = nilai;
    document.getElementById('list-kategori').classList.add('hidden');
}

function filterKategori() {
    const input = document.getElementById('kategori').value.toLowerCase();
    const list = document.getElementById('list-kategori');
    const items = list.getElementsByTagName('li');
    
    list.classList.remove('hidden');

    for (let i = 0; i < items.length; i++) {
    let text = items[i].innerText.toLowerCase();
    if (text.includes(input)) {
        items[i].style.display = ""; 
    } else {
        items[i].style.display = "none"; 
    }
    }
}

document.addEventListener('click', function(event) {
    const inputKategori = document.getElementById('kategori');
    const listKategori = document.getElementById('list-kategori');
    if (inputKategori && listKategori && !inputKategori.contains(event.target) && !listKategori.contains(event.target)) {
    listKategori.classList.add('hidden');
    }

    const containerBulan = document.getElementById('dropdown-bulan-container');
    const listBulan = document.getElementById('list-bulan');
    if (containerBulan && listBulan && !containerBulan.contains(event.target)) {
    listBulan.classList.add('hidden');
    }

    const containerTahun = document.getElementById('dropdown-tahun-container');
    const listTahun = document.getElementById('list-tahun');
    if (containerTahun && listTahun && !containerTahun.contains(event.target)) {
    listTahun.classList.add('hidden');
    }
});

// === FUNGSI TOAST NOTIFICATION ===
function showToast(pesan, isSuccess) {
const toast = document.getElementById('toast-notification');
const toastMsg = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');

// Set teks pesan
toastMsg.innerText = pesan;

// Atur warna dan ikon berdasarkan status (sukses atau gagal)
if (isSuccess) {
    toast.className = "fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm px-4 py-3 rounded-lg shadow-2xl transition-all duration-300 flex items-center gap-3 bg-green-600/95 border border-green-500 backdrop-blur-sm pointer-events-none";
    // Ikon Centang (Sukses)
    toastIcon.innerHTML = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
} else {
    toast.className = "fixed top-5 left-1/2 transform -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm px-4 py-3 rounded-lg shadow-2xl transition-all duration-300 flex items-center gap-3 bg-red-600/95 border border-red-500 backdrop-blur-sm pointer-events-none";
    // Ikon Silang (Error)
    toastIcon.innerHTML = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
}

// Animasi Masuk (Tampil)
// setTimeout pendek digunakan agar browser sempat me-render class warna sebelum menjalankan animasi transisi
setTimeout(() => {
    toast.classList.remove('opacity-0', '-translate-y-10');
    toast.classList.add('opacity-100', 'translate-y-0');
}, 10);

// Animasi Keluar (Sembunyi setelah 3 detik)
setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-10');
}, 3000);
}