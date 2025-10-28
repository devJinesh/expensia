package com.fullStack.expenseTracker.dto.requests;

import com.fullStack.expenseTracker.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountRequestDto {
    
    @NotBlank(message = "Account name is required")
    private String accountName;
    
    @NotNull(message = "Account type is required")
    private AccountType accountType;
    
    private double balance;
    
    @NotBlank(message = "User email is required")
    private String email;
}
