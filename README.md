# Kuhinja Cali

Predstavitvena in prodajna spletna stran za izvlečno kuhinjo za VW California T7. Mere na strani so iz modela »Californija kuhinja v7« (Fusion 360).

- **Zaledje:** Clojure ([Babashka](https://babashka.org) in http-kit). Podatki o izdelku, API, shranjevanje povpraševanj.
- **Spletni del:** čisti HTML, CSS in JavaScript (ES moduli). Brez knjižnic, ogrodij in koraka gradnje.

> Testna stran: cene so izmišljene. VW in California sta blagovni znamki Volkswagen AG; projekt ni povezan z Volkswagnom.

## Kaj zna stran

- **Interaktivni prikaz od strani** v merilu: izvlek kuhinje, preklopna polička s palico, drsna vrata, vsebina razdelkov in kote.
- **Konfigurator** (čela, pult, dodatki) s sprotno ceno. Ob spremembi se prebarvata tudi prikaz in risbe.
- **Galerija:** fotografije iz `public/slike/`. Dokler jih ni, so namesto njih risbe v merilu.
- **Povpraševanje:** preverjanje v brskalniku in na strežniku. Ceno izračuna strežnik, zapis se shrani v `storage/`.

## Hiter začetek

```bash
# 1. Babashka (enkrat; v WSL, ne v Windows)
mkdir -p ~/.local/bin
curl -sL https://raw.githubusercontent.com/babashka/babashka/master/install | bash -s -- --dir ~/.local/bin

# 2. Zagon
bb serve      # http://localhost:8080
```

| Ukaz | Kaj naredi |
|---|---|
| `bb serve` | zažene strežnik (`PORT`, `HOST`, `POVPRASEVANJA` v okolju) |
| `bb build` | izvozi podatke v `public/data/izdelek.json` za statično gostovanje |
| `bb test` | poženi teste |
| `bb check-js` | preveri sintakso JS modulov (Node.js) |
| `bb ci` | vse zgoraj, kot na GitHub Actions |

## Struktura

```
.
├── bb.edn                     naloge in classpath (src, resources)
├── resources/
│   └── izdelek.edn            EDINI vir besedil, mer, izvedb in cen
├── src/kuhinja/
│   ├── config.clj             nastavitve (vrata, poti, omejitve)
│   ├── server.clj             usmerjanje zahtev, zagon http-kit
│   ├── http.clj               JSON odgovori, statične datoteke
│   ├── podatki.clj            branje izdelka, seznam fotografij
│   ├── povprasevanja.clj      preverjanje, cena, shranjevanje
│   └── build.clj              izvoz v JSON
├── test/kuhinja/              clojure.test
├── public/                    vse, kar dobi brskalnik
│   ├── index.html
│   ├── css/main.css
│   ├── js/
│   │   ├── main.js            vstopna točka, poveže module
│   │   ├── pomozne.js         $, esc, formatiranje cen, nalaganje JSON
│   │   ├── vsebina.js         besedila iz podatkov
│   │   ├── konfigurator.js    izbira in cena
│   │   ├── galerija.js        fotografije, risbe, povečava
│   │   ├── obrazec.js         povpraševanje
│   │   └── risbe/
│   │       ├── skupno.js      barve in SVG gradniki
│   │       ├── scena.js       interaktivni prikaz in animacija
│   │       └── galerija-risbe.js
│   ├── data/                  izdelek.json (ustvari bb build)
│   └── slike/                 fotografije za galerijo
├── storage/                   povpraševanja (ni v gitu)
├── docs/                      dokumentacija
└── .github/workflows/ci.yml
```

## Dokumentacija

| Dokument | Vsebina |
|---|---|
| [docs/arhitektura.md](docs/arhitektura.md) | diagrami: komponente, tok zahtev, načina delovanja, stanja prikaza |
| [docs/api.md](docs/api.md) | HTTP API s primeri |
| [docs/podatki.md](docs/podatki.md) | oblika `izdelek.edn` in zapisa povpraševanja |
| [docs/spletni-del.md](docs/spletni-del.md) | JS moduli, koordinate risb, dodajanje vsebine |
| [docs/razvoj.md](docs/razvoj.md) | razvojno okolje, WSL, testi, CI, objava |
