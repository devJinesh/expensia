package com.fullStack.expenseTracker.repository;

import com.fullStack.expenseTracker.models.Account;
import com.fullStack.expenseTracker.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);
    Optional<Account> findByIdAndUser(Long id, User user);
    List<Account> findByUserId(Long userId);
}
