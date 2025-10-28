package com.fullStack.expenseTracker.services.impls;

import com.fullStack.expenseTracker.dto.reponses.AccountResponseDto;
import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.requests.AccountRequestDto;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.exceptions.AccountNotFoundException;
import com.fullStack.expenseTracker.exceptions.UserNotFoundException;
import com.fullStack.expenseTracker.models.Account;
import com.fullStack.expenseTracker.models.User;
import com.fullStack.expenseTracker.repository.AccountRepository;
import com.fullStack.expenseTracker.services.AccountService;
import com.fullStack.expenseTracker.services.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserService userService;

    @Override
    public ResponseEntity<ApiResponseDto<?>> createAccount(AccountRequestDto accountRequestDto) throws UserNotFoundException {
        User user = userService.findByEmail(accountRequestDto.getEmail());

        Account account = new Account(
                accountRequestDto.getAccountName(),
                accountRequestDto.getAccountType(),
                accountRequestDto.getBalance(),
                user
        );

        accountRepository.save(account);

        AccountResponseDto responseDto = mapToResponseDto(account);

        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.CREATED,
                responseDto
        ));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getAccountsByUser(String email) throws UserNotFoundException {
        User user = userService.findByEmail(email);
        List<Account> accounts = accountRepository.findByUser(user);

        List<AccountResponseDto> responseDtos = accounts.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                responseDtos
        ));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getAccountById(Long accountId, String email) throws AccountNotFoundException, UserNotFoundException {
        User user = userService.findByEmail(email);
        Account account = accountRepository.findByIdAndUser(accountId, user)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + accountId));

        AccountResponseDto responseDto = mapToResponseDto(account);

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                responseDto
        ));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> updateAccount(Long accountId, AccountRequestDto accountRequestDto) throws AccountNotFoundException, UserNotFoundException {
        User user = userService.findByEmail(accountRequestDto.getEmail());
        Account account = accountRepository.findByIdAndUser(accountId, user)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + accountId));

        account.setAccountName(accountRequestDto.getAccountName());
        account.setAccountType(accountRequestDto.getAccountType());
        account.setBalance(accountRequestDto.getBalance());

        accountRepository.save(account);

        AccountResponseDto responseDto = mapToResponseDto(account);

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                responseDto
        ));
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> deleteAccount(Long accountId, String email) throws AccountNotFoundException, UserNotFoundException {
        User user = userService.findByEmail(email);
        Account account = accountRepository.findByIdAndUser(accountId, user)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + accountId));

        accountRepository.delete(account);

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                "Account deleted successfully"
        ));
    }

    private AccountResponseDto mapToResponseDto(Account account) {
        return new AccountResponseDto(
                account.getId(),
                account.getAccountName(),
                account.getAccountType(),
                account.getBalance()
        );
    }
}
