package com.fullStack.expenseTracker.dto.reponses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDto {
    private double consolidatedBalance;
    private List<AccountSummaryDto> accountSummaries;
}
