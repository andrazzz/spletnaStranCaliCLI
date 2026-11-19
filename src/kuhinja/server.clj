(ns kuhinja.server
  "Vstopna točka strežnika: usmerjanje zahtev in zagon http-kit.
   Zagon: bb serve"
  (:require [cheshire.core :as json]
            [kuhinja.config :as config]
            [kuhinja.http :as http]
            [kuhinja.podatki :as podatki]
            [kuhinja.povprasevanja :as povprasevanja]
            [org.httpkit.server :as httpkit]))

(defn- preberi-telo
  "Telo zahteve kot niz ali ::prazno / ::preveliko."
  [req]
  (let [telo (some-> (:body req) slurp)]
    (cond
      (nil? telo)                             ::prazno
      (> (count telo) config/najvec-bajtov)   ::preveliko
      :else                                   telo)))

(defn- obdelaj-povprasevanje [req]
  (let [telo (preberi-telo req)]
    (case telo
      ::prazno    (http/json-odgovor 400 {:ok false :napaka "Prazna zahteva."})
      ::preveliko (http/json-odgovor 413 {:ok false :napaka "Zahteva je prevelika."})
      (let [vhod (try (json/parse-string telo true) (catch Exception _ nil))]
        (if-not (map? vhod)
          (http/json-odgovor 400 {:ok false :napaka "Neveljaven JSON."})
          (let [[napake zapis] (povprasevanja/preveri vhod)]
            (if (seq napake)
              (http/json-odgovor 422 {:ok false :napake napake})
              (let [zapis (-> zapis
                              (povprasevanja/nov-zapis (podatki/izdelek))
                              povprasevanja/shrani!)]
                (println "Novo povpraševanje:" (:ime zapis) (:email zapis) (:cena zapis) "EUR")
                (http/json-odgovor 201 {:ok true :id (:id zapis) :cena (:cena zapis)})))))))))

(defn app
  "Ring obdelovalec. Vrstni red: API poti, nato statične datoteke."
  [{:keys [request-method uri] :as req}]
  (try
    (case [request-method uri]
      [:get "/api/izdelek"]        (http/json-odgovor 200 (podatki/izdelek))
      [:get "/api/slike"]          (http/json-odgovor 200 (podatki/slike))
      [:post "/api/povprasevanje"] (obdelaj-povprasevanje req)
      (if (= request-method :get)
        (or (http/staticna uri) (http/besedilo-odgovor 404 "Ni najdeno."))
        (http/besedilo-odgovor 405 "Metoda ni dovoljena.")))
    (catch Exception e
      (binding [*out* *err*] (println "Napaka:" (.getMessage e)))
      (http/json-odgovor 500 {:ok false :napaka "Napaka na strežniku."}))))

(defn -main [& _]
  (httpkit/run-server #'app {:port config/vrata :ip config/ip})
  (println (str "Kuhinja Cali teče na http://localhost:" config/vrata "  (Ctrl+C za konec)"))
  @(promise))
