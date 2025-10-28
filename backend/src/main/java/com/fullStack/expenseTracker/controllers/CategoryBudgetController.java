package com.fullStack.expenseTracker.controllers;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.requests.CategoryBudgetRequestDto;
import com.fullStack.expenseTracker.services.CategoryBudgetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/expensia/budgets")
public class CategoryBudgetController {

    @Autowired
    private CategoryBudgetService categoryBudgetService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> createBudget(@RequestBody @Valid CategoryBudgetRequestDto requestDto)
            throws Exception {
        return categoryBudgetService.createBudget(requestDto);
    }

    @GetMapping("/getByUser")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> getBudgetsByUser(@Param("email") String email,
                                                               @Param("month") int month,
                                                               @Param("year") int year) throws Exception {
        return categoryBudgetService.getBudgetsByUser(email, month, year);
    }

    @GetMapping("/progress")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> getBudgetProgress(@Param("email") String email,
                                                                @Param("month") int month,
                                                                @Param("year") int year) throws Exception {
        return categoryBudgetService.getBudgetProgress(email, month, year);
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> updateBudget(@Param("budgetId") Long budgetId,
                                                           @RequestBody @Valid CategoryBudgetRequestDto requestDto)
            throws Exception {
        return categoryBudgetService.updateBudget(budgetId, requestDto);
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> deleteBudget(@Param("budgetId") Long budgetId,
                                                           @Param("email") String email) throws Exception {
        return categoryBudgetService.deleteBudget(budgetId, email);
    }
}
