# HTTP API

Vsi odgovori API so `application/json; charset=utf-8` s `Cache-Control: no-store`.

| Metoda | Pot | Opis |
|---|---|---|
| `GET` | `/api/izdelek` | podatki o izdelku (vsebina `resources/izdelek.edn`) |
| `GET` | `/api/slike` | seznam fotografij za galerijo |
| `POST` | `/api/povprasevanje` | oddaja povpraševanja |
| `GET` | vse ostalo | statična datoteka iz `public/` (`/` je `index.html`) |

Druge metode vrnejo `405`. Pot, ki bi vodila ven iz `public/` (na primer `/../bb.edn`), vrne `404`.

---

## `GET /api/izdelek`

Vrne celoten `izdelek.edn` kot JSON. Datoteka se prebere ob vsaki zahtevi, zato sprememba velja takoj, brez ponovnega zagona. Obliko opisuje [podatki.md](podatki.md).

```bash
curl -s localhost:8080/api/izdelek | head
```

## `GET /api/slike`

Fotografije v `public/slike/` (jpg, jpeg, png, webp, avif, gif), po abecedi, s potjo relativno na `public/`.

```json
["slike/01-izvlecena.jpg", "slike/02-polica.jpg"]
```

Če fotografij ni, vrne `[]` in galerija pokaže risbe.

## `POST /api/povprasevanje`

**Zahteva** (`Content-Type: application/json`, največ 20 000 bajtov):

```json
{
  "ime": "Ana Novak",
  "email": "ana@primer.si",
  "telefon": "041 000 000",
  "sporocilo": "T7 letnik 2025, rok marec.",
  "izbira": { "celo": "karbon", "pult": "hrast", "dodatki": ["vodila", "ograjica"] }
}
```

| Polje | Obvezno | Pravilo |
|---|---|---|
| `ime` | da | neprazno po obrezovanju, skrajšano na 120 znakov |
| `email` | da | oblika `nekaj@nekaj.nekaj`, največ 200 znakov |
| `telefon` | ne | največ 40 znakov |
| `sporocilo` | ne | največ 4000 znakov |
| `izbira` | ne | id-ji iz `izvedbe`; neznani id-ji štejejo 0 €, največ 20 dodatkov |

Polje `cena` v zahtevi se **ne upošteva**. Ceno izračuna strežnik.

**Odgovori:**

| Status | Telo | Kdaj |
|---|---|---|
| `201` | `{"ok": true, "id": "…uuid…", "cena": 2315}` | shranjeno |
| `400` | `{"ok": false, "napaka": "Neveljaven JSON."}` | prazno telo ali telo, ki ni JSON objekt |
| `413` | `{"ok": false, "napaka": "Zahteva je prevelika."}` | več kot 20 000 bajtov |
| `422` | `{"ok": false, "napake": {"email": "Vpišite veljaven e-poštni naslov."}}` | napake po poljih |
| `500` | `{"ok": false, "napaka": "Napaka na strežniku."}` | nepričakovana napaka (podrobnost v izpisu strežnika) |

Primer:

```bash
curl -s -X POST localhost:8080/api/povprasevanje \
  -H 'Content-Type: application/json' \
  -d '{"ime":"Test","email":"test@primer.si","izbira":{"celo":"antracit","pult":"svetel","dodatki":[]}}'
```

Shranjen zapis opisuje [podatki.md](podatki.md#povpraševanje).
