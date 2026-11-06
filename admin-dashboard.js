(function () {
  function getDb() {
    if (typeof supabaseClient !== 'undefined') return supabaseClient;
    if (typeof db !== 'undefined') return db;
    if (typeof sb !== 'undefined') return sb;
    if (typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined')
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    throw new Error('config.js belum dikenali. Lihat komentar di atas getDb().');
  }
  const adminDb = getDb();
  const TABEL = 'pendaftar';
  const BUCKET = 'berkas-ppdb';
  const $ = (id) => document.getElementById(id);
  let rows = [];

  const KAND = {
    jk: ['jenis_kelamin', 'jk', 'gender', 'kelamin'],
    asal: ['asal_sekolah', 'asal_sd', 'asal_sd_mi', 'sekolah_asal', 'asal'],
    jalur: ['jalur', 'jalur_pendaftaran', 'jalur_daftar'],
    hp: ['hp_ortu', 'no_hp_ortu', 'hp_orang_tua', 'telp_ortu', 'no_hp', 'hp', 'telepon']
  };
  function ambil(r, list) {
    for (const k of list) if (r[k] !== undefined && r[k] !== null && r[k] !== '') return r[k];
    return '';
  }
  const label = (k) => k.replace(/_/g, ' ');
  const tgl = (v) => (v ? new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–');
  const tglWaktu = (v) => (v ? new Date(v).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '–');
  const jalurTeks = (r) => String(ambil(r, KAND.jalur)).toLowerCase();
  function lp(r) {
    const v = String(ambil(r, KAND.jk)).trim().toLowerCase();
    return v.startsWith('l') ? 'L' : v.startsWith('p') ? 'P' : (v ? v : '–');
  }
  const teks = (v) => (v === '' || v === null || v === undefined ? '–' : String(v));

  async function mulai() {
    const { data } = await adminDb.auth.getSession();
    if (!data.session) { location.replace('login.html'); return; }
    $('emailAdmin').textContent = data.session.user.email;
    await muat();
  }

  async function muat() {
    const { data, error } = await adminDb.from(TABEL).select('*').order('created_at', { ascending: false });
    if (error) {
      $('pesanMuat').textContent = 'Gagal memuat data: ' + error.message + '. Pastikan policy SELECT untuk admin sudah dijalankan di Supabase.';
      return;
    }
    rows = data || [];
    $('pesanMuat').hidden = true;
    $('konten').hidden = false;
    statistik();
    gambar();
  }

  function statistik() {
    $('statTotal').textContent = rows.length;
    $('statReguler').textContent = rows.filter((r) => jalurTeks(r).includes('reguler')).length;
    $('statPrestasi').textContent = rows.filter((r) => jalurTeks(r).includes('prestasi')).length;
    $('statAfirmasi').textContent = rows.filter((r) => jalurTeks(r).includes('afirmasi')).length;
  }

  function tersaring() {
    const q = $('cari').value.trim().toLowerCase();
    const j = $('filterJalur').value.toLowerCase();
    return rows.filter((r) => {
      if (j && !jalurTeks(r).includes(j)) return false;
      return !q || Object.values(r).join(' ').toLowerCase().includes(q);
    });
  }

  function sel(isi) { const td = document.createElement('td'); td.textContent = isi; return td; }

  // Membuat link sementara (5 menit) untuk berkas di bucket privat, lalu membukanya
  async function bukaBerkas(path) {
    const jendela = window.open('', '_blank');
    const { data, error } = await adminDb.storage.from(BUCKET).createSignedUrl(path, 300);
    if (error || !data || !data.signedUrl) {
      if (jendela) jendela.close();
      alert('Gagal membuka berkas: ' + (error ? error.message : 'link tidak terbentuk'));
      return;
    }
    if (jendela) jendela.location.href = data.signedUrl;
    else alert('Pop-up diblokir browser. Izinkan pop-up untuk halaman ini, lalu coba lagi.');
  }

  function gambar() {
    const data = tersaring();
    const tbody = $('isiTabel');
    tbody.innerHTML = '';
    $('infoJumlah').textContent = 'Menampilkan ' + data.length + ' dari ' + rows.length + ' pendaftar';
    if (!data.length) {
      const tr = document.createElement('tr');
      const td = sel(rows.length ? 'Tidak ada data yang cocok.' : 'Belum ada pendaftar.');
      td.colSpan = 10; td.style.textAlign = 'center';
      tr.appendChild(td); tbody.appendChild(tr);
      return;
    }
    data.forEach((r, i) => {
      const tr = document.createElement('tr');
      tr.append(
        sel(i + 1), sel(teks(r.nomor)), sel(teks(r.nama)), sel(teks(r.nisn)), sel(lp(r)),
        sel(teks(ambil(r, KAND.asal))), sel(teks(ambil(r, KAND.jalur))), sel(teks(ambil(r, KAND.hp))),
        sel(tgl(r.created_at))
      );
      const aksi = document.createElement('td');
      aksi.className = 'kolom-aksi';
      const bDetail = document.createElement('button');
      bDetail.className = 'btn btn-navy btn-sm'; bDetail.textContent = 'Detail';
      bDetail.addEventListener('click', () => detail(r));
      const bHapus = document.createElement('button');
      bHapus.className = 'btn btn-outline btn-sm'; bHapus.textContent = 'Hapus';
      bHapus.addEventListener('click', () => hapus(r));
      aksi.append(bDetail, ' ', bHapus);
      tr.appendChild(aksi);
      tbody.appendChild(tr);
    });
  }

  function detail(r) {
    $('detailJudul').textContent = 'Detail: ' + teks(r.nama);
    const isi = $('detailIsi');
    isi.innerHTML = '';
    Object.keys(r).filter((k) => k !== 'id').forEach((k) => {
      const baris = document.createElement('div');
      baris.className = 'detail-row';
      const a = document.createElement('strong'); a.textContent = label(k) + ': ';
      const b = document.createElement('span');
      if (k.startsWith('berkas_') && r[k]) {
        const tombol = document.createElement('button');
        tombol.type = 'button';
        tombol.className = 'btn btn-navy btn-sm';
        tombol.textContent = 'Buka';
        tombol.addEventListener('click', () => bukaBerkas(r[k]));
        b.appendChild(tombol);
      } else {
        b.textContent = k.endsWith('_at') ? tglWaktu(r[k]) : teks(r[k]);
      }
      baris.append(a, b);
      isi.appendChild(baris);
    });
    $('detail').showModal();
  }

  async function hapus(r) {
    if (!confirm('Hapus data pendaftar "' + teks(r.nama) + '"? Tindakan ini tidak bisa dibatalkan.')) return;
    const { data, error } = await adminDb.from(TABEL).delete().eq('id', r.id).select();
    if (error) { alert('Gagal menghapus: ' + error.message); return; }
    if (!data || !data.length) { alert('Tidak ada data yang terhapus. Tambahkan policy DELETE untuk admin di Supabase.'); return; }
    rows = rows.filter((x) => x.id !== r.id);
    statistik(); gambar();
  }

  function unduhExcel() {
    const data = tersaring();
    if (!data.length) { alert('Tidak ada data untuk diunduh.'); return; }
    if (typeof XLSX === 'undefined') { alert('Library Excel belum termuat. Cek koneksi internet lalu muat ulang halaman.'); return; }
    const lembar = data.map((r, i) => {
      const o = { No: i + 1 };
      Object.keys(r).filter((k) => k !== 'id').forEach((k) => { o[label(k)] = k.endsWith('_at') ? tglWaktu(r[k]) : r[k]; });
      return o;
    });
    const ws = XLSX.utils.json_to_sheet(lembar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pendaftar');
    XLSX.writeFile(wb, 'pendaftar-ppdb-' + new Date().toISOString().slice(0, 10) + '.xlsx');
  }

  function cetak() {
    $('cetakJudul').textContent = 'Data Pendaftar PPDB SMP Islam Parung (' + new Date().toLocaleDateString('id-ID', { dateStyle: 'long' }) + ')';
    window.print();
  }

  $('cari').addEventListener('input', gambar);
  $('filterJalur').addEventListener('change', gambar);
  $('tombolExcel').addEventListener('click', unduhExcel);
  $('tombolCetak').addEventListener('click', cetak);
  $('tutupDetail').addEventListener('click', () => $('detail').close());
  $('tombolKeluar').addEventListener('click', async () => { await adminDb.auth.signOut(); location.replace('login.html'); });

  mulai();
})();