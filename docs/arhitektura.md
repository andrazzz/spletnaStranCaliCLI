# Arhitektura

Stran ima dva dela, ki si delita en vir podatkov:

- **Zaledje v Clojure** (Babashka, http-kit) streže datoteke, podatke o izdelku in sprejema povpraševanja.
- **Spletni del v čistem JS** nariše vse v brskalniku: besedila, interaktivni prikaz, konfigurator in obrazec.

Vsa vsebina (besedila, mere, izvedbe, cene) je v **`resources/izdelek.edn`**. Nikjer drugje ni podvojena.

## Komponente

```mermaid
flowchart LR
    subgraph Brskalnik
        HTML[index.html<br/>css/main.css]
        MAIN[js/main.js]
        VS[vsebina.js]
        KONF[konfigurator.js]
        SC["risbe/scena.js"]
        GAL[galerija.js]
        OBR[obrazec.js]
        MAIN --> VS & KONF & SC & GAL & OBR
        KONF -- barve, ograjica --> SC
        KONF -- barve, ograjica --> GAL
        OBR -- trenutnaIzbira --> KONF
    end

    subgraph Streznik["Strežnik (bb serve)"]
        SRV[server.clj<br/>usmerjanje]
        HTTP[http.clj<br/>statične datoteke]
        POD[podatki.clj]
        POV[povprasevanja.clj]
        CFG[config.clj]
        SRV --> HTTP & POD & POV
        HTTP & POD & POV --> CFG
    end

    subgraph Datoteke
        EDN[("resources/<br/>izdelek.edn")]
        PUB[("public/")]
        SLIKE[("public/slike/")]
        STO[("storage/<br/>povprasevanja.edn")]
    end

    HTML -. "GET /, /css, /js" .-> HTTP --> PUB
    MAIN -. "GET /api/izdelek" .-> SRV
    GAL -. "GET /api/slike" .-> SRV
    OBR -. "POST /api/povprasevanje" .-> SRV
    POD --> EDN
    POD --> SLIKE
    POV --> STO
```

## Usmerjanje zahtev

`kuhinja.server/app` je en Ring obdelovalec. Najprej preveri API poti, nato poskusi statično datoteko.

```mermaid
flowchart TD
    Z([Zahteva]) --> A{"metoda + pot"}
    A -- "GET /api/izdelek" --> I["podatki/izdelek<br/>prebere izdelek.edn"] --> J200[200 JSON]
    A -- "GET /api/slike" --> S["podatki/slike<br/>seznam public/slike"] --> J200
    A -- "POST /api/povprasevanje" --> P[obdelaj-povprasevanje]
    A -- drug GET --> F{"datoteka v public/?<br/>in pot ne gre ven iz public/"}
    F -- da --> D[200 datoteka<br/>Content-Type po končnici]
    F -- ne --> N404[404]
    A -- druga metoda --> N405[405]
    P --> E{{izjema?}} -. da .-> N500[500 JSON]
```

## Tok: nalaganje strani

```mermaid
sequenceDiagram
    autonumber
    actor U as Uporabnik
    participant B as Brskalnik (main.js)
    participant S as Strežnik
    participant F as resources/izdelek.edn

    U->>B: odpre http://localhost:8080
    B->>S: GET / , css/main.css, js/*.js
    S-->>B: statične datoteke
    B->>S: GET /api/izdelek
    S->>F: preberi (ob vsaki zahtevi)
    S-->>B: JSON
    Note over B: če API ne odgovori:<br/>data/izdelek.json (bb build)
    B->>B: vsebina.js izpolni besedila
    B->>S: GET /api/slike
    S-->>B: ["slike/…jpg", …] ali []
    B->>B: konfigurator nariše izbire,<br/>scena in risbe se narišejo v izbranih barvah
    Note over B: ko scena pride na zaslon:<br/>samodejno izvleče kuhinjo in odpre poličko
```

## Tok: povpraševanje

Brskalnik pošlje samo **izbiro** (id-je). Cene, ki jo vidi uporabnik, strežnik ne prevzame, ampak jo izračuna znova iz `izdelek.edn`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Uporabnik
    participant O as obrazec.js
    participant S as server.clj
    participant P as povprasevanja.clj
    participant D as storage/povprasevanja.edn

    U->>O: Pošlji povpraševanje
    O->>O: preveri ime in e-pošto
    alt napaka v obrazcu
        O-->>U: označi polja
    else stran odprta kot file://
        O-->>U: »ni bilo poslano, zaženite bb serve«
    else
        O->>S: POST /api/povprasevanje<br/>{ime, email, telefon, sporocilo, izbira}
        S->>S: velikost ≤ 20 000 B, veljaven JSON
        S->>P: preveri(vhod)
        alt napake
            S-->>O: 422 {napake}
            O-->>U: označi polja
        else v redu
            P->>P: nov-zapis: id, čas, izracunaj-ceno
            P->>D: dodaj eno EDN vrstico
            S-->>O: 201 {ok, id, cena}
            O-->>U: »Hvala! … cena …«
        end
    end
```

## Načina delovanja

```mermaid
flowchart LR
    subgraph Polno["Z zaledjem: bb serve"]
        A1[Brskalnik] --> A2["http-kit :8080"]
        A2 --> A3["/api/izdelek<br/>vedno sveži podatki"]
        A2 --> A4["/api/povprasevanje<br/>deluje"]
    end
    subgraph Staticno["Statično: GitHub Pages, Netlify, python -m http.server"]
        B0[bb build] --> B1["public/data/izdelek.json<br/>public/slike/slike.json"]
        B2[Brskalnik] --> B1
        B2 -.-> B3[obrazec pove, da<br/>povpraševanje ni bilo poslano]
    end
```

## Stanja interaktivnega prikaza

`risbe/scena.js` ima ciljno in trenutno stanje (vse vrednosti 0..1). Animacija trenutno vrednost vsak okvir približa cilju. Pravila:

- polička, razdelek ali mere najprej izvlečejo kuhinjo,
- na isti strani je lahko odprt samo en razdelek (vrata tečejo drugo čez drugo),
- kuhinja gre nazaj šele, ko so polička in vrata zaprta.

```mermaid
stateDiagram-v2
    state "Pospravljena" as Pospravljena
    state "Izvlečena" as Izvlecena
    [*] --> Pospravljena
    Pospravljena --> Izvlecena: izvleci, polica, zadaj, spredaj ali mere
    Izvlecena --> Pospravljena: izvleci (najprej zapre poličko in vrata)

    state Izvlecena {
        state "Vrata zaprta" as Zaprta
        state "Zadnji razdelek odprt" as ZadajOdprto
        state "Sprednji razdelek odprt" as SpredajOdprto
        state "Polička zložena" as PolickaZlozena
        state "Polička odprta" as PolickaOdprta
        [*] --> Zaprta
        Zaprta --> ZadajOdprto: zadaj
        Zaprta --> SpredajOdprto: spredaj
        ZadajOdprto --> SpredajOdprto: spredaj
        SpredajOdprto --> ZadajOdprto: zadaj
        ZadajOdprto --> Zaprta: zadaj
        SpredajOdprto --> Zaprta: spredaj
        --
        [*] --> PolickaZlozena
        PolickaZlozena --> PolickaOdprta: polica
        PolickaOdprta --> PolickaZlozena: polica
    }
```

## Odločitve

| Odločitev | Zakaj |
|---|---|
| Babashka namesto JVM Clojure | en program brez Jave, zagon v ~20 ms, http-kit in cheshire sta že vgrajena |
| En vir podatkov (`izdelek.edn`) | besedila in cene se spremenijo na enem mestu; `bb build` jih izvozi za statično gostovanje |
| Cena na strežniku | brskalniku se ne zaupa; cena v brskalniku je samo za prikaz |
| Povpraševanja v EDN datoteki | za testno stran dovolj, brez baze; ena vrstica na zapis, preprosto branje z `clojure.edn` |
| Čisti JS z ES moduli | brez odvisnosti in brez koraka gradnje, a vseeno ločeno po odgovornostih |
| SVG iz kode | risbe so v pravih merah modela v7 in se prebarvajo po izbiri |
| `-Djava.net.preferIPv4Stack=true` | sicer WSL strežnika ne posreduje v Windows (glej [razvoj.md](razvoj.md#wsl-in-windows)) |
| Strežnik posluša samo na 127.0.0.1 | dostopen samo z lastnega računalnika; `HOST=0.0.0.0` ga odpre omrežju |
