package com.cosc75.financialsystem.controller;

import com.cosc75.financialsystem.model.Transaction;
import com.cosc75.financialsystem.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    // Get all transactions
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    // Add a new transaction
    @PostMapping
    public Transaction addTransaction(@RequestBody Transaction transaction) {
        transaction.setDate(LocalDate.now());
        return transactionRepository.save(transaction);
    }
}
