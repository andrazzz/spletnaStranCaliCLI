/** Risbi v merilu za galerijo (čelni pogled in tloris), dokler ni fotografij. */
import { LES, polnilo, definicije } from "./skupno.js";

/** SVG kot data: URL, da ga lahko povečava prikaže kot navadno sliko. */
function svgSlika(viewBox, vsebina) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" font-family="Inter, Segoe UI, sans-serif">${definicije()}<rect x="-1000" y="-1000" width="3000" height="3000" fill="#f3ece0"/>${vsebina}</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export function risbaCelo(barve, ograjica) {
  const celo = polnilo(barve.celo);
  const y = (z) => 50 - z; // dno kuhinje pri y = 50
  const r = (x, z, w, h, f, e = "") => `<rect x="${x}" y="${y(z + h)}" width="${w}" height="${h}" fill="${f}" ${e}/>`;
  const tanko = `stroke="${LES.rob}" stroke-width="0.15"`;
  return svgSlika("-32 -6 64 66", `
    ${r(-30, -1, 60, 1, "#4a4f54")}
    ${ograjica ? r(-19.2, 45, 38.4, 6, LES.topol, tanko) : ""}
    ${r(-14, 45, 28, 7, "url(#steklo)", 'rx="0.8"')}
    ${r(-19.2, 0, 38.4, 44.35, celo)}
    ${r(-19.2, 43.8, 38.4, 1.2, barve.pult, tanko)}
    ${r(-19.2, 42.4, 38.4, 2, LES.topol, tanko)}
    ${r(-19.2, 14, 38.4, 28.4, celo, 'stroke="rgba(255,255,255,.18)" stroke-width="0.25"')}
    ${r(-19.1, 10.2, 38.2, 2.5, LES.senca, 'rx="0.3"')}
    <circle cx="-12.55" cy="${y(11.45)}" r="0.4" fill="#888"/><circle cx="14.45" cy="${y(11.45)}" r="0.4" fill="#888"/>
    ${r(-20.6, -0.5, 1.4, 7.6, LES.kovina)}${r(19.2, -0.5, 1.4, 7.6, LES.kovina)}
    ${r(-21, 1.5, 1.8, 2.2, "#f2c230", 'rx="0.4"')}${r(19.2, 1.5, 1.8, 2.2, "#f2c230", 'rx="0.4"')}
    <text x="0" y="${y(28)}" font-size="2.2" fill="rgba(255,255,255,.75)" text-anchor="middle">zložena polička</text>
    <text x="0" y="${y(5)}" font-size="2" fill="rgba(255,255,255,.6)" text-anchor="middle">palica na magnetih</text>
    <text x="0" y="57.5" font-size="2.6" font-weight="600" fill="#c4622d" text-anchor="middle">38,4 cm</text>`);
}

export function risbaTloris(barve, ograjica) {
  const plosca = (x) => `<rect x="${x}" y="5.2" width="35" height="28" rx="0.8" fill="url(#steklo)"/>
     <circle cx="${x + 13}" cy="19.2" r="8.5" fill="none" stroke="#6a6f75" stroke-width="0.35"/>
     <circle cx="${x + 13}" cy="19.2" r="5" fill="none" stroke="#6a6f75" stroke-width="0.25"/>
     <rect x="${x + 27}" y="9" width="5" height="20" rx="0.6" fill="#24272a"/><circle cx="${x + 29.5}" cy="12" r="0.7" fill="#c4622d"/>`;
  return svgSlika("-6 -6 128 52", `
    ${ograjica ? `<rect x="-1" y="0" width="1" height="38.4" fill="${LES.topol}"/>` : ""}
    <rect x="0" y="0" width="84" height="38.4" fill="${barve.pult}" stroke="${LES.rob}" stroke-width="0.3"/>
    <rect x="84" y="0" width="1" height="38.4" fill="${LES.topol}"/>
    <rect x="85" y="0" width="30" height="38.4" fill="${polnilo(barve.celo)}" opacity="0.92"/>
    ${plosca(4.5)}${plosca(44.5)}
    <text x="100" y="20.2" font-size="2.4" fill="rgba(255,255,255,.8)" text-anchor="middle">polička</text>
    <text x="42" y="43.5" font-size="2.6" font-weight="600" fill="#c4622d" text-anchor="middle">84 cm</text>
    <text x="100" y="43.5" font-size="2.6" font-weight="600" fill="#c4622d" text-anchor="middle">+ 30 cm</text>`);
}
