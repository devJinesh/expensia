package com.fullStack.expenseTracker.repository;

import com.fullStack.expenseTracker.models.CategoryBudget;
import com.fullStack.expenseTracker.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, Long> {
    List<CategoryBudget> findByUserAndMonthAndYear(User user, int month, int year);
    Optional<CategoryBudget> findByIdAndUser(Long id, User user);
    List<CategoryBudget> findByUser(User user);
    List<CategoryBudget> findByMonthAndYear(int month, int year);
}
