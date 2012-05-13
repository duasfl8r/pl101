;;
;; primes
;; By Ozan Yigit, adapted by Lucas Teixeira for Scheem :)
;;
(begin
    (define interval-list
      (lambda (m n)
          (if (> m n)
              '()
              (cons m (interval-list (+ 1 m) n)))))

    (define sieve 
      (lambda (l)
          (begin
              (define remove-multiples
                (lambda (n l)
                    (if (null? l)
                         '()
                         (if  (= (modulo (car l) n) 0)
                              (remove-multiples n (cdr l))
                              (cons (car l)
                                    (remove-multiples n (cdr l)))))))

              (if (null? l)
                  '()
                  (cons (car l)
                         (sieve (remove-multiples (car l) (cdr l))))))))

    (define primes<= 
      (lambda (n)
          (sieve (interval-list 2 n))))
    (primes<= 30))
