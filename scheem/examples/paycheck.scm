;;
;; Paycheck
;; By Jerry Smith, adapted by Lucas Teixeira for Scheem :)
;;
(begin
    (define  commission
      (lambda (sales commission-rate)
           (* sales commission-rate)))
          
    (define hourly-wages
      (lambda (no-hours hourly-rate)
        (if (< no-hours 40)
              (* no-hours hourly-rate)
              (+(* 40 hourly-rate)
               (*(- no-hours 40)
                  hourly-rate
                        1.5)))))
    (define calc-pay
      (lambda (formula base rate)
      (formula base rate)))
   (calc-pay hourly-wages 50 10))

;; A sample run would resemble the following: 
;; 
;; [1](commission 100 .04)
;; 4.
;; [2](hourly-wages 50 10)
;; 550.
;; [3](calc-pay commission 100 .04)
;; 4.
;; [4](calc-pay hourly-wages 50 10)
;; 550.
