(ns kuhinja.povprasevanja-test
  (:require [clojure.test :refer [deftest is testing]]
            [kuhinja.povprasevanja :as p]))

(def izdelek
  {:osnovna_cena 1000
   :izvedbe {:cela    [{:id "a" :cena 0} {:id "b" :cena 100}]
             :pult    [{:id "x" :cena 0} {:id "y" :cena 50}]
             :dodatki [{:id "d1" :cena 10} {:id "d2" :cena 20}]}})

(deftest preveri-test
  (testing "veljaven vhod nima napak in je očiščen"
    (let [[napake zapis] (p/preveri {:ime "  Ana  " :email "ana@primer.si"
                                     :izbira {:celo "b" :dodatki ["d1" 5 ""]}})]
      (is (empty? napake))
      (is (= "Ana" (:ime zapis)))
      (is (= ["d1"] (get-in zapis [:izbira :dodatki])) "neveljavni dodatki se zavržejo")))

  (testing "manjkajoče ime in napačen e-poštni naslov"
    (let [[napake _] (p/preveri {:ime "   " :email "ni-naslov"})]
      (is (= #{:ime :email} (set (keys napake))))))

  (testing "predolgo besedilo se skrajša"
    (let [[_ zapis] (p/preveri {:ime "A" :email "a@b.si" :sporocilo (apply str (repeat 5000 "x"))})]
      (is (= 4000 (count (:sporocilo zapis)))))))

(deftest izracunaj-ceno-test
  (is (= 1000 (p/izracunaj-ceno izdelek nil)) "brez izbire je osnovna cena")
  (is (= 1180 (p/izracunaj-ceno izdelek {:celo "b" :pult "y" :dodatki ["d1" "d2"]})))
  (is (= 1010 (p/izracunaj-ceno izdelek {:celo "neznan" :dodatki ["d1" "d1" "neznan"]}))
      "neznani id-ji so 0 €, podvojen dodatek se šteje enkrat"))
