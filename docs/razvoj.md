# Razvoj

## Zahteve

| Orodje | Za kaj | Obvezno |
|---|---|---|
| [Babashka](https://babashka.org) ≥ 1.12 | strežnik, izvoz, testi | da |
| Node.js ≥ 20 | `bb check-js` | samo za preverbo JS |

Babashka je en program; Jave ne potrebuje. Namestitev brez `sudo`:

```bash
mkdir -p ~/.local/bin
curl -sL https://raw.githubusercontent.com/babashka/babashka/master/install | bash -s -- --dir ~/.local/bin
```

Če `bb` ni najden, dodajte `~/.local/bin` v `PATH` (v `~/.bashrc`: `export PATH="$HOME/.local/bin:$PATH"`).

## Naloge

```bash
bb tasks        # seznam
bb serve        # strežnik
bb build        # public/data/izdelek.json in public/slike/slike.json
bb test         # clojure.test
bb check-js     # node --check za vse public/js/**.js
bb ci           # test + build + check-js
```

## Nastavitve (spremenljivke okolja)

| Spremenljivka | Privzeto | Pomen |
|---|---|---|
| `PORT` | `8080` | vrata |
| `HOST` | `127.0.0.1` | naslov poslušanja; `0.0.0.0` odpre strežnik lokalnemu omrežju |
| `POVPRASEVANJA` | `storage/povprasevanja.edn` | datoteka s povpraševanji |

```bash
PORT=3000 bb serve
```

## WSL in Windows

Projekt teče v WSL, brskalnik pa v Windows. WSL posreduje `localhost` iz Windows samo za **IPv4** vtičnice. Babashka (GraalVM) brez nastavitve odpre IPv6 vtičnico `[::ffff:127.0.0.1]`, zato `http://localhost:8080` v Windows ne odgovori, v WSL pa deluje.

Zato `bb serve` zažene Babashko znova z `-Djava.net.preferIPv4Stack=true`. To je treba podati ob zagonu, `System/setProperty` med izvajanjem ne učinkuje. Preverba:

```bash
ss -ltn | grep 8080          # mora biti 127.0.0.1:8080, ne [::ffff:127.0.0.1]:8080
```

## Testi

`test/kuhinja/`:

- `povprasevanja_test.clj`: preverjanje vhoda in izračun cene (čiste funkcije).
- `server_test.clj`: cela pot zahteve skozi `kuhinja.server/app` brez odpiranja vrat: API, statične datoteke, zaščita pred `../`, povpraševanje (zapiše v začasno datoteko prek `binding` na `config/*povprasevanja-pot*`).

Nov test: dodajte imenski prostor v `test/kuhinja/` ter ga vpišite v `:requires` in `run-tests` naloge `test` v `bb.edn`.

## Stalna integracija

`.github/workflows/ci.yml` ob vsakem pushu na `main` in ob pull requestu namesti Babashko in Node.js ter požene `bb ci`.

## Objava

**Statično** (GitHub Pages, Netlify, Cloudflare Pages): poženite `bb build`, objavite mapo `public/`. Stran deluje, obrazec pa pove, da povpraševanje ni bilo poslano. Za delujoč obrazec potrebuje stran strežnik.

**Z zaledjem** (VPS, Fly.io, Render): poženite `bb serve` z `HOST=0.0.0.0` za obratnim posrednikom (Caddy, nginx) s HTTPS. Mapa `storage/` mora biti trajna.

## Fotografije

Datoteke dajte v `public/slike/`. Vrstni red je po abecedi, zato je priročno ime s številko (`01-izvlecena.jpg`). Z zaledjem se pokažejo takoj; za statično objavo poženite `bb build`.

## Slog

- Imena v kodi so slovenska (kot v dokumentih projekta), brez šumnikov v imenih datotek in simbolov.
- `.editorconfig`: UTF-8, LF, 2 presledka.
- Clojure: čiste funkcije ločene od stranskih učinkov (`preveri`, `izracunaj-ceno` in `shrani!`).
