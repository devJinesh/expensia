package com.fullStack.expenseTracker.controllers;

import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.dto.reponses.SystemOverviewDto;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.repository.CategoryRepository;
import com.fullStack.expenseTracker.repository.TransactionRepository;
import com.fullStack.expenseTracker.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/expensia/admin")
@Slf4j
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Value("${app.user.profile.upload.dir}")
    private String uploadDir;

    @GetMapping("/system-overview")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponseDto<?>> getSystemOverview() {
        try {
            long totalUsers = userRepository.count();
            long totalAdmins = 0;
            long totalRegularUsers = 0;
            
            try {
                totalAdmins = userRepository.countByRolesRoleName("ROLE_ADMIN");
                totalRegularUsers = userRepository.countByRolesRoleName("ROLE_USER");
            } catch (Exception e) {
                log.warn("Error counting users by role: {}", e.getMessage());
            }

            long totalCategories = categoryRepository.count();
            long totalTransactions = transactionRepository.count();
            double storageUsedMB = calculateStorageUsage();
            List<String> recentLogs = getRecentLogs(50);

            SystemOverviewDto overview = new SystemOverviewDto(
                    totalUsers,
                    totalAdmins,
                    totalRegularUsers,
                    totalCategories,
                    totalTransactions,
                    storageUsedMB,
                    recentLogs
            );

            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                    ApiResponseStatus.SUCCESS,
                    HttpStatus.OK,
                    overview
            ));
        } catch (Exception e) {
            log.error("Error retrieving system overview: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponseDto<>(
                    ApiResponseStatus.FAILED,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to retrieve system overview: " + e.getMessage()
            ));
        }
    }

    private double calculateStorageUsage() {
        try {
            File uploadDirectory = new File(uploadDir);
            if (!uploadDirectory.exists()) {
                return 0.0;
            }
            return getFolderSize(uploadDirectory) / (1024.0 * 1024.0);
        } catch (Exception e) {
            log.error("Error calculating storage usage: {}", e.getMessage());
            return 0.0;
        }
    }

    private long getFolderSize(File folder) {
        long size = 0;
        if (folder.isFile()) {
            return folder.length();
        }
        File[] files = folder.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isFile()) {
                    size += file.length();
                } else {
                    size += getFolderSize(file);
                }
            }
        }
        return size;
    }

    private List<String> getRecentLogs(int lineCount) {
        try {
            String[] logPaths = {
                    "logs/application.log",
                    "logs/spring.log",
                    "./application.log"
            };

            for (String logPath : logPaths) {
                File logFile = new File(logPath);
                if (logFile.exists()) {
                    List<String> allLines = Files.readAllLines(Paths.get(logPath));
                    int startIndex = Math.max(0, allLines.size() - lineCount);
                    return allLines.subList(startIndex, allLines.size());
                }
            }

            List<String> noLogs = new ArrayList<>();
            noLogs.add("No log files found in standard locations");
            return noLogs;
        } catch (IOException e) {
            log.error("Error reading log files: {}", e.getMessage());
            List<String> errorLog = new ArrayList<>();
            errorLog.add("Error reading log files: " + e.getMessage());
            return errorLog;
        }
    }
}
