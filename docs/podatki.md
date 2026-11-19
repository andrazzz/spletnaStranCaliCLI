# Podatki

## `resources/izdelek.edn`

Edini vir vsebine strani. Ključi s podčrtajem (`osnovna_cena`) so izbrani zato, da so v JSON in JS berljivi brez narekovajev (`d.osnovna_cena`).

| Ključ | Tip | Kje na strani |
|---|---|---|
| `:ime` | niz | naslov |
| `:podnaslov` | niz | (rezerva, trenutno ni prikazan) |
| `:opis` | niz | uvodni odstavek |
| `:osnovna_cena` | celo število (EUR) | gumb »od …«, konfigurator, izračun na strežniku |
| `:valuta` | niz | (informativno; formatiranje je v `pomozne.js`) |
| `:hitre_mere` | vektor `{:vrednost :enota :oznaka}` | 4 ploščice pod uvodom |
| `:lastnosti` | vektor `{:naslov :opis}` | razdelek »Zakaj takšna« |
| `:razdelki` | vektor `{:id :ime :kje :mera :nosi}` | kartice pod prikazom |
| `:specifikacije` | vektor parov `["oznaka" "vrednost"]` | tabela »Mere in material« |
| `:izvedbe` | zemljevid, glej spodaj | konfigurator |

### `:razdelki`

`:id` mora biti eden od `lonci`, `pribor`, `krozniki`, `zaboj`. Po njem `vsebina.js` ve, katera vrata v prikazu (`spredaj` ali `zadaj`) odpre klik na kartico.

### `:izvedbe`

```clojure
{:cela    [{:id "antracit" :ime "Antracit HPL" :cena 0 :barva "#33373b"} ...]
 :pult    [{:id "svetel"   :ime "HPL svetlo siv" :cena 0 :barva "#d4d6d3"} ...]
 :dodatki [{:id "vodila"   :ime "Vodili Vevor 100 cm z okovjem" :cena 140 :privzeto true} ...]}
```

- `:cena` je doplačilo v EUR, lahko je negativno (popust).
- Prva možnost v `:cela` in `:pult` je privzeto izbrana.
- `:barva` se uporabi v prikazu in risbah. Id `karbon` je poseben: namesto barve se uporabi SVG vzorec.
- Dodatek z id `ograjica` vklopi ograjico v prikazu in risbah.

**Dodajanje izvedbe:** dodajte zemljevid v ustrezni vektor. Strežnik in stran ga upoštevata ob naslednji zahtevi; za statično različico poženite `bb build`.

## Povpraševanje

`storage/povprasevanja.edn` ima en EDN zemljevid na vrstico:

```clojure
{:id "4d8f5821-…", :prejeto "2026-11-18T22:11:35.757Z",
 :ime "Ana Novak", :email "ana@primer.si", :telefon nil, :sporocilo "…",
 :izbira {:celo "karbon", :pult "hrast", :dodatki ["vodila" "ograjica"]},
 :cena 2315}
```

Branje v REPL ali skripti:

```clojure
(require '[clojure.edn :as edn] '[clojure.string :as str])
(->> (slurp "storage/povprasevanja.edn") str/split-lines (map edn/read-string))
```

Datoteka vsebuje osebne podatke, zato je v `.gitignore`. Pot se nastavi s spremenljivko `POVPRASEVANJA`.
