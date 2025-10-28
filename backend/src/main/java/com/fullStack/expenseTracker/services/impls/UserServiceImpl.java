package com.fullStack.expenseTracker.services.impls;


import com.fullStack.expenseTracker.dto.reponses.PageResponseDto;
import com.fullStack.expenseTracker.dto.requests.UserSettingsRequestDto;
import com.fullStack.expenseTracker.services.NotificationService;
import com.fullStack.expenseTracker.services.UserService;
import com.fullStack.expenseTracker.dto.reponses.ApiResponseDto;
import com.fullStack.expenseTracker.enums.ApiResponseStatus;
import com.fullStack.expenseTracker.dto.reponses.UserResponseDto;
import com.fullStack.expenseTracker.exceptions.*;
import com.fullStack.expenseTracker.factories.RoleFactory;
import com.fullStack.expenseTracker.enums.ETransactionType;
import com.fullStack.expenseTracker.models.User;
import com.fullStack.expenseTracker.repository.TransactionRepository;
import com.fullStack.expenseTracker.repository.TransactionTypeRepository;
import com.fullStack.expenseTracker.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

@Component
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    RoleFactory roleFactory;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TransactionTypeRepository transactionTypeRepository;

    @Value("${app.user.profile.upload.dir}")
    private String userProfileUploadDir;

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.endpoint}")
    private String s3Endpoint;


    @Override
    public ResponseEntity<ApiResponseDto<?>> getAllUsers(int pageNumber, int pageSize, String searchKey)
            throws RoleNotFoundException, UserServiceLogicException {

        Pageable pageable =  PageRequest.of(pageNumber, pageSize);

        Page<User> users = userRepository.findAllUsers(pageable, searchKey);

        try {
            List<UserResponseDto> userResponseDtoList = new ArrayList<>();

            for (User u: users) {
                userResponseDtoList.add(userToUserResponseDto(u));
            }

            return ResponseEntity.status(HttpStatus.OK).body(
                    new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS,
                            HttpStatus.OK,
                            new PageResponseDto<>(userResponseDtoList, users.getTotalPages(), users.getTotalElements())
                    )
            );
        }catch (Exception e) {
            log.error("Failed to fetch All users: " + e.getMessage());
            throw new UserServiceLogicException("Failed to fetch All users: Try again later!");
        }
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> enableOrDisableUser(long userId)
            throws UserNotFoundException, UserServiceLogicException {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new UserNotFoundException("User not found with id " + userId)
        );

        try {

            user.setEnabled(!user.isEnabled());
            userRepository.save(user);

            return ResponseEntity.status(HttpStatus.OK).body(
                    new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS, HttpStatus.OK, "User has been updated successfully!"
                    )
            );
        }catch(Exception e) {
            log.error("Failed to enable/disable user: " + e.getMessage());
            throw new UserServiceLogicException("Failed to update user: Try again later!");
        }
    }

    // ============================================
    // OLD LOCAL FILE STORAGE METHODS (COMMENTED OUT)
    // ============================================
    
    /*
    @Override
    public ResponseEntity<ApiResponseDto<?>> uploadProfileImg(String email, MultipartFile file)
            throws UserServiceLogicException, UserNotFoundException {
        if (existsByEmail(email)) {
            try {
                User user = findByEmail(email);
                String extention = Objects.requireNonNull(file.getOriginalFilename()).substring(file.getOriginalFilename().lastIndexOf("."));
                String newFileName = user.getUsername().concat(extention);
                Path targetLocation = Paths.get(userProfileUploadDir).resolve(newFileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                user.setProfileImgUrl(String.valueOf(targetLocation));
                userRepository.save(user);
                return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponseDto<>(
                        ApiResponseStatus.SUCCESS,
                        HttpStatus.CREATED,
                        "Profile image successfully updated!"
                ));
            } catch (Exception e) {
                log.error("Failed to update profile img: {}", e.getMessage());
                throw new UserServiceLogicException("Failed to update profile image: Try again later!");
            }
        }

        throw new UserNotFoundException("User not found with email " + email);
    }
    */

    // ============================================
    // NEW CLOUD STORAGE METHODS (AWS S3 / DigitalOcean Spaces)
    // ============================================

    @Override
    public ResponseEntity<ApiResponseDto<?>> uploadProfileImg(String email, MultipartFile file)
            throws UserServiceLogicException, UserNotFoundException {
        if (existsByEmail(email)) {
            try {
                User user = findByEmail(email);
                String extension = Objects.requireNonNull(file.getOriginalFilename())
                        .substring(file.getOriginalFilename().lastIndexOf("."));
                String key = "profile-images/" + user.getUsername() + "-" + System.currentTimeMillis() + extension;

                // Upload to S3/Spaces
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .contentType(file.getContentType())
                        .acl(ObjectCannedACL.PUBLIC_READ)
                        .build();

                s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

                // Generate public URL
                String publicUrl = s3Endpoint + "/" + bucketName + "/" + key;

                // Delete old image if exists
                if (user.getProfileImgUrl() != null && !user.getProfileImgUrl().isEmpty()) {
                    try {
                        String oldKey = extractKeyFromUrl(user.getProfileImgUrl());
                        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                                .bucket(bucketName)
                                .key(oldKey)
                                .build();
                        s3Client.deleteObject(deleteObjectRequest);
                    } catch (Exception e) {
                        log.warn("Failed to delete old profile image: {}", e.getMessage());
                    }
                }

                user.setProfileImgUrl(publicUrl);
                userRepository.save(user);

                return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponseDto<>(
                        ApiResponseStatus.SUCCESS,
                        HttpStatus.CREATED,
                        "Profile image successfully updated!"
                ));
            } catch (Exception e) {
                log.error("Failed to update profile img: {}", e.getMessage());
                throw new UserServiceLogicException("Failed to update profile image: Try again later!");
            }
        }

        throw new UserNotFoundException("User not found with email " + email);
    }

    /*
    @Override
    public ResponseEntity<ApiResponseDto<?>> getProfileImg(String email) throws UserNotFoundException, IOException, UserServiceLogicException {
        if (existsByEmail(email)) {
            try{
                User user = findByEmail(email);

                if (user.getProfileImgUrl() != null) {
                    Path profileImgPath = Paths.get(user.getProfileImgUrl());

                    byte[] imageBytes = Files.readAllBytes(profileImgPath);
                    String base64Image = Base64.getEncoder().encodeToString(imageBytes);

                    return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS,
                            HttpStatus.OK,
                            base64Image
                    ));
                }else {
                    return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS,
                            HttpStatus.OK,
                            null
                    ));
                }

            } catch (Exception e) {
                log.error("Failed to get profile img: {}", e.getMessage());
                throw new UserServiceLogicException("Failed to get profile image: Try again later!");
            }
        }

        throw new UserNotFoundException("User not found with email " + email);
    }
    */

    @Override
    public ResponseEntity<ApiResponseDto<?>> getProfileImg(String email) throws UserNotFoundException, IOException, UserServiceLogicException {
        if (existsByEmail(email)) {
            try{
                User user = findByEmail(email);

                if (user.getProfileImgUrl() != null) {
                    // Return the public URL directly
                    return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS,
                            HttpStatus.OK,
                            user.getProfileImgUrl()
                    ));
                } else {
                    return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS,
                            HttpStatus.OK,
                            null
                    ));
                }

            } catch (Exception e) {
                log.error("Failed to get profile img: {}", e.getMessage());
                throw new UserServiceLogicException("Failed to get profile image: Try again later!");
            }
        }

        throw new UserNotFoundException("User not found with email " + email);
    }

    /*
    @Override
    public ResponseEntity<ApiResponseDto<?>> deleteProfileImg(String email) throws UserServiceLogicException, UserNotFoundException {
        if (existsByEmail(email)) {
            try{
                User user = findByEmail(email);

                File file = new File(user.getProfileImgUrl());
                if (file.exists()) {
                    if (file.delete()) {
                        user.setProfileImgUrl(null);
                        User savedUser = userRepository.save(user);
                        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                                ApiResponseStatus.SUCCESS,
                                HttpStatus.OK,
                                "Profile image removed successfully!"
                        ));
                    }else {
                        throw new UserServiceLogicException("Failed to remove profile image: Try again later!");
                    }
                }
            } catch (Exception e) {
                log.error("Failed to get profile img: {}", e.getMessage());
                throw new UserServiceLogicException("Failed to remove profile image: Try again later!");
            }
        }

        throw new UserNotFoundException("User not found with email " + email);
    }
    */

    @Override
    public ResponseEntity<ApiResponseDto<?>> deleteProfileImg(String email) throws UserServiceLogicException, UserNotFoundException {
        if (existsByEmail(email)) {
            try{
                User user = findByEmail(email);

                if (user.getProfileImgUrl() != null && !user.getProfileImgUrl().isEmpty()) {
                    try {
                        String key = extractKeyFromUrl(user.getProfileImgUrl());
                        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                                .bucket(bucketName)
                                .key(key)
                                .build();
                        s3Client.deleteObject(deleteObjectRequest);
                    } catch (Exception e) {
                        log.error("Failed to delete object from S3: {}", e.getMessage());
                        throw new UserServiceLogicException("Failed to remove profile image: Try again later!");
                    }

                    user.setProfileImgUrl(null);
                    userRepository.save(user);

                    return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                            ApiResponseStatus.SUCCESS,
                            HttpStatus.OK,
                            "Profile image removed successfully!"
                    ));
                }

                return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                        ApiResponseStatus.SUCCESS,
                        HttpStatus.OK,
                        "No profile image to delete"
                ));
            } catch (Exception e) {
                log.error("Failed to delete profile img: {}", e.getMessage());
                throw new UserServiceLogicException("Failed to remove profile image: Try again later!");
            }
        }

        throw new UserNotFoundException("User not found with email " + email);
    }

    /**
     * Helper method to extract the S3 key from a full URL
     * Example: https://nyc3.digitaloceanspaces.com/bucket-name/profile-images/user.jpg -> profile-images/user.jpg
     */
    private String extractKeyFromUrl(String url) {
        String[] parts = url.split("/" + bucketName + "/");
        return parts.length > 1 ? parts[1] : url;
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User findByEmail(String email) throws UserNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email " +  email));
    }

    private UserResponseDto userToUserResponseDto(User user) {
        Double expense = transactionRepository.findTotalByUserAndTransactionType(
                user.getId(),
                transactionTypeRepository.findByTransactionTypeName(ETransactionType.TYPE_EXPENSE).getTransactionTypeId(),
                LocalDate.now().getMonthValue(),
                LocalDate.now().getYear()
        );
        
        Double income = transactionRepository.findTotalByUserAndTransactionType(
                user.getId(),
                transactionTypeRepository.findByTransactionTypeName(ETransactionType.TYPE_INCOME).getTransactionTypeId(),
                LocalDate.now().getMonthValue(),
                LocalDate.now().getYear()
        );
        
        Integer noOfTransactions = transactionRepository.findTotalNoOfTransactionsByUser(
                user.getId(), 
                LocalDate.now().getMonthValue(),
                LocalDate.now().getYear()
        );
        
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.isEnabled(),
                expense != null ? expense : 0.0,
                income != null ? income : 0.0,
                noOfTransactions != null ? noOfTransactions : 0,
                user.getCurrency() != null ? user.getCurrency() : "USD"
        );
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> updateUserPreferences(UserSettingsRequestDto settingsRequestDto) 
            throws UserNotFoundException, UserServiceLogicException {
        try {
            User user = findByEmail(settingsRequestDto.getEmail());
            
            if (settingsRequestDto.getTimezone() != null) {
                user.setTimezone(settingsRequestDto.getTimezone());
            }
            
            if (settingsRequestDto.getCurrency() != null) {
                user.setCurrency(settingsRequestDto.getCurrency());
            }
            
            userRepository.save(user);
            
            Map<String, String> preferences = new HashMap<>();
            preferences.put("timezone", user.getTimezone());
            preferences.put("currency", user.getCurrency());
            
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                    ApiResponseStatus.SUCCESS,
                    HttpStatus.OK,
                    preferences
            ));
        } catch (UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating user preferences: {}", e.getMessage());
            throw new UserServiceLogicException("Failed to update user preferences");
        }
    }

    @Override
    public ResponseEntity<ApiResponseDto<?>> getUserPreferences(String email) throws UserNotFoundException {
        User user = findByEmail(email);
        
        Map<String, String> preferences = new HashMap<>();
        preferences.put("timezone", user.getTimezone() != null ? user.getTimezone() : "UTC");
        preferences.put("currency", user.getCurrency() != null ? user.getCurrency() : "USD");
        
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponseDto<>(
                ApiResponseStatus.SUCCESS,
                HttpStatus.OK,
                preferences
        ));
    }

}
