/**
 * Vstopna točka strani. Naloži podatke in poveže module med seboj.
 * Podatki: /api/izdelek (Clojure strežnik) ali data/izdelek.json (statično, iz `bb build`).
 */
import { $, naStrezniku, naloziJson } from "./pomozne.js";
import { izpolniVsebino } from "./vsebina.js";
import { postaviKonfigurator, trenutnaIzbira } from "./konfigurator.js";
import { postaviGalerijo, osveziRisbe, postaviPovecavo } from "./galerija.js";
import { postaviObrazec } from "./obrazec.js";
import {
  postaviSceno, nastaviCilj, nastaviTakoj, samodejniPrikaz, obSpremembiStanja, osveziKrmilo,
} from "./risbe/scena.js";

function pokaziNapako() {
  $("main").insertAdjacentHTML(
    "afterbegin",
    `<p class="ovoj opozorilo">Podatkov ni bilo mogoče naložiti. Zaženite <code>bb serve</code> in odprite http://localhost:8080.</p>`,
  );
}

function povezDogodke() {
  // gumbi, vrata in polička v sceni ter kartice razdelkov imajo data-ukaz
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-ukaz]");
    if (el?.dataset.ukaz) nastaviCilj(el.dataset.ukaz);
  });
  $("#razdelki").addEventListener("keydown", (e) => {
    const li = e.target.closest("li[data-ukaz]");
    if (li && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      nastaviCilj(li.dataset.ukaz);
    }
  });
}

async function zagon() {
  const izdelek = await naloziJson(naStrezniku ? ["/api/izdelek", "data/izdelek.json"] : ["data/izdelek.json"]);
  if (!izdelek) return pokaziNapako();

  izpolniVsebino(izdelek);
  await postaviGalerijo();
  postaviKonfigurator(izdelek, ({ barve, ograjica }) => {
    postaviSceno(barve, ograjica);
    osveziRisbe(barve, ograjica);
  });
  postaviPovecavo();
  postaviObrazec(trenutnaIzbira);
  obSpremembiStanja(osveziKrmilo);
  povezDogodke();

  // ?prikaz=polica,zadaj,mere takoj nastavi stanje (za deljenje povezave do pogleda)
  const prikaz = new URLSearchParams(location.search).get("prikaz");
  if (prikaz) nastaviTakoj(prikaz.split(",").map((s) => s.trim()));
  else samodejniPrikaz($(".oder"));
}

zagon();
