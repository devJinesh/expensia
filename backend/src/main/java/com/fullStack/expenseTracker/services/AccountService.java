package com.fullStack.expenseTracker.services;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.requests.AccountRequestDto;
import com.fullStack.expenseTracker.exceptions.AccountNotFoundException;
import com.fullStack.expenseTracker.exceptions.UserNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public interface AccountService {
    ResponseEntity<ApiResponseDto<?>> createAccount(AccountRequestDto accountRequestDto) throws UserNotFoundException;
    ResponseEntity<ApiResponseDto<?>> getAccountsByUser(String email) throws UserNotFoundException;
    ResponseEntity<ApiResponseDto<?>> getAccountById(Long accountId, String email) throws AccountNotFoundException, UserNotFoundException;
    ResponseEntity<ApiResponseDto<?>> updateAccount(Long accountId, AccountRequestDto accountRequestDto) throws AccountNotFoundException, UserNotFoundException;
    ResponseEntity<ApiResponseDto<?>> deleteAccount(Long accountId, String email) throws AccountNotFoundException, UserNotFoundException;
}
