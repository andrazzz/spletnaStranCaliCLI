(ns kuhinja.build
  "Izvoz podatkov v JSON, da stran deluje tudi brez strežnika
   (GitHub Pages, Netlify, python -m http.server). Zagon: bb build"
  (:require [cheshire.core :as json]
            [clojure.java.io :as io]
            [kuhinja.podatki :as podatki]))

(defn- zapisi! [pot vsebina]
  (io/make-parents pot)
  (spit pot (json/generate-string vsebina {:pretty true}))
  (println "zapisano:" pot))

(defn -main [& _]
  (zapisi! "public/data/izdelek.json" (podatki/izdelek))
  (zapisi! "public/slike/slike.json" (podatki/slike)))
