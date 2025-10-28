package com.fullStack.expenseTracker.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fullStack.expenseTracker.enums.ETransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Integer transactionTypeId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @JsonProperty("name")
    private ETransactionType transactionTypeName;


    public TransactionType(ETransactionType transactionTypeName) {
        this.transactionTypeName = transactionTypeName;
    }
}
