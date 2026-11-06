// Filter galeri: ALL / EKSTRAKURIKULER / KEGIATAN
const tombolFilter = document.querySelectorAll(".filter-btn");
const itemGaleri = document.querySelectorAll(".galeri-item");

tombolFilter.forEach(function (tombol) {
  tombol.addEventListener("click", function () {
    tombolFilter.forEach(function (t) { t.classList.remove("active"); });
    tombol.classList.add("active");

    const pilihan = tombol.dataset.filter;

    itemGaleri.forEach(function (item) {
      item.hidden = !(pilihan === "all" || item.dataset.kategori === pilihan);
    });
  });
});