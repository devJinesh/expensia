package com.fullStack.expenseTracker.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Integer categoryId;

    @JsonProperty("name")
    private String categoryName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "transactionTypeId")
    private TransactionType transactionType;

    private boolean enabled;


    public Category(String categoryName, TransactionType transactionType, boolean enabled) {
        this.categoryName = categoryName;
        this.transactionType = transactionType;
        this.enabled = enabled;
    }
}
