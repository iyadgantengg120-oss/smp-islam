// ====== DATA BERITA (tambah berita baru di sini) ======
const dataBerita = [
  {
    judul: "Siswa SMP Islam Parung Raih Juara 1 Pencak Silat Tingkat Nasional",
    tanggal: "7 September 2026",
    kategori: "Prestasi",
    gambar: "img/juara1.jpeg",
    ringkasan: "Prestasi membanggakan siswa SMP Islam Parung di ajang pencak silat tingkat nasional."
  },
  {
    judul: "Siswa SMP Islam Parung Raih Medali Emas Olimpiade Pelajar Berprestasi Nusantara",
    tanggal: "7 September 2026",
    kategori: "Prestasi",
    gambar: "img/sk1.jpeg",
    ringkasan: "Siswa SMP Islam Parung meraih medali emas dalam Olimpiade Pelajar Berprestasi Nusantara."
  },
  {
    judul: "Paskibra SMP Islam Parung Raih Empat Prestasi di Tingkat Provinsi Jawa Barat",
    tanggal: "7 September 2026",
    kategori: "Prestasi",
    gambar: "img/paskib1.jpg",
    ringkasan: "Paskibra SMP Islam Parung membawa pulang empat prestasi dari tingkat Provinsi Jawa Barat."
  },
  {
    judul: "SMP Islam Parung Raih Juara 1 Futsal di FORKOM League 1",
    tanggal: "16 Desember 2025",
    kategori: "Prestasi",
    gambar: "img/futsal1.jpeg",
    ringkasan: "Tim futsal SMP Islam Parung menjadi juara 1 pada kompetisi FORKOM League 1."
  },
  {
    judul: "Kegiatan Pelatihan Bela Diri Siswa SMP Islam Parung",
    tanggal: "6 September 2025",
    kategori: "Ekstrakurikuler",
    gambar: "img/tekondo.jpg",
    ringkasan: "Siswa berlatih bela diri sebagai bagian dari kegiatan ekstrakurikuler sekolah."
  },
  {
    judul: "Peringatan Isra Mi'raj di SMP Islam Parung",
    tanggal: "16 Desember 2025",
    kategori: "Kegiatan",
    gambar: "img/ISRA-MIRAJ-2026-1024x576.jpg",
    ringkasan: "Kegiatan peringatan Isra Mi'raj di lingkungan SMP Islam Parung."
  }
];

// ====== TAMPILKAN & CARI ======
const daftarBerita = document.getElementById("beritaList");
const kotakCari = document.getElementById("cariBerita");
const pesanKosong = document.getElementById("beritaKosong");

function tampilkan(list) {
  daftarBerita.innerHTML = list.map(function (b) {
    const foto = b.gambar
      ? '<div class="berita-img"><img src="' + b.gambar + '" alt="' + b.judul + '"></div>'
      : '<div class="berita-img placeholder">Foto segera hadir</div>';
    const label = b.tanggal ? b.kategori + " • " + b.tanggal : b.kategori;

    return (
      '<article class="berita-card">' +
        foto +
        '<div class="berita-body">' +
          '<span class="berita-tanggal">' + label + "</span>" +
          "<h3>" + b.judul + "</h3>" +
          "<p>" + b.ringkasan + "</p>" +
        "</div>" +
      "</article>"
    );
  }).join("");

  pesanKosong.hidden = list.length > 0;
}

kotakCari.addEventListener("input", function () {
  const kata = kotakCari.value.toLowerCase().trim();
  const hasil = dataBerita.filter(function (b) {
    return (b.judul + " " + b.ringkasan + " " + b.kategori).toLowerCase().includes(kata);
  });
  tampilkan(hasil);
});

tampilkan(dataBerita);