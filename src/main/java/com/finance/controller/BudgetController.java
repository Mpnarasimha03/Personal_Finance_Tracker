package com.finance.controller;

import com.finance.model.Budget;
import com.finance.model.User;
import com.finance.repository.BudgetRepository;
import com.finance.repository.ExpenseRepository;
import com.finance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @PostMapping
    public ResponseEntity<?> createBudget(@RequestBody Budget budget, Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            budget.setUser(user);
            Budget savedBudget = budgetRepository.save(budget);

            return ResponseEntity.ok(savedBudget);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create budget: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllBudgets(Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Budget> budgets = budgetRepository.findByUserId(user.getId());
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch budgets: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/month/{month}/year/{year}")
    public ResponseEntity<?> getBudgetsByMonthAndYear(@PathVariable int month, @PathVariable int year,
                                                       Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch budgets: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getBudgetProgress(@RequestParam int month, @RequestParam int year,
                                               Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);

            List<Map<String, Object>> progress = budgets.stream().map(budget -> {
                BigDecimal spent = expenseRepository.sumByUserIdAndCategoryAndMonthAndYear(
                        user.getId(), budget.getCategory(), month, year);

                if (spent == null) {
                    spent = BigDecimal.ZERO;
                }

                Map<String, Object> item = new HashMap<>();
                item.put("id", budget.getId());
                item.put("category", budget.getCategory());
                item.put("budgetAmount", budget.getBudgetAmount());
                item.put("spent", spent);
                item.put("remaining", budget.getBudgetAmount().subtract(spent));
                item.put("percentage", spent.divide(budget.getBudgetAmount(), 4, BigDecimal.ROUND_HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).intValue());

                return item;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to calculate budget progress: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(@PathVariable Long id, @RequestBody Budget budgetDetails,
                                         Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Budget budget = budgetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Budget not found"));

            if (!budget.getUser().getId().equals(user.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized");
                return ResponseEntity.status(403).body(error);
            }

            budget.setCategory(budgetDetails.getCategory());
            budget.setBudgetAmount(budgetDetails.getBudgetAmount());
            budget.setMonth(budgetDetails.getMonth());
            budget.setYear(budgetDetails.getYear());

            Budget updatedBudget = budgetRepository.save(budget);
            return ResponseEntity.ok(updatedBudget);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update budget: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Budget budget = budgetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Budget not found"));

            if (!budget.getUser().getId().equals(user.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized");
                return ResponseEntity.status(403).body(error);
            }

            budgetRepository.delete(budget);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Budget deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete budget: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
