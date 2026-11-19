(ns kuhinja.server-test
  "Testi celotne poti zahteve skozi kuhinja.server/app (brez odpiranja vrat)."
  (:require [cheshire.core :as json]
            [clojure.edn :as edn]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.test :refer [deftest is testing]]
            [kuhinja.config :as config]
            [kuhinja.server :as server]))

(defn- zahteva
  ([metoda uri] (zahteva metoda uri nil))
  ([metoda uri telo]
   (server/app {:request-method metoda :uri uri
                :body (when telo (io/input-stream (.getBytes ^String telo "UTF-8")))})))

(defn- json-telo [odg] (json/parse-string (:body odg) true))

(deftest api-izdelek-test
  (let [odg (zahteva :get "/api/izdelek")]
    (is (= 200 (:status odg)))
    (is (number? (:osnovna_cena (json-telo odg))))))

(deftest staticne-datoteke-test
  (is (= 200 (:status (zahteva :get "/"))))
  (is (str/starts-with? (get-in (zahteva :get "/js/main.js") [:headers "Content-Type"]) "text/javascript"))
  (is (= 404 (:status (zahteva :get "/ni-tega"))))
  (testing "pot zunaj public/ ni dosegljiva"
    (is (= 404 (:status (zahteva :get "/../bb.edn"))))
    (is (= 404 (:status (zahteva :get "/../resources/izdelek.edn")))))
  (is (= 405 (:status (zahteva :delete "/api/izdelek")))))

(deftest povprasevanje-test
  (let [tmp (str (java.io.File/createTempFile "povprasevanja" ".edn"))]
    (binding [config/*povprasevanja-pot* tmp]
      (testing "veljavno povpraševanje se shrani, cena se izračuna na strežniku"
        (let [odg (zahteva :post "/api/povprasevanje"
                           (json/generate-string {:ime "Test" :email "t@primer.si" :cena 1
                                                  :izbira {:celo "antracit" :pult "svetel" :dodatki []}}))
              zapis (edn/read-string (first (str/split-lines (slurp tmp))))]
          (is (= 201 (:status odg)))
          (is (> (:cena (json-telo odg)) 1) "cena iz brskalnika se ne upošteva")
          (is (= "Test" (:ime zapis)))))

      (testing "napake"
        (is (= 422 (:status (zahteva :post "/api/povprasevanje" "{\"ime\":\"\",\"email\":\"x\"}"))))
        (is (= 400 (:status (zahteva :post "/api/povprasevanje" "ni json"))))
        (is (= 400 (:status (zahteva :post "/api/povprasevanje"))))
        (is (= 413 (:status (zahteva :post "/api/povprasevanje" (apply str (repeat 25000 "x"))))))))
    (io/delete-file tmp true)))
