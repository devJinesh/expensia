package com.fullStack.expenseTracker.dto.reponses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminTransactionViewDto {
    private Long transactionId;
    private double amount;
    private LocalDate date;
    private String categoryName;
    private String transactionTypeName;
}
