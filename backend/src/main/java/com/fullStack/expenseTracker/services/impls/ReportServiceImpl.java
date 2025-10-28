package com.fullStack.expenseTracker.services.impls;

import com.fullStack.expenseTracker.dto.reponses.AccountSummaryDto;
import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.reponses.CategoryExpenseDto;
import com.fullStack.expenseTracker.dto.reponses.DashboardSummaryDto;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.dto.reponses.TransactionsMonthlySummaryDto;
import com.fullStack.expenseTracker.exceptions.UserNotFoundException;
import com.fullStack.expenseTracker.models.Account;
import com.fullStack.expenseTracker.models.User;
import com.fullStack.expenseTracker.repository.AccountRepository;
import com.fullStack.expenseTracker.repository.TransactionRepository;
import com.fullStack.expenseTracker.services.ReportService;
import com.fullStack.expenseTracker.services.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class ReportServiceImpl implements ReportService {

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    UserService userService;

    @Override
    public ResponseEntity<ApiResponseDto<?>> getTotalByTransactionTypeAndUser(Long userId, int transactionTypeId, int month, int year) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponseDto<>(ApiResponseStatus.SUCCESS,
                        HttpStatus.OK,
                        transactionRepository.findTotalByUserAndTransactionType(userId, transactionTypeId, month, year)
                )
        );
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getTotalNoOfTransactionsByUser(Long userId,  int month, int year) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponseDto<>(ApiResponseStatus.SUCCESS,
                        HttpStatus.OK,
                        transactionRepository.findTotalNoOfTransactionsByUser(userId, month, year)
                )
        );
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getTotalExpenseByCategoryAndUser(String email, int categoryId, int month, int year) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponseDto<>(ApiResponseStatus.SUCCESS,
                        HttpStatus.OK,
                        transactionRepository.findTotalByUserAndCategory(email, categoryId, month, year)
                )
        );
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getMonthlySummaryByUser(String email) {
        List<Object[]> result = transactionRepository.findMonthlySummaryByUser(email);

        List<TransactionsMonthlySummaryDto> transactionsMonthlySummary = result.stream()
                .map(data -> new TransactionsMonthlySummaryDto(
                        (int) data[0],      // year
                        (int) data[1],      // month
                        (double) data[2],   // totalIncome
                        (double) data[3]    // totalExpense
                )).toList();

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponseDto<>(ApiResponseStatus.SUCCESS,
                        HttpStatus.OK,
                        transactionsMonthlySummary
                )
        );
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getDashboardSummary(String email) throws UserNotFoundException {
        User user = userService.findByEmail(email);
        List<Account> accounts = accountRepository.findByUser(user);

        // Calculate consolidated balance
        double consolidatedBalance = accounts.stream()
                .mapToDouble(Account::getBalance)
                .sum();

        // Map accounts to AccountSummaryDto
        List<AccountSummaryDto> accountSummaries = accounts.stream()
                .map(account -> new AccountSummaryDto(
                        account.getId(),
                        account.getAccountName(),
                        account.getAccountType(),
                        account.getBalance()
                ))
                .toList();

        DashboardSummaryDto dashboardSummary = new DashboardSummaryDto(
                consolidatedBalance,
                accountSummaries
        );

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponseDto<>(ApiResponseStatus.SUCCESS,
                        HttpStatus.OK,
                        dashboardSummary
                )
        );
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getCategoryExpenseBreakdown(String email, int month, int year) {
        List<Object[]> result = transactionRepository.findCategoryExpenseBreakdown(email, month, year);

        List<CategoryExpenseDto> categoryExpenses = result.stream()
                .map(data -> new CategoryExpenseDto(
                        (String) data[0],
                        ((Number) data[1]).doubleValue()
               ))
                .toList();

        return ResponseEntity.status(HttpStatus.OK).body(
                new ApiResponseDto<>(ApiResponseStatus.SUCCESS,
                        HttpStatus.OK,
                        categoryExpenses
                )
        );
    }
}
