
const TOUR_URL = "";
const DEBUG_HOTSPOT = false;
const SCENES = [
  {
    id: "gerbang",
    judul: "Gedung & Halaman",
    file: "img/360/gedung.png",
    hotspots: [
      { ke: "lapangan", yaw: 90, pitch: 0, teks: "Ke Lapangan" }
    ]
  },
  {
    id: "lapangan",
    judul: "Lapangan",
    file: "img/360/lapangan.jpeg",
    hotspots: [
      { ke: "gerbang", yaw: -90, pitch: 0, teks: "Ke Gedung" },
      { ke: "laboratorium", yaw: 90, pitch: 0, teks: "Ke Laboratorium" }
    ]
  },
  {
    id: "laboratorium",
    judul: "Laboratorium",
    file: "img/360/laboratorium.jpeg",
    hotspots: [
      { ke: "lapangan", yaw: -90, pitch: 0, teks: "Ke Lapangan" },
      { ke: "perpustakaan", yaw: 90, pitch: 0, teks: "Ke Perpustakaan" }
    ]
  },
  {
    id: "perpustakaan",
    judul: "Perpustakaan",
    file: "img/360/perpus.jpeg",
    hotspots: [
      { ke: "laboratorium", yaw: -90, pitch: 0, teks: "Ke Laboratorium" }
    ]
  }
];

// =====================================================
//  KODE PENGGERAK (tidak perlu diubah)
// =====================================================

const stage = document.getElementById("tourStage");
const tombolMulai = document.getElementById("mulaiTour");
const catatan = document.getElementById("tourNote");
const daftarScene = document.getElementById("daftarScene");
const bantuan = document.getElementById("tourHelp");

let viewer = null;
let sceneAda = [];

// Cek apakah file panorama benar-benar ada
async function adaFile(url) {
  try {
    const respon = await fetch(url, { method: "HEAD" });
    return respon.ok;
  } catch (err) {
    return false;
  }
}

function tandaiAktif(id) {
  daftarScene.querySelectorAll(".scene-btn").forEach(function (b) {
    b.classList.toggle("active", b.dataset.id === id);
  });
}

function buatTombolRuangan() {
  daftarScene.innerHTML = "";

  sceneAda.forEach(function (s) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "scene-btn";
    b.dataset.id = s.id;
    b.textContent = s.judul;
    b.addEventListener("click", function () {
      viewer.loadScene(s.id);
      tandaiAktif(s.id);
    });
    daftarScene.appendChild(b);
  });

  daftarScene.hidden = false;
  bantuan.hidden = false;
  tandaiAktif(sceneAda[0].id);
}

function bangunViewer() {
  stage.innerHTML = '<div id="panorama"></div>';

  const config = {};
  sceneAda.forEach(function (s) {
    config[s.id] = {
      title: s.judul,
      type: "equirectangular",
      panorama: s.file,
      haov: s.haov || 360,
      vaov: s.vaov || 180,
      hotSpots: (s.hotspots || [])
        .filter(function (h) {
          return sceneAda.some(function (x) { return x.id === h.ke; });
        })
        .map(function (h) {
          return { pitch: h.pitch, yaw: h.yaw, type: "scene", text: h.teks, sceneId: h.ke };
        })
    };
  });

  viewer = pannellum.viewer("panorama", {
    default: {
      firstScene: sceneAda[0].id,
      autoLoad: true,
      hfov: 100,
      sceneFadeDuration: 800
    },
    scenes: config,
    hotSpotDebug: DEBUG_HOTSPOT
  });

  viewer.on("scenechange", tandaiAktif);
  buatTombolRuangan();
}

async function mulaiTour() {
  // Cara A: tur dari layanan luar
  if (TOUR_URL) {
    stage.innerHTML =
      '<iframe src="' + TOUR_URL + '" allowfullscreen loading="lazy" title="Virtual Tour SMP Islam Parung"></iframe>';
    return;
  }

  // Cara B: panorama lokal
  if (typeof pannellum === "undefined") {
    catatan.textContent = "Penampil 360° gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.";
    catatan.hidden = false;
    return;
  }

  tombolMulai.disabled = true;
  tombolMulai.textContent = "Memuat...";

  const hasilCek = await Promise.all(SCENES.map(function (s) { return adaFile(s.file); }));
  sceneAda = SCENES.filter(function (s, i) { return hasilCek[i]; });

  if (!sceneAda.length) {
    catatan.hidden = false;
    tombolMulai.disabled = false;
    tombolMulai.textContent = "Mulai Jelajah";
    return;
  }

  bangunViewer();
}

tombolMulai.addEventListener("click", mulaiTour);