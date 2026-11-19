(ns kuhinja.http
  "Pomožne funkcije za HTTP odgovore in streženje statičnih datotek."
  (:require [cheshire.core :as json]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [kuhinja.config :as config]
            [kuhinja.podatki :as podatki]))

(def ^:private mime
  {"html" "text/html; charset=utf-8"
   "css"  "text/css; charset=utf-8"
   "js"   "text/javascript; charset=utf-8"
   "json" "application/json; charset=utf-8"
   "svg"  "image/svg+xml"
   "png"  "image/png"
   "jpg"  "image/jpeg"
   "jpeg" "image/jpeg"
   "webp" "image/webp"
   "avif" "image/avif"
   "gif"  "image/gif"
   "ico"  "image/x-icon"})

(defn json-odgovor [status telo]
  {:status  status
   :headers {"Content-Type"  "application/json; charset=utf-8"
             "Cache-Control" "no-store"}
   :body    (json/generate-string telo)})

(defn besedilo-odgovor [status besedilo]
  {:status status :headers {"Content-Type" "text/plain; charset=utf-8"} :body besedilo})

(defn- znotraj?
  "Ali je datoteka f res znotraj mape koren (varovalo pred ../ v poti)."
  [^java.io.File koren ^java.io.File f]
  (str/starts-with? (.getCanonicalPath f)
                    (str (.getCanonicalPath koren) java.io.File/separator)))

(defn staticna
  "Odgovor z datoteko iz public/ ali nil, če je ni (ali je pot zunaj public/)."
  [uri]
  (let [koren (io/file config/javna-mapa)
        f     (io/file koren (if (= uri "/") "index.html" (subs uri 1)))
        f     (if (.isDirectory f) (io/file f "index.html") f)]
    (when (and (znotraj? koren f) (.isFile f))
      {:status  200
       :headers {"Content-Type" (get mime (podatki/koncnica (.getName f)) "application/octet-stream")}
       :body    f})))
