(ns kuhinja.config
  "Nastavitve na enem mestu. Vrednosti se dajo povoziti s spremenljivkami okolja.")

(defn- okolje [ime privzeto]
  (or (System/getenv ime) privzeto))

(def vrata
  "Vrata HTTP strežnika (PORT)."
  (parse-long (okolje "PORT" "8080")))

(def ip
  "Naslov, na katerem posluša strežnik (HOST). Privzeto samo ta računalnik."
  (okolje "HOST" "127.0.0.1"))

(def javna-mapa
  "Mapa s statičnimi datotekami spletne strani."
  "public")

(def slike-mapa
  "Mapa s fotografijami za galerijo."
  "public/slike")

(def ^:dynamic *povprasevanja-pot*
  "Datoteka, kamor se dodajajo povpraševanja (ena EDN vrstica na povpraševanje)."
  (okolje "POVPRASEVANJA" "storage/povprasevanja.edn"))

(def najvec-bajtov
  "Največja dovoljena velikost telesa zahteve POST."
  20000)
