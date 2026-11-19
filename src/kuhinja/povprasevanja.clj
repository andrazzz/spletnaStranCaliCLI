(ns kuhinja.povprasevanja
  "Preverjanje, izračun cene in shranjevanje povpraševanj.
   Preverjanje in izračun sta čisti funkciji (brez stranskih učinkov), zato sta preprosta za testiranje."
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [kuhinja.config :as config])
  (:import [java.time Instant]
           [java.util UUID]))

(defn- besedilo
  "Obrezan niz, skrajšan na najvec znakov; nil, če je prazen ali ni niz."
  [v najvec]
  (when (string? v)
    (let [s (str/trim v)]
      (when (seq s) (subs s 0 (min najvec (count s)))))))

(def ^:private email-vzorec #"[^\s@]+@[^\s@]+\.[^\s@]+")

(defn preveri
  "Iz vhoda (JSON brskalnika, ključi kot keywordi) naredi [napake zapis].
   napake je zemljevid polje -> sporočilo; prazen zemljevid pomeni, da je vhod v redu."
  [vhod]
  (let [ime    (besedilo (:ime vhod) 120)
        email  (besedilo (:email vhod) 200)
        izbira (:izbira vhod)
        napake (cond-> {}
                 (nil? ime) (assoc :ime "Vpišite ime.")
                 (not (and email (re-matches email-vzorec email)))
                 (assoc :email "Vpišite veljaven e-poštni naslov."))]
    [napake
     {:ime       ime
      :email     email
      :telefon   (besedilo (:telefon vhod) 40)
      :sporocilo (besedilo (:sporocilo vhod) 4000)
      :izbira    (when (map? izbira)
                   {:celo    (besedilo (:celo izbira) 40)
                    :pult    (besedilo (:pult izbira) 40)
                    :dodatki (->> (:dodatki izbira)
                                  (filter string?)
                                  (take 20)
                                  (keep #(besedilo % 40))
                                  vec)})}]))

(defn izracunaj-ceno
  "Cena iz podatkov o izdelku in izbire. Neznani id-ji štejejo 0 €.
   Cena se vedno računa na strežniku, nikoli se ne prevzame iz brskalnika."
  [{:keys [osnovna_cena izvedbe]} izbira]
  (let [cena (fn [seznam id] (or (some #(when (= (:id %) id) (:cena %)) seznam) 0))]
    (+ osnovna_cena
       (cena (:cela izvedbe) (:celo izbira))
       (cena (:pult izvedbe) (:pult izbira))
       (reduce + 0 (map #(cena (:dodatki izvedbe) %) (distinct (:dodatki izbira)))))))

(defn nov-zapis
  "Doda id, čas prejema in ceno."
  [zapis izdelek]
  (assoc zapis
         :id (str (UUID/randomUUID))
         :prejeto (str (Instant/now))
         :cena (izracunaj-ceno izdelek (:izbira zapis))))

(def ^:private zaklep (Object.))

(defn shrani!
  "Doda zapis kot eno EDN vrstico na konec datoteke povpraševanj."
  [zapis]
  (locking zaklep
    (let [pot config/*povprasevanja-pot*]
      (io/make-parents pot)
      (spit pot (str (pr-str zapis) "\n") :append true)))
  zapis)
