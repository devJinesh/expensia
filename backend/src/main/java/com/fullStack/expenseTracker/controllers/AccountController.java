package com.fullStack.expenseTracker.controllers;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.requests.AccountRequestDto;
import com.fullStack.expenseTracker.exceptions.AccountNotFoundException;
import com.fullStack.expenseTracker.exceptions.UserNotFoundException;
import com.fullStack.expenseTracker.services.AccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/expensia/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> createAccount(@RequestBody @Valid AccountRequestDto accountRequestDto)
            throws UserNotFoundException {
        return accountService.createAccount(accountRequestDto);
    }

    @GetMapping("/getByUser")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> getAccountsByUser(@Param("email") String email)
            throws UserNotFoundException {
        return accountService.getAccountsByUser(email);
    }

    @GetMapping("/getById")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> getAccountById(@Param("accountId") Long accountId,
                                                             @Param("email") String email)
            throws AccountNotFoundException, UserNotFoundException {
        return accountService.getAccountById(accountId, email);
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> updateAccount(@Param("accountId") Long accountId,
                                                            @RequestBody @Valid AccountRequestDto accountRequestDto)
            throws AccountNotFoundException, UserNotFoundException {
        return accountService.updateAccount(accountId, accountRequestDto);
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> deleteAccount(@Param("accountId") Long accountId,
                                                            @Param("email") String email)
            throws AccountNotFoundException, UserNotFoundException {
        return accountService.deleteAccount(accountId, email);
    }
}
