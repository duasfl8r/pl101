(begin
    (define factorial
      (lambda (n)
        (if (= n 0) 1
            (* n (factorial (- n 1))))))
    (alert (factorial 6)))
;; -> 720
