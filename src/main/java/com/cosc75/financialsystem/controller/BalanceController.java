package com.cosc75.financialsystem.controller;

import com.cosc75.financialsystem.model.BalanceTransaction;
import com.cosc75.financialsystem.service.BalanceService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class BalanceController {

    private final BalanceService balanceService;

    public BalanceController(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    @GetMapping("/balance")
    public ResponseEntity<Double> getBalance() {
        return ResponseEntity.ok(balanceService.getBalance());
    }

    @GetMapping("/balance/transactions")
    public List<BalanceTransaction> getTransactions() {
        return balanceService.getTransactions();
    }

    @PostMapping("/balance/transaction")
    public ResponseEntity<BalanceTransaction> addTransaction(@RequestBody BalanceTransaction transaction) {
        try {
            BalanceTransaction saved = balanceService.addTransaction(
                    transaction.getDescription(),
                    transaction.getAmount(),
                    transaction.getType()
            );
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}
