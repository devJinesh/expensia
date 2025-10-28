package com.fullStack.expenseTracker.controllers;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.requests.SavedTransactionRequestDto;
import com.fullStack.expenseTracker.exceptions.TransactionNotFoundException;
import com.fullStack.expenseTracker.exceptions.UserNotFoundException;
import com.fullStack.expenseTracker.exceptions.UserServiceLogicException;
import com.fullStack.expenseTracker.services.SavedTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/expensia/saved")
public class SavedTransactionController {

    @Autowired
    private SavedTransactionService savedTransactionService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> createSavedTransaction(@RequestBody SavedTransactionRequestDto requestDto)
            throws UserServiceLogicException, UserNotFoundException{
        return savedTransactionService.createSavedTransaction(requestDto);
    }

    @GetMapping("/add")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> addSavedTransaction(@RequestParam("id") long id)
            throws UserServiceLogicException, TransactionNotFoundException {
        return savedTransactionService.addSavedTransaction(id);
    }

    @PutMapping("/")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> editSavedTransaction(@RequestParam("id") long id, @RequestBody SavedTransactionRequestDto requestDto)
            throws UserServiceLogicException, TransactionNotFoundException {
        return savedTransactionService.editSavedTransaction(id, requestDto);
    }

    @DeleteMapping("/")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> deleteSavedTransaction(@RequestParam("id") long id)
            throws UserServiceLogicException, TransactionNotFoundException {
        return savedTransactionService.deleteSavedTransaction(id);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> getAllTransactionsByUser(@RequestParam("id") long id)
            throws UserServiceLogicException, UserNotFoundException {
        return savedTransactionService.getAllTransactionsByUser(id);
    }

    @GetMapping("/month")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> getAllTransactionsByUserAndMonth(@RequestParam("id") long id)
            throws UserServiceLogicException, UserNotFoundException {
        return savedTransactionService.getAllTransactionsByUserAndMonth(id);
    }

    @GetMapping("/")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> getAllTransactionsById(@RequestParam("id") long id)
            throws UserServiceLogicException, TransactionNotFoundException {
        return savedTransactionService.getSavedTransactionById(id);
    }

    @GetMapping("/skip")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<ApiResponseDto<?>> skipSavedTransaction(@RequestParam("id") long id)
            throws TransactionNotFoundException, UserServiceLogicException {
        return savedTransactionService.skipSavedTransaction(id);
    }
}
