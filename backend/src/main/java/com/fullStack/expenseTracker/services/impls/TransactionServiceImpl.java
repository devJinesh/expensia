package com.fullStack.expenseTracker.services.impls;

import com.fullStack.expenseTracker.dto.reponses.*;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.enums.ETransactionType;
import com.fullStack.expenseTracker.exceptions.*;
import com.fullStack.expenseTracker.services.CategoryService;
import com.fullStack.expenseTracker.services.TransactionService;
import com.fullStack.expenseTracker.services.UserService;
import com.fullStack.expenseTracker.dto.requests.TransactionRequestDto;
import com.fullStack.expenseTracker.models.Account;
import com.fullStack.expenseTracker.models.Transaction;
import com.fullStack.expenseTracker.repository.AccountRepository;
import com.fullStack.expenseTracker.repository.TransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    UserService userService;

    @Autowired
    CategoryService categoryService;

    @Autowired
    AccountRepository accountRepository;

    @Override
    public ResponseEntity<ApiResponseDto<?>> addTransaction(TransactionRequestDto transactionRequestDto)
            throws UserNotFoundException, CategoryNotFoundException, TransactionServiceLogicException {
        Transaction transaction = TransactionRequestDtoToTransaction(transactionRequestDto);
        try {
            transactionRepository.save(transaction);
            
            if (transaction.getAccount() != null) {
                updateAccountBalance(transaction, true);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS,
                            HttpStatus.CREATED,
                            "Transaction has been successfully recorded!"
                    )
            );

        }catch(Exception e) {
            log.error("Error happen when adding new transaction: " + e.getMessage());
            throw new TransactionServiceLogicException("Failed to record your new transaction, Try again later!");
        }

    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getTransactionsByUser(String email,
                                                                   int pageNumber, int pageSize,
                                                                   String searchKey, String sortField,
                                                                   String sortDirec, String transactionType)
            throws TransactionServiceLogicException {

        Sort.Direction direction = Sort.Direction.ASC;
        if (sortDirec.equalsIgnoreCase("DESC")) {
            direction = Sort.Direction.DESC;
        }

        Pageable pageable =  PageRequest.of(pageNumber, pageSize).withSort(direction, sortField);

        Page<Transaction> transactions = transactionRepository.findByUser(email,
                pageable, searchKey, transactionType);

        try {
            if (transactions.getTotalElements() == 0) {
                return ResponseEntity.status(HttpStatus.OK).body(
                        new ApiResponseDto<>(
                                ApiResponseStatus.SUCCESS,
                                HttpStatus.OK,
                                new PageResponseDto<>(
                                        new ArrayList<>(),
                                        0,
                                        0L
                                )
                        )
                );
            }

            List<TransactionResponseDto> transactionResponseDtoList = new ArrayList<>();

            for (Transaction transaction: transactions) {
                transactionResponseDtoList.add(transactionToTransactionResponseDto(transaction));
            }

            return ResponseEntity.status(HttpStatus.OK).body(
                    new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS,
                            HttpStatus.OK,
                            new PageResponseDto<>(
                                    groupTransactionsByDate(transactionResponseDtoList),
                                    transactions.getTotalPages(),
                                    transactions.getTotalElements()
                            )
                    )
            );
        } catch (Exception e) {
            log.error("Error happen when retrieving transactions of a user: " + e.getMessage());
            throw new TransactionServiceLogicException("Failed to fetch your transactions! Try again later");
        }

    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getTransactionById(Long transactionId)
            throws TransactionNotFoundException {
        Transaction transaction = transactionRepository.findById(transactionId).orElseThrow(
                () -> new TransactionNotFoundException("Transaction not found with id : " + transactionId)
        );

        return ResponseEntity.ok(
                new ApiResponseDto<>(
                        ApiResponseStatus.SUCCESS,
                        HttpStatus.OK,
                        transactionToTransactionResponseDto(transaction)
                )
        );
    }

    public ResponseEntity<ApiResponseDto<?>> updateTransaction(Long transactionId, TransactionRequestDto transactionRequestDto)
            throws TransactionNotFoundException, UserNotFoundException, CategoryNotFoundException, TransactionServiceLogicException {

        Transaction transaction = transactionRepository.findById(transactionId).orElseThrow(
                () -> new TransactionNotFoundException("Transaction not found with id : " + transactionId)
        );

        if (transaction.getAccount() != null) {
            updateAccountBalance(transaction, false);
        }

        transaction.setAmount(transactionRequestDto.getAmount());
        transaction.setDate(transactionRequestDto.getDate());
        transaction.setUser(userService.findByEmail(transactionRequestDto.getUserEmail()));
        transaction.setCategory(categoryService.getCategoryById(transactionRequestDto.getCategoryId()));
        transaction.setDescription(transactionRequestDto.getDescription());
        
        if (transactionRequestDto.getTimestamp() != null) {
            transaction.setTimestamp(transactionRequestDto.getTimestamp());
        }
        
        if (transactionRequestDto.getAccountId() != null) {
            Account account = accountRepository.findById(transactionRequestDto.getAccountId()).orElse(null);
            transaction.setAccount(account);
        } else {
            transaction.setAccount(null);
        }

        try {
            transactionRepository.save(transaction);
            
            if (transaction.getAccount() != null) {
                updateAccountBalance(transaction, true);
            }
            
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS,
                            HttpStatus.OK,
                            "Transaction has been successfully updated!"
                    )
            );
        }catch(Exception e) {
            log.error("Error happen when retrieving transactions of a user: " + e.getMessage());
            throw new TransactionServiceLogicException("Failed to update your transactions! Try again later");
        }

    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> deleteTransaction(Long transactionId) throws TransactionNotFoundException, TransactionServiceLogicException {

        if (transactionRepository.existsById(transactionId)) {
            try {
                Transaction transaction = transactionRepository.findById(transactionId).orElseThrow();
                
                if (transaction.getAccount() != null) {
                    updateAccountBalance(transaction, false);
                }
                
                transactionRepository.deleteById(transactionId);
                return ResponseEntity.status(HttpStatus.OK).body(
                        new ApiResponseDto<>(
                                ApiResponseStatus.SUCCESS,
                                HttpStatus.OK,
                                "Transaction has been successfully deleted!"
                        )
                );
            }catch(Exception e) {
                log.error("Error happen when retrieving transactions of a user: " + e.getMessage());
                throw new TransactionServiceLogicException("Failed to delete your transactions! Try again later");
            }
        }else {
            throw new TransactionNotFoundException("Transaction not found with id : " + transactionId);
        }

    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getAllTransactions(int pageNumber, int pageSize, String searchKey) throws TransactionServiceLogicException {
        Pageable pageable =  PageRequest.of(pageNumber, pageSize).withSort(Sort.Direction.DESC, "transaction_id");

        Page<Transaction> transactions = transactionRepository.findAll(pageable, searchKey);

        try {
            if (transactions.getTotalElements() == 0) {
                return ResponseEntity.status(HttpStatus.OK).body(
                        new ApiResponseDto<>(
                                ApiResponseStatus.SUCCESS,
                                HttpStatus.OK,
                                new PageResponseDto<>(
                                        new ArrayList<>(),
                                        0,
                                        0L
                                )
                        )
                );
            }
            List<AdminTransactionViewDto> adminTransactionList = new ArrayList<>();

            for (Transaction transaction: transactions) {
                adminTransactionList.add(transactionToAdminViewDto(transaction));
            }

            return ResponseEntity.status(HttpStatus.OK).body(
                    new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS,
                            HttpStatus.OK,
                            new PageResponseDto<>(
                                    adminTransactionList,
                                    transactions.getTotalPages(),
                                    transactions.getTotalElements()
                            )
                    )
            );
        }catch (Exception e) {
            log.error("Failed to fetch All transactions: " + e.getMessage());
            throw new TransactionServiceLogicException("Failed to fetch All transactions: Try again later!");
        }
    }

    private Transaction TransactionRequestDtoToTransaction(TransactionRequestDto transactionRequestDto) throws UserNotFoundException, CategoryNotFoundException {
        Account account = null;
        if (transactionRequestDto.getAccountId() != null) {
            account = accountRepository.findById(transactionRequestDto.getAccountId()).orElse(null);
        }
        
        Transaction transaction = new Transaction(
                userService.findByEmail(transactionRequestDto.getUserEmail()),
                categoryService.getCategoryById(transactionRequestDto.getCategoryId()),
                account,
                transactionRequestDto.getDescription(),
                transactionRequestDto.getAmount(),
                transactionRequestDto.getDate()
        );
        
        if (transactionRequestDto.getTimestamp() != null) {
            transaction.setTimestamp(transactionRequestDto.getTimestamp());
        }
        
        return transaction;
    }
    
    private void updateAccountBalance(Transaction transaction, boolean isAdding) {
        Account account = transaction.getAccount();
        if (account == null) return;
        
        ETransactionType transactionType = transaction.getCategory().getTransactionType().getTransactionTypeName();
        double amount = transaction.getAmount();
        
        if (isAdding) {
            if (transactionType == ETransactionType.TYPE_INCOME) {
                account.setBalance(account.getBalance() + amount);
            } else if (transactionType == ETransactionType.TYPE_EXPENSE) {
                account.setBalance(account.getBalance() - amount);
            }
        } else {
            if (transactionType == ETransactionType.TYPE_INCOME) {
                account.setBalance(account.getBalance() - amount);
            } else if (transactionType == ETransactionType.TYPE_EXPENSE) {
                account.setBalance(account.getBalance() + amount);
            }
        }
        
        accountRepository.save(account);
    }

    private TransactionResponseDto transactionToTransactionResponseDto(Transaction transaction) {
        TransactionResponseDto.TransactionTypeDto transactionTypeDto = null;
        if (transaction.getCategory() != null && transaction.getCategory().getTransactionType() != null) {
            transactionTypeDto = new TransactionResponseDto.TransactionTypeDto(
                    transaction.getCategory().getTransactionType().getTransactionTypeId(),
                    transaction.getCategory().getTransactionType().getTransactionTypeName().name().replace("TYPE_", "")
            );
        }
        
        TransactionResponseDto.CategoryDto categoryDto = null;
        if (transaction.getCategory() != null) {
            categoryDto = new TransactionResponseDto.CategoryDto(
                    transaction.getCategory().getCategoryId(),
                    transaction.getCategory().getCategoryName(),
                    transactionTypeDto
            );
        }
        
        TransactionResponseDto.AccountDto accountDto = null;
        if (transaction.getAccount() != null) {
            accountDto = new TransactionResponseDto.AccountDto(
                    transaction.getAccount().getId(),
                    transaction.getAccount().getAccountName(),
                    transaction.getAccount().getAccountType().name()
            );
        }
        
        return new TransactionResponseDto(
                transaction.getTransactionId(),
                categoryDto,
                transactionTypeDto,
                accountDto,
                transaction.getDescription(),
                transaction.getAmount(),
                transaction.getDate(),
                transaction.getTimestamp(),
                transaction.getUser().getEmail()
        );
    }

    private AdminTransactionViewDto transactionToAdminViewDto(Transaction transaction) {
        return new AdminTransactionViewDto(
                transaction.getTransactionId(),
                transaction.getAmount(),
                transaction.getDate(),
                transaction.getCategory().getCategoryName(),
                transaction.getCategory().getTransactionType().getTransactionTypeName().name()
        );
    }

    private Map<String, List<TransactionResponseDto>> groupTransactionsByDate(List<TransactionResponseDto> transactionResponseDtoList) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        return transactionResponseDtoList.stream().collect(Collectors.groupingBy(t -> {

            if (t.getDate().equals(today)) {
                return "Today";
            }else if (t.getDate().equals(yesterday)) {
                return "Yesterday";
            }else {
                return t.getDate().toString();
            }
        }))
                .entrySet().stream()
                .sorted((entry1, entry2 ) -> {
                    if (entry1.getKey().equals("Today")) return -1;
                    else if (entry2.getKey().equals("Today")) return 1;
                    else if (entry1.getKey().equals("Yesterday")) return -1;
                    else if (entry2.getKey().equals("Yesterday")) return 1;
                    else return entry2.getKey().compareTo(entry1.getKey());
                })
                .collect(Collectors.toMap(
                        Map.Entry::getKey, 
                        entry -> {
                            return entry.getValue().stream()
                                    .sorted((t1, t2) -> {
                                        if (t1.getTimestamp() == null && t2.getTimestamp() == null) return 0;
                                        if (t1.getTimestamp() == null) return 1;
                                        if (t2.getTimestamp() == null) return -1;
                                        return t2.getTimestamp().compareTo(t1.getTimestamp());
                                    })
                                    .collect(Collectors.toList());
                        },
                        (oldValue, newValue) -> oldValue, 
                        LinkedHashMap::new));
    }
}
