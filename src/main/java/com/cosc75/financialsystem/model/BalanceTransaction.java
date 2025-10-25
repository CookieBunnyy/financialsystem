package com.cosc75.financialsystem.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "balance_transactions")
public class BalanceTransaction {

    public enum TransactionType {
        DEPOSIT, WITHDRAW, EXPENSE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private double amount;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private LocalDate date;

    public BalanceTransaction() {}

    public BalanceTransaction(String description, double amount, TransactionType type, LocalDate date) {
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.date = date;
    }

    // Convenience constructor for auto-setting date
    public BalanceTransaction(String description, double amount, TransactionType type) {
        this(description, amount, type, LocalDate.now());
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
