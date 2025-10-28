package com.fullStack.expenseTracker.dto.reponses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryBudgetResponseDto {
    private Long id;
    private double amount;
    private int month;
    private int year;
    private Integer categoryId;
    private String categoryName;
}
