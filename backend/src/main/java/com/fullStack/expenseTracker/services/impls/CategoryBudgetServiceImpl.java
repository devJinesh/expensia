package com.fullStack.expenseTracker.services.impls;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.reponses.BudgetProgressDto;
import com.fullStack.expenseTracker.dto.reponses.CategoryBudgetResponseDto;
import com.fullStack.expenseTracker.dto.requests.CategoryBudgetRequestDto;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.exceptions.CategoryNotFoundException;
import com.fullStack.expenseTracker.exceptions.UserNotFoundException;
import com.fullStack.expenseTracker.models.Category;
import com.fullStack.expenseTracker.models.CategoryBudget;
import com.fullStack.expenseTracker.models.User;
import com.fullStack.expenseTracker.repository.CategoryBudgetRepository;
import com.fullStack.expenseTracker.repository.TransactionRepository;
import com.fullStack.expenseTracker.services.CategoryBudgetService;
import com.fullStack.expenseTracker.services.CategoryService;
import com.fullStack.expenseTracker.services.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class CategoryBudgetServiceImpl implements CategoryBudgetService {

    @Autowired
    private CategoryBudgetRepository categoryBudgetRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    public ResponseEntity<ApiResponseDto<?>> createBudget(CategoryBudgetRequestDto requestDto) 
            throws UserNotFoundException, CategoryNotFoundException {
        User user = userService.findByEmail(requestDto.getEmail());
        Category category = categoryService.getCategoryById(requestDto.getCategoryId());

        CategoryBudget budget = new CategoryBudget(
                requestDto.getAmount(),
                requestDto.getMonth(),
                requestDto.getYear(),
                user,
                category
        );

        categoryBudgetRepository.save(budget);

        CategoryBudgetResponseDto responseDto = mapToResponseDto(budget);

        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.CREATED,
                responseDto
        ));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getBudgetsByUser(String email, int month, int year) 
            throws UserNotFoundException {
        User user = userService.findByEmail(email);
        List<CategoryBudget> budgets = categoryBudgetRepository.findByUserAndMonthAndYear(user, month, year);

        List<CategoryBudgetResponseDto> responseDtos = budgets.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                responseDtos
        ));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> updateBudget(Long budgetId, CategoryBudgetRequestDto requestDto) 
            throws Exception {
        User user = userService.findByEmail(requestDto.getEmail());
        CategoryBudget budget = categoryBudgetRepository.findByIdAndUser(budgetId, user)
                .orElseThrow(() -> new Exception("Budget not found"));

        budget.setAmount(requestDto.getAmount());
        budget.setMonth(requestDto.getMonth());
        budget.setYear(requestDto.getYear());
        
        if (requestDto.getCategoryId() != null) {
            Category category = categoryService.getCategoryById(requestDto.getCategoryId());
            budget.setCategory(category);
        }

        categoryBudgetRepository.save(budget);

        CategoryBudgetResponseDto responseDto = mapToResponseDto(budget);

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                responseDto
        ));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> deleteBudget(Long budgetId, String email) throws Exception {
        User user = userService.findByEmail(email);
        CategoryBudget budget = categoryBudgetRepository.findByIdAndUser(budgetId, user)
                .orElseThrow(() -> new Exception("Budget not found"));

        categoryBudgetRepository.delete(budget);

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                "Budget deleted successfully"
        ));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getBudgetProgress(String email, int month, int year) 
            throws UserNotFoundException {
        User user = userService.findByEmail(email);
        List<CategoryBudget> budgets = categoryBudgetRepository.findByUserAndMonthAndYear(user, month, year);

        List<BudgetProgressDto> progressList = budgets.stream()
                .map(budget -> {
                    // Get total spending for this category in the given month/year
                    Double spending = transactionRepository.findTotalByUserAndCategory(
                            email, 
                            budget.getCategory().getCategoryId(), 
                            month, 
                            year
                    );
                    
                    double currentSpending = spending != null ? spending : 0.0;
                    double percentageUsed = (currentSpending / budget.getAmount()) * 100;
                    boolean isOverBudget = currentSpending > budget.getAmount();

                    return new BudgetProgressDto(
                            budget.getId(),
                            budget.getCategory().getCategoryName(),
                            budget.getAmount(),
                            currentSpending,
                            percentageUsed,
                            isOverBudget
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                progressList
        ));
    }

    private CategoryBudgetResponseDto mapToResponseDto(CategoryBudget budget) {
        return new CategoryBudgetResponseDto(
                budget.getId(),
                budget.getAmount(),
                budget.getMonth(),
                budget.getYear(),
                budget.getCategory().getCategoryId(),
                budget.getCategory().getCategoryName()
        );
    }
}
