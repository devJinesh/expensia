package com.fullStack.expenseTracker.dto.reponses;

import com.fullStack.expenseTracker.enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountSummaryDto {
    private Long accountId;
    private String accountName;
    private AccountType accountType;
    private double balance;
}
