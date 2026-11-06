const form = document.getElementById("formPpdb");
const kotakError = document.getElementById("formError");
const tombolKirim = document.getElementById("tombolKirim");
const MAKS_MB = 2;
const BUCKET = "berkas-ppdb";
const BERKAS = ["berkas_kk", "berkas_akta", "berkas_ijazah", "berkas_pasfoto"];
const EKSTENSI = { "image/jpeg": "jpg", "image/png": "png", "application/pdf": "pdf" };

function tampilError(teks) {
  kotakError.textContent = teks;
  kotakError.hidden = false;
  kotakError.scrollIntoView({ behavior: "smooth", block: "center" });
}

function aktifkanTombol() {
  tombolKirim.disabled = false;
  tombolKirim.textContent = "KIRIM PENDAFTARAN";
}

function cekForm() {
  // Isian wajib (kecuali berkas, dicek terpisah)
  const wajib = form.querySelectorAll("[required]:not([type='file']):not([type='radio']):not([type='checkbox'])");
  for (const el of wajib) {
    if (!el.value.trim()) {
      el.focus();
      return "Mohon lengkapi: " + (form.querySelector('label[for="' + el.id + '"]')?.textContent.replace("*", "").replace("wajib", "").trim() || el.name);
    }
  }

  if (!form.querySelector('input[name="jenis_kelamin"]:checked')) {
    return "Mohon pilih jenis kelamin.";
  }

  if (!/^[0-9]{10}$/.test(form.nisn.value.trim())) {
    form.nisn.focus();
    return "NISN harus 10 digit angka.";
  }

  const polaHp = /^08[0-9]{8,12}$/;
  if (!polaHp.test(form.hp_siswa.value.trim())) {
    form.hp_siswa.focus();
    return "No. HP siswa tidak valid. Contoh: 081234567890";
  }
  if (!polaHp.test(form.hp_ortu.value.trim())) {
    form.hp_ortu.focus();
    return "No. HP orang tua tidak valid. Contoh: 081234567890";
  }

  // Berkas
  for (const f of form.querySelectorAll('input[type="file"]')) {
    const file = f.files[0];
    if (!file) return "Berkas " + f.dataset.label + " belum dipilih.";
    if (file.size > MAKS_MB * 1024 * 1024) {
      return "Berkas " + f.dataset.label + " lebih dari " + MAKS_MB + " MB.";
    }
    if (!EKSTENSI[file.type]) {
      return "Berkas " + f.dataset.label + " harus berformat JPG, PNG, atau PDF.";
    }
  }

  if (!form.setuju.checked) {
    return "Centang dulu pernyataan bahwa data yang kamu isi sudah benar.";
  }

  return "";
}

// Unggah 4 berkas ke folder privat, satu folder acak per pendaftar
async function unggahBerkas() {
  const folder = crypto.randomUUID();
  const lokasi = {};
  for (const nama of BERKAS) {
    const file = form[nama].files[0];
    const path = folder + "/" + nama + "." + EKSTENSI[file.type];
    const { error } = await db.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) throw error;
    lokasi[nama] = path;
  }
  return lokasi;
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  kotakError.hidden = true;

  const error = cekForm();
  if (error) {
    tampilError(error);
    return;
  }

  tombolKirim.disabled = true;
  tombolKirim.textContent = "MENGIRIM...";

  // Kumpulkan data teks
  const fd = new FormData(form);
  const data = {};
  fd.forEach(function (nilai, kunci) {
    if (nilai instanceof File) return;
    if (kunci === "ekskul") return;
    data[kunci] = nilai;
  });
  data.ekskul = fd.getAll("ekskul");

  // 1) Unggah berkas
  try {
    Object.assign(data, await unggahBerkas());
  
   } catch (err) {
    console.error("Gagal unggah berkas:", err);
    aktifkanTombol();
    tampilError("Pendaftaran gagal dikirim: " + (err.message || JSON.stringify(err)));
    return;
  }
  // 2) Simpan data, nomor pendaftaran dibuat oleh database
  const { data: nomor, error: galat } = await db.rpc("kirim_pendaftaran", { p: data });

    if (galat) {
    console.error("Gagal simpan data:", galat);
    aktifkanTombol();
    if (galat.code === "23505") {
      tampilError("NISN ini sudah terdaftar. Hubungi sekolah jika merasa ini keliru.");
    } else {
      tampilError("Gagal simpan data: " + (galat.message || JSON.stringify(galat)));
    }
    return;
  }

  try {
    sessionStorage.setItem("ppdb_terakhir", JSON.stringify({ nomor: nomor, nama: data.nama }));
  } catch (err) {}

  window.location.href = "sukses.html";
});