/** Izpolni besedila strani iz podatkov o izdelku. */
import { $, $$, esc, evri } from "./pomozne.js";

/** Kateri razdelek kuhinje (zadaj/spredaj) hrani kateri del vsebine. */
const RAZDELEK = { lonci: "spredaj", pribor: "spredaj", krozniki: "zadaj", zaboj: "zadaj" };

export function izpolniVsebino(d) {
  $$('[data-polje="ime"]').forEach((el) => (el.textContent = d.ime));
  $$('[data-polje="opis"]').forEach((el) => (el.textContent = d.opis));
  $$('[data-polje="cena-od"]').forEach((el) => (el.textContent = evri.format(d.osnovna_cena)));

  $("#hitre-mere").innerHTML = d.hitre_mere
    .map((m) => `<li><b>${esc(m.vrednost)}${m.enota ? `<small>${esc(m.enota)}</small>` : ""}</b><span>${esc(m.oznaka)}</span></li>`)
    .join("");

  $("#lastnosti-seznam").innerHTML = d.lastnosti
    .map((l, i) => `<article class="lastnost"><span class="st">${String(i + 1).padStart(2, "0")}</span><h3>${esc(l.naslov)}</h3><p>${esc(l.opis)}</p></article>`)
    .join("");

  $("#razdelki").innerHTML = d.razdelki
    .map((r) => {
      const stran = RAZDELEK[r.id] || "";
      return `<li data-razdelek="${stran}" data-ukaz="${stran}" role="button" tabindex="0"><h3>${esc(r.ime)}</h3>
        <p>${esc(r.kje)} · ${esc(r.mera)}</p><p>Nosi: ${esc(r.nosi)}</p></li>`;
    })
    .join("");

  $("#specifikacije").innerHTML = d.specifikacije
    .map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join("");
}
