package com.fullStack.expenseTracker.services;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.requests.CategoryBudgetRequestDto;
import com.fullStack.expenseTracker.exceptions.CategoryNotFoundException;
import com.fullStack.expenseTracker.exceptions.UserNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public interface CategoryBudgetService {
    ResponseEntity<ApiResponseDto<?>> createBudget(CategoryBudgetRequestDto requestDto) throws UserNotFoundException, CategoryNotFoundException;
    ResponseEntity<ApiResponseDto<?>> getBudgetsByUser(String email, int month, int year) throws UserNotFoundException;
    ResponseEntity<ApiResponseDto<?>> updateBudget(Long budgetId, CategoryBudgetRequestDto requestDto) throws Exception;
    ResponseEntity<ApiResponseDto<?>> deleteBudget(Long budgetId, String email) throws Exception;
    ResponseEntity<ApiResponseDto<?>> getBudgetProgress(String email, int month, int year) throws UserNotFoundException;
}
