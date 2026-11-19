(ns kuhinja.podatki
  "Branje podatkov o izdelku (resources/izdelek.edn) in seznam fotografij."
  (:require [clojure.edn :as edn]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [kuhinja.config :as config]))

(defn izdelek
  "Prebere izdelek.edn s classpatha. Bere se ob vsaki zahtevi, zato
   sprememba datoteke velja brez ponovnega zagona strežnika."
  []
  (if-let [vir (io/resource "izdelek.edn")]
    (edn/read-string (slurp vir))
    (throw (ex-info "izdelek.edn ni na classpathu (pričakovano v resources/)" {}))))

(def ^:private koncnice-slik #{"jpg" "jpeg" "png" "webp" "avif" "gif"})

(defn koncnica
  "Končnica datoteke z malimi črkami ali nil."
  [ime]
  (some-> (re-find #"\.([^.]+)$" ime) second str/lower-case))

(defn slike
  "Poti do fotografij v public/slike, po abecedi, relativno na public/."
  []
  (let [mapa (io/file config/slike-mapa)]
    (if (.isDirectory mapa)
      (->> (.listFiles mapa)
           (filter #(.isFile ^java.io.File %))
           (map #(.getName ^java.io.File %))
           (filter #(koncnice-slik (koncnica %)))
           sort
           (mapv #(str "slike/" %)))
      [])))
