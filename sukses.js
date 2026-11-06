let hasil = null;

try {
  hasil = JSON.parse(sessionStorage.getItem("ppdb_terakhir"));
} catch (err) {}

if (!hasil || !hasil.nomor) {
  window.location.replace("daftar.html");
} else {
  document.getElementById("nomorPendaftaran").textContent = hasil.nomor;
  document.getElementById("namaPendaftar").textContent = hasil.nama || "calon siswa";
}