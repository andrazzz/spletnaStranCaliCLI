/** Majhne pomožne funkcije, ki jih uporabljajo vsi moduli. */

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/** Pobegne znake za varen vnos v HTML. */
export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const evri = new Intl.NumberFormat("sl-SI", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

/** Doplačilo kot besedilo: »+ 180 €«, »− 80 €« ali »vključeno«. */
export const preznak = (n) => (n > 0 ? "+ " + evri.format(n) : n < 0 ? "− " + evri.format(-n) : "vključeno");

/** Ali stran teče prek HTTP (strežnik ali statični gostitelj) in ne kot file://. */
export const naStrezniku = location.protocol.startsWith("http");

export const manjGibanja = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Poskusi poti po vrsti in vrne prvi uspešen JSON ali null. */
export async function naloziJson(poti) {
  for (const pot of poti) {
    try {
      const r = await fetch(pot, { cache: "no-store" });
      if (r.ok) return await r.json();
    } catch {
      /* poskusi naslednjo pot */
    }
  }
  return null;
}
