package com.fullStack.expenseTracker.dto.reponses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponseDto {

    private Long id;

    private CategoryDto category;

    private TransactionTypeDto transactionType;

    private AccountDto account;

    private String description;

    private double amount;

    private LocalDate date;

    private LocalDateTime timestamp;

    private String userEmail;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryDto {
        private int id;
        private String name;
        private TransactionTypeDto transactionType;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TransactionTypeDto {
        private int id;
        private String name;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AccountDto {
        private Long id;
        private String accountName;
        private String accountType;
    }

}
