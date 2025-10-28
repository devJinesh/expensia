package com.fullStack.expenseTracker.services;

import com.fullStack.expenseTracker.models.CategoryBudget;
import com.fullStack.expenseTracker.models.User;
import com.fullStack.expenseTracker.repository.CategoryBudgetRepository;
import com.fullStack.expenseTracker.repository.TransactionRepository;
import com.fullStack.expenseTracker.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
public class BudgetAlertService {

    @Autowired
    private CategoryBudgetRepository categoryBudgetRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Scheduled(cron = "0 0 5 * * ?")
    public void checkBudgetAlerts() {
        log.info("Starting budget alert check...");

        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        List<CategoryBudget> budgets = categoryBudgetRepository.findByMonthAndYear(currentMonth, currentYear);

        for (CategoryBudget budget : budgets) {
            try {
                checkAndSendAlert(budget, currentMonth, currentYear);
            } catch (Exception e) {
                log.error("Error checking budget alert for budget ID {}: {}", budget.getId(), e.getMessage());
            }
        }

        log.info("Budget alert check completed.");
    }

    private void checkAndSendAlert(CategoryBudget budget, int month, int year) {
        if (budget.isAlertSent()) {
            return;
        }

        User user = budget.getUser();
        String email = user.getEmail();
        int categoryId = budget.getCategory().getCategoryId();

        Double spending = transactionRepository.findTotalByUserAndCategory(email, categoryId, month, year);
        double currentSpending = spending != null ? spending : 0.0;
        double threshold = budget.getAmount() * 0.9;

        if (currentSpending >= threshold) {
            try {
                String subject = "Budget Alert: " + budget.getCategory().getCategoryName();
                String message = String.format(
                        "Dear %s,\n\n" +
                        "Your spending in the category '%s' has reached %.2f%% of your budget.\n\n" +
                        "Budget: $%.2f\n" +
                        "Current Spending: $%.2f\n\n" +
                        "Please review your expenses.\n\n" +
                        "Best regards,\n" +
                        "Expensia Team",
                        user.getUsername(),
                        budget.getCategory().getCategoryName(),
                        (currentSpending / budget.getAmount()) * 100,
                        budget.getAmount(),
                        currentSpending
                );

                notificationService.sendEmail(email, subject, message);

                budget.setAlertSent(true);
                categoryBudgetRepository.save(budget);

                log.info("Budget alert sent to {} for category {}", email, budget.getCategory().getCategoryName());
            } catch (Exception e) {
                log.error("Failed to send budget alert: {}", e.getMessage());
            }
        }
    }
}
