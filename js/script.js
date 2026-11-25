// Navbar: beri bayangan saat halaman di-scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10));

// Footer: tahun otomatis
document.getElementById('year').textContent = new Date().getFullYear();

// Menu: filter berdasarkan kategori
const filter = document.getElementById('filter');
if (filter) {
  filter.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    filter.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('#menuList .item').forEach(item => {
      item.classList.toggle('d-none', btn.dataset.filter !== 'semua' && item.dataset.cat !== btn.dataset.filter);
    });
  });
}

// Galeri: tampilkan foto yang diklik di modal
const foto = document.getElementById('foto');
if (foto) {
  foto.addEventListener('show.bs.modal', e => {
    const img = e.relatedTarget.querySelector('img');
    document.getElementById('fotoBesar').src = img.src;
    document.getElementById('fotoBesar').alt = img.alt;
    document.getElementById('fotoJudul').textContent = img.alt;
  });
}

// Kontak: validasi form
const form = document.getElementById('form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (form.checkValidity()) {
      document.getElementById('sukses').classList.remove('d-none');
      form.reset();
      form.classList.remove('was-validated');
    }
  });
}


// ===== Catat pesanan (disimpan di localStorage) =====
const formPesanan = document.getElementById('formPesanan');
if (formPesanan) {
  const KUNCI = 'pesananKaledo';
  const daftar = document.getElementById('daftarPesanan');
  const kosong = document.getElementById('kosong');
  const totalEl = document.getElementById('totalPesanan');
  let pesanan = [];

  // Ambil data yang sudah tersimpan
  try { pesanan = JSON.parse(localStorage.getItem(KUNCI)) || []; } catch (e) {}

  const rupiah = n => 'Rp ' + n.toLocaleString('id-ID');
  const simpan = () => { try { localStorage.setItem(KUNCI, JSON.stringify(pesanan)); } catch (e) {} };

  // ----- Pembayaran -----
  const idInfo = { Cash: 'infoCash', Transfer: 'infoTf', QR: 'infoQr' };
  const pesanBayar = {
    Cash: 'Silakan bayar di kasir.',
    Transfer: 'Silakan transfer ke rekening yang tertera lalu kirim bukti transfer.',
    QR: 'Silakan scan kode QR yang tertera.'
  };

  // Tampilkan info sesuai metode yang dipilih
  document.getElementById('metodeBayar').addEventListener('change', () => {
    const pilih = document.querySelector('input[name="metode"]:checked').value;
    Object.keys(idInfo).forEach(m => {
      document.getElementById(idInfo[m]).classList.toggle('d-none', m !== pilih);
    });
  });

 
  // Tombol bayar
  const struk = document.getElementById('strukBayar');
  const modalBerhasil = new bootstrap.Modal(document.getElementById('modalBerhasil'));

  document.getElementById('bayar').addEventListener('click', () => {
    // Kalau belum ada pesanan, tampilkan peringatan
    if (pesanan.length === 0) {
      struk.className = 'alert alert-warning mt-3';
      struk.textContent = 'Belum ada pesanan. Simpan pesanan dulu sebelum membayar.';
      return;
    }
    struk.className = 'd-none';

    const metode = document.querySelector('input[name="metode"]:checked').value;
    const total = pesanan.reduce((jumlah, p) => jumlah + p.harga * p.jumlah, 0);

    // Isi struk
    document.getElementById('sNo').textContent = 'KLD-' + String(Date.now()).slice(-6);
    document.getElementById('sWaktu').textContent = new Date().toLocaleString('id-ID');
    document.getElementById('sNama').textContent = pesanan[0].nama;
    document.getElementById('sMetode').textContent = metode;
    document.getElementById('sTotal').textContent = rupiah(total);

    const daftarItem = document.getElementById('sItem');
    daftarItem.innerHTML = '';
    pesanan.forEach(p => {
      const li = document.createElement('li');
      const kiri = document.createElement('span');
      const kanan = document.createElement('span');
      kiri.textContent = p.jumlah + ' x ' + p.menu;
      kanan.textContent = rupiah(p.harga * p.jumlah);
      li.append(kiri, kanan);
      daftarItem.appendChild(li);
    });

    // Tampilkan jendela berhasil, lalu kosongkan daftar pesanan
    modalBerhasil.show();
    pesanan = [];
    simpan();
    tampil();
  });


  // Tampilkan daftar pesanan dan total
  function tampil() {
    daftar.innerHTML = '';
    let total = 0;

    pesanan.forEach(p => {
      const subtotal = p.harga * p.jumlah;
      total += subtotal;

      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-start gap-3';

      const isi = document.createElement('div');
      const judul = document.createElement('div');
      judul.className = 'nama-menu';
      judul.textContent = p.jumlah + ' x ' + p.menu + ' = ' + rupiah(subtotal);
      const info = document.createElement('div');
      info.className = 'catatan';
      info.textContent = 'Atas nama ' + p.nama + (p.catatan ? ' | ' + p.catatan : '');
      isi.append(judul, info);

      const tombol = document.createElement('button');
      tombol.type = 'button';
      tombol.className = 'btn-hapus';
      tombol.dataset.id = p.id;
      tombol.textContent = 'Hapus';

      li.append(isi, tombol);
      daftar.appendChild(li);
    });

    kosong.classList.toggle('d-none', pesanan.length > 0);
    totalEl.textContent = rupiah(total);
  }

  // Simpan pesanan baru
  formPesanan.addEventListener('submit', e => {
    e.preventDefault();
    formPesanan.classList.add('was-validated');
    
    if (!formPesanan.checkValidity()) return;

    const menu = document.getElementById('pMenu');
    pesanan.push({
      id: Date.now(),
      nama: document.getElementById('pNama').value.trim(),
      menu: menu.value,
      harga: Number(menu.selectedOptions[0].dataset.harga),
      jumlah: Number(document.getElementById('pJumlah').value),
      catatan: document.getElementById('pCatatan').value.trim()
    });
    simpan();
    tampil();

    formPesanan.reset();
    formPesanan.classList.remove('was-validated');
  });

  // Hapus satu pesanan
  daftar.addEventListener('click', e => {
    const tombol = e.target.closest('.btn-hapus');
    if (!tombol) return;
    pesanan = pesanan.filter(p => String(p.id) !== tombol.dataset.id);
    simpan();
    tampil();
  });

  // Hapus semua pesanan
  document.getElementById('hapusSemua').addEventListener('click', () => {
    if (pesanan.length && confirm('Hapus semua pesanan?')) {
      pesanan = [];
      simpan();
      tampil();
    }
  });

  tampil();
}



