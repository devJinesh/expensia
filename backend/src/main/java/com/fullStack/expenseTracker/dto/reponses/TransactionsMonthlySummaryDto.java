package com.fullStack.expenseTracker.dto.reponses;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TransactionsMonthlySummaryDto {

    private int year;

    private int month;

    private double totalIncome;

    private double totalExpense;
}
