package com.fullStack.expenseTracker.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long transactionId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoryId")
    private Category category;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "accountId")
    private Account account;
    
    private String description;
    private double amount;
    private LocalDate date;
    
    @Column(name = "timestamp", nullable = true)
    private LocalDateTime timestamp;

    public Transaction(User user, Category category, String description, double amount, LocalDate date) {
        this.user = user;
        this.category = category;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.timestamp = LocalDateTime.now();
    }
    
    public Transaction(User user, Category category, Account account, String description, double amount, LocalDate date) {
        this.user = user;
        this.category = category;
        this.account = account;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.timestamp = LocalDateTime.now();
    }
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // Expose transactionType through category for frontend compatibility
    @JsonProperty("transactionType")
    public TransactionType getTransactionType() {
        return category != null ? category.getTransactionType() : null;
    }

}
