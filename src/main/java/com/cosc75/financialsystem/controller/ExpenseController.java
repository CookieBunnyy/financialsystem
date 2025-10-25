package com.cosc75.financialsystem.controller;

import com.cosc75.financialsystem.model.Expense;
import com.cosc75.financialsystem.model.Budget;
import com.cosc75.financialsystem.repository.ExpenseRepository;
import com.cosc75.financialsystem.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    // Get all expenses
    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    // Add a new expense
    @PostMapping
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        if (expense.getAmount() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        // Link to budget if budget ID provided
        if (expense.getBudget() != null && expense.getBudget().getId() != null) {
            Budget budget = budgetRepository.findById(expense.getBudget().getId()).orElse(null);
            expense.setBudget(budget);
        }

        expense.setDate(LocalDate.now());
        Expense savedExpense = expenseRepository.save(expense);
        return ResponseEntity.ok(savedExpense);
    }
}
