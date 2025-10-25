package com.cosc75.financialsystem.service;

import com.cosc75.financialsystem.model.BalanceTransaction;
import com.cosc75.financialsystem.repository.BalanceTransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BalanceService {

    private final BalanceTransactionRepository transactionRepository;

    public BalanceService(BalanceTransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // Get current balance
    public double getBalance() {
        List<BalanceTransaction> transactions = transactionRepository.findAll();
        double income = transactions.stream()
                .filter(t -> t.getType() == BalanceTransaction.TransactionType.DEPOSIT)
                .mapToDouble(BalanceTransaction::getAmount)
                .sum();
        double expense = transactions.stream()
                .filter(t -> t.getType() == BalanceTransaction.TransactionType.WITHDRAW
                        || t.getType() == BalanceTransaction.TransactionType.EXPENSE)
                .mapToDouble(BalanceTransaction::getAmount)
                .sum();
        return income - expense;
    }

    // Get all transactions
    public List<BalanceTransaction> getTransactions() {
        return transactionRepository.findAll();
    }

    // Add transaction
    public BalanceTransaction addTransaction(String description, double amount, BalanceTransaction.TransactionType type) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        // Check balance if withdraw
        if (type == BalanceTransaction.TransactionType.WITHDRAW || type == BalanceTransaction.TransactionType.EXPENSE) {
            double currentBalance = getBalance();
            if (amount > currentBalance) {
                throw new IllegalArgumentException("Not enough balance");
            }
        }

        BalanceTransaction transaction = new BalanceTransaction(description, amount, type);
        return transactionRepository.save(transaction);
    }

    // Helper to map frontend string to enum
    public static BalanceTransaction.TransactionType parseType(String typeStr) {
        switch (typeStr.toLowerCase()) {
            case "deposit": return BalanceTransaction.TransactionType.DEPOSIT;
            case "withdraw": return BalanceTransaction.TransactionType.WITHDRAW;
            case "expense": return BalanceTransaction.TransactionType.EXPENSE;
            default: throw new IllegalArgumentException("Invalid transaction type: " + typeStr);
        }
    }
}
