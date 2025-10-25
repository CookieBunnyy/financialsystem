package com.cosc75.financialsystem.controller;

import com.cosc75.financialsystem.model.Budget;
import com.cosc75.financialsystem.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    // ✅ Get all budgets
    @GetMapping
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    // ✅ Add new budget
    @PostMapping
    public Budget createBudget(@RequestBody Budget budget) {
        return budgetRepository.save(budget);
    }

    // ✅ Get budget by ID
    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        return budgetRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Update budget
    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Budget updatedBudget) {
        return budgetRepository.findById(id)
                .map(budget -> {
                    budget.setAmount(updatedBudget.getAmount());
                    budget.setStartDate(updatedBudget.getStartDate());
                    budget.setEndDate(updatedBudget.getEndDate());
                    budgetRepository.save(budget);
                    return ResponseEntity.ok(budget);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Delete budget
    @DeleteMapping("/{id}")
    public String deleteBudget(@PathVariable Long id) {
        budgetRepository.deleteById(id);
        return "Budget deleted successfully!";
    }
}
