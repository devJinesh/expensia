package com.fullStack.expenseTracker.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fullStack.expenseTracker.enums.AccountType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String accountName;

    @Enumerated(EnumType.STRING)
    private AccountType accountType;

    private double balance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    @JsonIgnore
    private User user;

    public Account(String accountName, AccountType accountType, double balance, User user) {
        this.accountName = accountName;
        this.accountType = accountType;
        this.balance = balance;
        this.user = user;
    }
}
