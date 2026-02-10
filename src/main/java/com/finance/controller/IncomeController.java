package com.finance.controller;

import com.finance.model.Income;
import com.finance.model.User;
import com.finance.repository.IncomeRepository;
import com.finance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incomes")
@CrossOrigin(origins = "*")
public class IncomeController {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createIncome(@RequestBody Income income, Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            income.setUser(user);
            Income savedIncome = incomeRepository.save(income);

            return ResponseEntity.ok(savedIncome);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create income: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllIncomes(Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Income> incomes = incomeRepository.findByUserIdOrderByTransactionDateDesc(user.getId());
            return ResponseEntity.ok(incomes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to fetch incomes: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncome(@PathVariable Long id, @RequestBody Income incomeDetails,
                                         Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Income income = incomeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Income not found"));

            if (!income.getUser().getId().equals(user.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized");
                return ResponseEntity.status(403).body(error);
            }

            income.setAmount(incomeDetails.getAmount());
            income.setSource(incomeDetails.getSource());
            income.setDescription(incomeDetails.getDescription());
            income.setFrequency(incomeDetails.getFrequency());
            income.setTransactionDate(incomeDetails.getTransactionDate());
            income.setRecurring(incomeDetails.isRecurring());

            Income updatedIncome = incomeRepository.save(income);
            return ResponseEntity.ok(updatedIncome);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update income: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncome(@PathVariable Long id, Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Income income = incomeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Income not found"));

            if (!income.getUser().getId().equals(user.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Unauthorized");
                return ResponseEntity.status(403).body(error);
            }

            incomeRepository.delete(income);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Income deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete income: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
