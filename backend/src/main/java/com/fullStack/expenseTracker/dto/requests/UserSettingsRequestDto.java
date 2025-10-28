package com.fullStack.expenseTracker.dto.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSettingsRequestDto {
    
    @NotBlank(message = "Email is required")
    @Email
    private String email;
    
    private String timezone;
    
    private String currency;
}
