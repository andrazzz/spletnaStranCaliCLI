/** Galerija: fotografije iz public/slike ali, dokler jih ni, risbi v merilu. Povečava ob kliku. */
import { $, esc, naStrezniku, naloziJson } from "./pomozne.js";
import { risbaCelo, risbaTloris } from "./risbe/galerija-risbe.js";

let fotografije = [];

const figura = (src, opis, slika) =>
  `<figure><button type="button" data-povecaj="${esc(src)}" aria-label="Povečaj: ${esc(opis)}">${slika}</button>${opis ? `<figcaption>${esc(opis)}</figcaption>` : ""}</figure>`;

/** Naloži seznam fotografij (API ali statični slike.json). */
export async function postaviGalerijo() {
  const seznam = naStrezniku ? await naloziJson(["/api/slike", "slike/slike.json"]) : null;
  fotografije = Array.isArray(seznam) ? seznam : [];
  const opomba = $("#galerija-opomba");

  if (!fotografije.length) {
    opomba.textContent = "Fotografij še ni, zato sta tu risbi v merilu. Fotografije dodajte v mapo public/slike in osvežite stran.";
    return;
  }
  opomba.textContent = "";
  $("#galerija-mreza").innerHTML = fotografije
    .map((src, i) => figura(src, "", `<img src="${esc(src)}" alt="Kuhinja Cali, fotografija ${i + 1}" loading="lazy">`))
    .join("");
}

/** Ko ni fotografij, nariše risbi v izbranih barvah. */
export function osveziRisbe(barve, ograjica) {
  if (fotografije.length) return;
  const risbe = [
    [risbaCelo(barve, ograjica), "Čelo z zloženo poličko in pospravljeno palico"],
    [risbaTloris(barve, ograjica), "Tloris: dve indukciji na pultu in odprta polička"],
  ];
  $("#galerija-mreza").innerHTML = risbe.map(([src, opis]) => figura(src, opis, `<img src="${src}" alt="${esc(opis)}">`)).join("");
}

/** Povečava slike čez celo okno; zapre se s klikom ob strani, gumbom × ali tipko Esc. */
export function postaviPovecavo() {
  const ov = $("#povecava");
  const img = $("img", ov);
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-povecaj]");
    if (b) {
      img.src = b.dataset.povecaj;
      img.alt = b.querySelector("img")?.alt || "";
      ov.hidden = false;
      return;
    }
    if (!ov.hidden && (e.target === ov || e.target.closest(".zapri"))) ov.hidden = true;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") ov.hidden = true;
  });
}
