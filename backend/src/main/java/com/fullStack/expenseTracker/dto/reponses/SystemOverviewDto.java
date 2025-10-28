package com.fullStack.expenseTracker.dto.reponses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SystemOverviewDto {
    private long totalUsers;
    private long totalAdmins;
    private long totalRegularUsers;
    private long totalCategories;
    private long totalTransactions;
    private double storageUsedMB;
    private List<String> recentLogs;
}
