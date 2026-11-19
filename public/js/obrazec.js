/** Obrazec za povpraševanje: preverjanje v brskalniku in pošiljanje na POST /api/povprasevanje. */
import { $, $$, evri, naStrezniku } from "./pomozne.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {() => object} trenutnaIzbira vrne izbiro iz konfiguratorja
 * @param {boolean} zZaledjem ali teče Clojure strežnik (sicer statična različica, npr. GitHub Pages)
 */
export function postaviObrazec(trenutnaIzbira, zZaledjem) {
  const f = $("#povprasevanje");
  const stanjeEl = $("#stanje");
  const gumb = $("button[type=submit]", f);

  const pokaziNapake = (napake) => {
    $$(".napaka", f).forEach((el) => (el.textContent = napake[el.dataset.za] || ""));
    $$("input", f).forEach((el) => el.setAttribute("aria-invalid", napake[el.name] ? "true" : "false"));
  };
  const sporoci = (besedilo, vrsta = "") => {
    stanjeEl.textContent = besedilo;
    stanjeEl.className = `stanje ${vrsta}`;
  };

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const podatki = Object.fromEntries(new FormData(f));

    const napake = {};
    if (!podatki.ime.trim()) napake.ime = "Vpišite ime.";
    if (!EMAIL.test(podatki.email.trim())) napake.email = "Vpišite veljaven e-poštni naslov.";
    pokaziNapake(napake);
    if (Object.keys(napake).length) return sporoci("");

    if (!naStrezniku) {
      return sporoci("Stran je odprta kot datoteka, zato povpraševanje ni bilo poslano. Zaženite strežnik z ukazom »bb serve«.", "slabo");
    }
    if (!zZaledjem) {
      return sporoci("To je predogled brez strežnika, zato povpraševanje ni bilo poslano. Na polni različici strani se shrani.", "slabo");
    }

    gumb.disabled = true;
    sporoci("Pošiljam …");
    try {
      const r = await fetch("/api/povprasevanje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...podatki, izbira: trenutnaIzbira() }),
      });
      const odg = await r.json().catch(() => null);
      if (r.ok && odg?.ok) {
        f.reset();
        pokaziNapake({});
        sporoci(`Hvala! Povpraševanje je shranjeno (cena ${evri.format(odg.cena)}). Odgovorili vam bomo na e-pošto.`, "ok");
      } else if (r.status === 422 && odg?.napake) {
        pokaziNapake(odg.napake);
        sporoci("Popravite označena polja.", "slabo");
      } else {
        sporoci("Povpraševanje ni bilo poslano: strežnik ga ne sprejema (ali teče samo statična stran?).", "slabo");
      }
    } catch {
      sporoci("Povpraševanje ni bilo poslano: strežnik ni dosegljiv.", "slabo");
    } finally {
      gumb.disabled = false;
    }
  });
}
