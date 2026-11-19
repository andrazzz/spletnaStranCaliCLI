/** Barve in gradniki SVG, skupni sceni in risbam za galerijo. Mere so v centimetrih. */

export const LES = {
  topol: "#e6cc9f", rob: "#b8935c", notri: "#cfb07e", senca: "#a98858", breza: "#f0dcb4",
  kovina: "#a7afb5", kovinaTemna: "#7d868d", vzmetnica: "#8c9a9e", tla: "#4a4f54",
};

/** Kot palice poličke od vodoravnice (model v7). */
export const KOT_PALICE = (52 * Math.PI) / 180;

/** Pravokotnik v lokalnih koordinatah (x, z), uporablja se v zrcaljeni skupini. */
export const pr = (x, z, w, h, fill, extra = "") =>
  `<rect x="${x}" y="${z}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

/** Barva čela: karbon je vzorec, ostalo navadna barva. */
export const polnilo = (barva) => (barva === "karbon" ? "url(#karbon)" : barva);

/** Vzorec karbona in gradient stekla indukcije. */
export function definicije() {
  return `<defs>
    <pattern id="karbon" width="1.2" height="1.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="1.2" height="1.2" fill="#1a1b1d"/><rect width="0.6" height="0.6" fill="#2b2d31"/><rect x="0.6" y="0.6" width="0.6" height="0.6" fill="#2b2d31"/>
    </pattern>
    <linearGradient id="steklo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2d31"/><stop offset="1" stop-color="#111214"/></linearGradient>
  </defs>`;
}
