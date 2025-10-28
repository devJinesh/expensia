package com.fullStack.expenseTracker.dto.requests;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryBudgetRequestDto {
    
    @NotNull(message = "Amount is required")
    private Double amount;
    
    @NotNull(message = "Month is required")
    private Integer month;
    
    @NotNull(message = "Year is required")
    private Integer year;
    
    @NotNull(message = "Category ID is required")
    private Integer categoryId;
    
    @NotNull(message = "User email is required")
    private String email;
}
