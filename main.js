// Statistik angka naik pelan-pelan saat terlihat di layar
const angkaStat = document.querySelectorAll(".stat-number");

function naikkanAngka(elemen) {
  const target = Number(elemen.dataset.target);
  const durasi = 1800;
  const mulai = performance.now();

  function langkah(sekarang) {
    const progres = Math.min((sekarang - mulai) / durasi, 1);
    elemen.textContent = Math.floor(progres * target);
    if (progres < 1) {
      requestAnimationFrame(langkah);
    } else {
      elemen.textContent = target;
    }
  }

  requestAnimationFrame(langkah);
}

const pengamat = new IntersectionObserver(function (daftar) {
  daftar.forEach(function (item) {
    if (item.isIntersecting) {
      naikkanAngka(item.target);
      pengamat.unobserve(item.target);
    }
  });
}, { threshold: 0.5 });

angkaStat.forEach(function (el) {
  pengamat.observe(el);
});