/** Izbira izvedbe in dodatkov, sprotna cena in povzetek. */
import { $, $$, esc, evri, preznak } from "./pomozne.js";

let izdelek = null;

function izbiraHtml(ime, moznosti) {
  return moznosti
    .map((m, i) => `
    <label class="izbira">
      <input type="radio" name="${ime}" value="${esc(m.id)}" ${i === 0 ? "checked" : ""}>
      <span><i class="${m.id === "karbon" ? "karbon" : ""}" style="background:${esc(m.barva)}"></i><b>${esc(m.ime)}</b><small>${esc(preznak(m.cena))}</small></span>
    </label>`)
    .join("");
}

/** Trenutna izbira: { celo, pult, dodatki: [id, ...] }. Pošlje se s povpraševanjem. */
export function trenutnaIzbira() {
  const f = $("#konfigurator");
  return {
    celo: f.querySelector('[name="celo"]:checked')?.value,
    pult: f.querySelector('[name="pult"]:checked')?.value,
    dodatki: $$('[name="dodatki"]:checked', f).map((x) => x.value),
  };
}

/**
 * Nariše izbire in ob vsaki spremembi pokliče obSpremembi({ barve, ograjica }).
 * Cena tukaj je samo za prikaz; veljavno ceno izračuna strežnik.
 */
export function postaviKonfigurator(d, obSpremembi) {
  izdelek = d;
  const iz = d.izvedbe;
  $("#izbira-celo").innerHTML = izbiraHtml("celo", iz.cela);
  $("#izbira-pult").innerHTML = izbiraHtml("pult", iz.pult);
  $("#izbira-dodatki").innerHTML = iz.dodatki
    .map((m) => `
    <label class="dodatek"><input type="checkbox" name="dodatki" value="${esc(m.id)}" ${m.privzeto ? "checked" : ""}>
      <b>${esc(m.ime)}</b><small>${esc(preznak(m.cena))}</small></label>`)
    .join("");

  const osvezi = () => obSpremembi(osveziPovzetek());
  $("#konfigurator").addEventListener("change", osvezi);
  osvezi();
}

function osveziPovzetek() {
  const iz = izdelek.izvedbe;
  const izb = trenutnaIzbira();
  const celo = iz.cela.find((x) => x.id === izb.celo);
  const pult = iz.pult.find((x) => x.id === izb.pult);
  const dodatki = iz.dodatki.filter((x) => izb.dodatki.includes(x.id));

  const vrstice = [
    ["Kuhinja Cali, osnovna izvedba", izdelek.osnovna_cena],
    [celo.ime, celo.cena],
    [pult.ime, pult.cena],
    ...dodatki.map((x) => [x.ime, x.cena]),
  ];
  $("#skupaj").textContent = evri.format(vrstice.reduce((s, [, c]) => s + c, 0));
  $("#povzetek-seznam").innerHTML = vrstice
    .map(([n, c], i) => `<li><span>${esc(n)}</span><span>${i === 0 ? evri.format(c) : esc(preznak(c))}</span></li>`)
    .join("");

  return {
    barve: { celo: celo.id === "karbon" ? "karbon" : celo.barva, pult: pult.barva },
    ograjica: izb.dodatki.includes("ograjica"),
  };
}
