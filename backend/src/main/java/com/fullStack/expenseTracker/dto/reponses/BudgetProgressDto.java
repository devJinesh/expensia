package com.fullStack.expenseTracker.dto.reponses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BudgetProgressDto {
    private Long budgetId;
    private String categoryName;
    private double budgetedAmount;
    private double currentSpending;
    private double percentageUsed;
    private boolean isOverBudget;
}
