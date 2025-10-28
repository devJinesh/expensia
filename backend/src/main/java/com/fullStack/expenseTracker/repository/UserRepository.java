package com.fullStack.expenseTracker.repository;


import java.util.List;
import java.util.Optional;

import com.fullStack.expenseTracker.dto.reponses.UserResponseDto;
import com.fullStack.expenseTracker.models.Role;
import com.fullStack.expenseTracker.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    User findByVerificationCode(String verificationCode);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    @Query(value = "SELECT * from users u " +
            "JOIN user_roles ur ON u.id = ur.user_id " +
            "WHERE ur.role_id = :roleId AND (:keyword IS NULL OR :keyword = '' OR u.username LIKE CONCAT('%', :keyword, '%') OR u.email LIKE CONCAT('%', :keyword, '%'))", nativeQuery = true)
    Page<User> findAll(Pageable pageable, @Param("roleId") int roleId, @Param("keyword") String keyword);

    @Query(value = "SELECT DISTINCT u.* FROM users u " +
            "WHERE :keyword IS NULL OR :keyword = '' OR u.username LIKE CONCAT('%', :keyword, '%') OR u.email LIKE CONCAT('%', :keyword, '%')", nativeQuery = true)
    Page<User> findAllUsers(Pageable pageable, @Param("keyword") String keyword);

    @Query(value = "SELECT COUNT(DISTINCT u.id) FROM users u " +
            "JOIN user_roles ur ON u.id = ur.user_id " +
            "JOIN roles r ON ur.role_id = r.id " +
            "WHERE r.name = :roleName", nativeQuery = true)
    long countByRolesRoleName(@Param("roleName") String roleName);

}
