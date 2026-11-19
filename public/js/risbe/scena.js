/**
 * Interaktivni stranski pogled na kuhinjo pod posteljo, z animacijo.
 *
 * Lokalne koordinate kuhinje: x = dolžina (0 = zadnja stena, 84 = čelo),
 * z = višina od dna kuhinje navzgor. Skupina kuhinje je zrcaljena (scale 1 -1),
 * zato se z riše navzgor. Oznake so v svoji, nezrcaljeni skupini.
 */
import { $, $$, esc, manjGibanja } from "../pomozne.js";
import { LES, KOT_PALICE, pr, polnilo, definicije } from "./skupno.js";

const TLA_Y = 60;      // tla avta v koordinatah zaslona
const DVIG = 0.5;      // kuhinja je 5 mm nad tlemi
const IZVLEK_CM = 50;  // za koliko se kuhinja v prikazu izvleče

function markup(barve, ograjica) {
  const celo = polnilo(barve.celo);
  const tanko = `stroke="${LES.rob}" stroke-width="0.15"`;
  const sidrisca = [8.25, 23.185, 58.74].map((y) => 84 - y);

  const kuhinja = `
    ${pr(1, 1, 82, 42.8, LES.notri)}
    <g id="vsebina-zadaj">
      ${pr(1, 9, 40.5, 0.6, LES.topol, tanko)}
      ${pr(4, 9.6, 34, 20.5, "#9fc3cf", 'rx="1" opacity="0.85" stroke="#6f97a5" stroke-width="0.2"')}
      ${pr(6, 12, 30, 0.4, "#6f97a5", 'opacity="0.6"')}
      ${pr(1.3, 30.4, 39.9, 13.2, LES.topol, tanko)}
      ${[0, 1, 2, 3, 4].map((i) => pr(6, 31.2 + i * 0.9, 22, 0.5, "#f4f1ea", 'stroke="#c9c3b6" stroke-width="0.1"')).join("")}
      ${pr(30, 31, 3.5, 9, "#cfe3ea", 'opacity="0.9" rx="0.5"')}${pr(34.5, 31, 3.5, 9, "#cfe3ea", 'opacity="0.9" rx="0.5"')}
    </g>
    <g id="vsebina-spredaj">
      ${pr(50, 1, 28, 12, "#5d646b", 'rx="1.2"')}${pr(51.5, 13, 25, 9, "#737a82", 'rx="1.2"')}${pr(53, 22, 22, 8, "#8a9198", 'rx="1.2"')}
      ${pr(61, 30, 6, 1, "#3c4146", 'rx="0.4"')}
      ${pr(42.8, 36.6, 40, 7, LES.topol, tanko)}
      ${pr(48, 38.5, 12, 0.6, "#c0c6cc")}${pr(62, 38.5, 14, 0.6, "#c0c6cc")}${pr(48, 40.2, 20, 0.6, "#c0c6cc")}
    </g>

    <!-- stene: zadnja, pregrada, čelo, dno -->
    ${pr(0, 0, 1, 45, LES.topol, tanko)}
    ${pr(41.5, 1, 1, 42.8, LES.topol, tanko)}
    ${pr(83, 0, 1, 44.35, celo)}
    ${pr(0, 0, 84, 1, LES.topol, tanko)}

    <!-- spodnja stranica 12 mm × 8 cm s kosi na vodilu iz breze -->
    ${pr(0, 0, 84, 8, LES.topol, tanko)}
    ${sidrisca.map((x) => `<path d="M${x - 3} 0 V3.7 Q${x - 3} 4.9 ${x - 1.8} 4.9 H${x + 1.8} Q${x + 3} 4.9 ${x + 3} 3.7 V0 Z" fill="${LES.breza}" ${tanko}/>
        <circle cx="${x - 1.27}" cy="3.3" r="0.3" fill="${LES.kovinaTemna}"/><circle cx="${x + 1.27}" cy="3.3" r="0.3" fill="${LES.kovinaTemna}"/>`).join("")}

    <!-- letev za vrata spodaj, pult zgoraj -->
    ${pr(0, 8, 84, 0.9, LES.topol, tanko)}
    ${pr(0, 43.8, 84, 1.2, LES.topol, tanko)}
    ${pr(0, 44.8, 84, 0.25, barve.pult)}

    <!-- drsna vrata (zadnja tečejo v zunanjem utoru, zato so narisana zadnja) -->
    <g id="vrata-spredaj" class="klik" data-ukaz="spredaj">
      ${pr(42.1, 8.4, 41.4, 35.4, celo, 'rx="0.3" stroke="rgba(0,0,0,.35)" stroke-width="0.15"')}
      <circle cx="78.5" cy="26" r="1.5" fill="rgba(0,0,0,.45)"/>
    </g>
    <g id="vrata-zadaj" class="klik" data-ukaz="zadaj">
      ${pr(0.5, 8.4, 41.4, 35.4, celo, 'rx="0.3" stroke="rgba(0,0,0,.35)" stroke-width="0.15"')}
      <circle cx="5.5" cy="26" r="1.5" fill="rgba(0,0,0,.45)"/>
    </g>

    <!-- indukciji na pultu -->
    ${[4, 45].map((x) => `${pr(x, 45.05, 35, 6.95, "url(#steklo)", 'rx="0.8"')}${pr(x + 1, 51.6, 33, 0.4, "#55595e", 'rx="0.2"')}<circle cx="${x + 30}" cy="48" r="0.7" fill="#c4622d"/>`).join("")}

    ${ograjica ? pr(-1, 39, 1, 12, LES.topol, tanko) : ""}

    <!-- letev tečaja, preklopna polička, palica -->
    ${pr(84, 42.4, 1, 2, LES.topol, tanko)}
    <g id="palica-pospravljena">${pr(84, 9.2, 1.2, 4.5, LES.senca, 'rx="0.2"')}</g>
    <g id="palica"><line x1="84" y1="18.2" x2="${84 + 25.8 / Math.tan(KOT_PALICE)}" y2="44" stroke="${LES.senca}" stroke-width="1.2"/></g>
    <g id="polica" class="klik" data-ukaz="polica">
      ${pr(84.05, 14, 1, 30, celo, 'stroke="rgba(0,0,0,.35)" stroke-width="0.15"')}
    </g>

    <!-- notranji del vodila in rumena ročica -->
    ${pr(-17.6, -0.5, 101.6, 1.4, LES.kovina)}
    ${pr(84, -0.5, 3.5, 2.2, "#f2c230", 'rx="0.4"')}`;

  const y = (z) => TLA_Y - DVIG - z;
  const oznaka = (x, z, t) =>
    `<text x="${x}" y="${y(z)}" text-anchor="middle" font-size="2.3" font-weight="600" fill="#23262a" paint-order="stroke" stroke="rgba(255,255,255,.85)" stroke-width="0.7">${esc(t)}</text>`;
  const mera = (x1, y1, x2, y2, t, tx, ty, navpicno) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c4622d" stroke-width="0.25" marker-start="url(#pusc)" marker-end="url(#pusc)"/>
     <text x="${tx}" y="${ty}" font-size="2.4" font-weight="600" fill="#c4622d" text-anchor="middle" ${navpicno ? `transform="rotate(-90 ${tx} ${ty})"` : ""}>${t}</text>`;

  return `${definicije()}
    <defs><marker id="pusc" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6 z" fill="#c4622d"/></marker></defs>

    <!-- avto: tla, odbijač, zadnji steber, postelja -->
    ${pr(-52, TLA_Y, 140, 3, LES.tla)}
    ${pr(84, TLA_Y, 9, 6, "#383c40", 'rx="1.5"')}
    ${pr(88, -14, 3, 18, "#383c40", 'rx="1"')}
    ${pr(-52, -6, 137, 8.5, LES.vzmetnica, 'rx="2.5"')}
    ${pr(-52, 2, 137, 3, LES.breza, `stroke="${LES.rob}" stroke-width="0.15"`)}
    <text x="-20" y="-1" font-size="2.6" fill="#fff" opacity="0.9">postelja</text>

    <!-- Bluetti za kuhinjo -->
    ${pr(-48, 37, 26, 23, "#3a3f44", 'rx="1.2"')}
    ${pr(-45, 40, 20, 4, "#5a6168", 'rx="0.6"')}
    <text x="-35" y="52" font-size="2.4" fill="#d6d9dc" text-anchor="middle">Bluetti</text>

    <!-- zunanji (pritrjen) in srednji del vodila -->
    ${pr(-17.6, TLA_Y - 7.6, 101.6, 7.6, LES.kovinaTemna, 'rx="0.5" opacity="0.55"')}
    <g id="vodilo-srednje">${pr(-17.6, TLA_Y - 5.2, 101.6, 2.4, LES.kovina, 'opacity="0.9"')}</g>

    <g id="kuhinja-premik">
      <g transform="translate(0 ${TLA_Y - DVIG}) scale(1 -1)">${kuhinja}</g>
      <g id="oznake-zadaj">${oznaka(21, 20, "zaboj s hrano")}${oznaka(21, 35.5, "krožniki")}</g>
      <g id="oznake-spredaj">${oznaka(64, 15, "lonci")}${oznaka(62.8, 33.8, "pribor")}</g>
      <g id="mere">
        ${mera(0, y(-4.5), 84, y(-4.5), "84 cm", 68, y(-4.5) - 1, false)}
        ${mera(-4, y(0), -4, y(45), "45 cm", -5.2, y(22.5), true)}
        ${mera(85.5, y(48), 115, y(48), "+ 31 cm", 100, y(48) - 1, false)}
      </g>
    </g>`;
}

/* ---------- stanje in animacija ---------- */

/** tr = trenutno, cilj = kamor gre animacija. Vse vrednosti so 0..1. */
const stanje = {
  tr: { izvlek: 0, polica: 0, zadaj: 0, spredaj: 0, mere: 0 },
  cilj: { izvlek: 0, polica: 0, zadaj: 0, spredaj: 0, mere: 0 },
};
let tece = false;
let zadnjiCas = 0;
let obSpremembi = () => {};

/** Ukazi: izvleci, polica, zadaj, spredaj, mere. Vsak preklopi svoje stanje. */
export function nastaviCilj(ukaz) {
  const c = stanje.cilj;
  if (ukaz === "izvleci") {
    if (c.izvlek) Object.assign(c, { izvlek: 0, polica: 0, zadaj: 0, spredaj: 0, mere: 0 });
    else c.izvlek = 1;
  } else if (ukaz === "polica" || ukaz === "mere") {
    c[ukaz] = c[ukaz] ? 0 : 1;
    if (c[ukaz]) c.izvlek = 1;
  } else if (ukaz === "zadaj" || ukaz === "spredaj") {
    const drugi = ukaz === "zadaj" ? "spredaj" : "zadaj";
    c[ukaz] = c[ukaz] ? 0 : 1;
    if (c[ukaz]) { c[drugi] = 0; c.izvlek = 1; } // na isti strani je odprt samo en razdelek
  } else return;
  obSpremembi({ ...c });
  zazeni();
}

/** Nastavi stanje brez animacije, npr. iz ?prikaz=polica,mere. */
export function nastaviTakoj(ukazi) {
  ukazi.forEach(nastaviCilj);
  if (!stanje.cilj.izvlek) nastaviCilj("izvleci");
  Object.assign(stanje.tr, stanje.cilj);
  izrisi();
}

export const imaUporabnikovUkaz = () => Object.values(stanje.cilj).some(Boolean);

function zazeni() {
  if (tece) return;
  tece = true;
  zadnjiCas = performance.now();
  requestAnimationFrame(korak);
}

function korak(cas) {
  const dt = Math.min(0.05, (cas - zadnjiCas) / 1000);
  zadnjiCas = cas;
  const { tr, cilj } = stanje;
  let premika = false;
  for (const k of Object.keys(tr)) {
    let t = cilj[k];
    // kuhinja gre noter šele, ko so polička in vrata zaprta
    if (k === "izvlek" && t === 0 && (tr.polica > 0.03 || tr.zadaj > 0.03 || tr.spredaj > 0.03)) t = tr[k];
    const razlika = t - tr[k];
    if (Math.abs(razlika) < 0.002 || manjGibanja) tr[k] = t;
    else { tr[k] += razlika * Math.min(1, dt * 5.5); premika = true; }
  }
  izrisi();
  if (premika) requestAnimationFrame(korak);
  else tece = false;
}

function izrisi() {
  const s = $("#scena");
  if (!s || !$("#kuhinja-premik", s)) return;
  const { tr } = stanje;
  const gladko = (v) => v * v * (3 - 2 * v);
  const px = IZVLEK_CM * gladko(tr.izvlek);
  const nastavi = (sel, atr, v) => $(sel, s).setAttribute(atr, v);
  nastavi("#kuhinja-premik", "transform", `translate(${px} 0)`);
  nastavi("#vodilo-srednje", "transform", `translate(${px / 2} 0)`);
  nastavi("#vrata-zadaj", "transform", `translate(${41.6 * gladko(tr.zadaj)} 0)`);
  nastavi("#vrata-spredaj", "transform", `translate(${-41.6 * gladko(tr.spredaj)} 0)`);
  nastavi("#polica", "transform", `rotate(${90 * gladko(tr.polica)} 84 44)`);
  nastavi("#palica", "opacity", Math.max(0, (tr.polica - 0.85) / 0.15));
  nastavi("#palica-pospravljena", "opacity", 1 - Math.min(1, tr.polica * 3));
  nastavi("#oznake-zadaj", "opacity", Math.max(0, tr.zadaj - 0.6) / 0.4);
  nastavi("#oznake-spredaj", "opacity", Math.max(0, tr.spredaj - 0.6) / 0.4);
  nastavi("#mere", "opacity", tr.mere);
}

/** Nariše sceno z izbranimi barvami. Ob spremembi barv se nariše znova, stanje ostane. */
export function postaviSceno(barve, ograjica) {
  $("#scena").innerHTML = markup(barve, ograjica);
  izrisi();
}

/** Klic ob vsaki spremembi ciljnega stanja (za gumbe in kartice razdelkov). */
export function obSpremembiStanja(fn) {
  obSpremembi = fn;
}

/** Ob prvem prikazu scene izvleče kuhinjo in odpre poličko, če uporabnik še ni kliknil. */
export function samodejniPrikaz(element) {
  if (!("IntersectionObserver" in window) || manjGibanja) return;
  const io = new IntersectionObserver((vnosi) => {
    if (!vnosi.some((v) => v.isIntersecting)) return;
    io.disconnect();
    if (imaUporabnikovUkaz()) return;
    setTimeout(() => nastaviCilj("izvleci"), 400);
    setTimeout(() => { if (!stanje.cilj.polica) nastaviCilj("polica"); }, 1700);
  }, { threshold: 0.5 });
  io.observe(element);
}

/** Osveži gumbe in kartice razdelkov glede na ciljno stanje. */
export function osveziKrmilo(c) {
  const vrednost = { izvleci: c.izvlek, polica: c.polica, zadaj: c.zadaj, spredaj: c.spredaj, mere: c.mere };
  $$(".krmilo button").forEach((b) => {
    const vklopljeno = !!vrednost[b.dataset.ukaz];
    b.setAttribute("aria-pressed", vklopljeno);
    if (b.dataset.ukaz === "izvleci") b.textContent = vklopljeno ? "Pospravi kuhinjo" : "Izvleci kuhinjo";
  });
  $$("#razdelki li").forEach((li) => li.classList.toggle("aktiven", !!c[li.dataset.razdelek]));
}
