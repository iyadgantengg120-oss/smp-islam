const form = document.getElementById("formLogin");
const kotakError = document.getElementById("loginError");
const tombol = document.getElementById("tombolMasuk");

function tampilError(teks) {
  kotakError.textContent = teks;
  kotakError.hidden = false;
}

// Kalau sudah login, langsung ke dashboard
(async function cekSesi() {
  try {
    const { data } = await db.auth.getSession();
    if (data.session) location.replace("dashboard.html");
  } catch (err) {
    console.error(err);
  }
})();

if (new URLSearchParams(location.search).get("akses") === "ditolak") {
  tampilError("Akun ini tidak memiliki akses admin.");
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  kotakError.hidden = true;

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    tampilError("Isi email dan password dulu.");
    return;
  }

  tombol.disabled = true;
  tombol.textContent = "MEMERIKSA...";

  try {
    const { error } = await db.auth.signInWithPassword({ email: email, password: password });
    if (error) {
      tampilError("Email atau password salah.");
      tombol.disabled = false;
      tombol.textContent = "MASUK";
      return;
    }
    location.replace("dashboard.html");
  } catch (err) {
    console.error(err);
    tampilError("Tidak bisa terhubung ke server. Periksa koneksi internet.");
    tombol.disabled = false;
    tombol.textContent = "MASUK";
  }
});