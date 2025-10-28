package com.fullStack.expenseTracker.security;

import com.fullStack.expenseTracker.factories.RoleFactory;
import com.fullStack.expenseTracker.models.Role;
import com.fullStack.expenseTracker.models.User;
import com.fullStack.expenseTracker.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleFactory roleFactory;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(oauth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user: {}", ex.getMessage());
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;
        if (!userOptional.isPresent()) {
            user = createNewUser(email, name);
        } else {
            user = userOptional.get();
            updateExistingUser(user, name);
        }

        return oauth2User;
    }

    private User createNewUser(String email, String name) {
        try {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(name != null ? name : email.split("@")[0]);
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setEnabled(true);
            newUser.setVerificationCode(null);
            newUser.setVerificationCodeExpiryTime(null);

            Set<Role> roles = new HashSet<>();
            Role userRole = roleFactory.getInstance("ROLE_USER");
            roles.add(userRole);
            newUser.setRoles(roles);

            userRepository.save(newUser);
            log.info("New OAuth2 user created: {}", email);

            return newUser;
        } catch (Exception e) {
            log.error("Error creating OAuth2 user: {}", e.getMessage());
            throw new OAuth2AuthenticationException("Failed to create user account");
        }
    }

    private void updateExistingUser(User user, String name) {
        boolean needsUpdate = false;

        if (name != null && !name.equals(user.getUsername())) {
            user.setUsername(name);
            needsUpdate = true;
        }

        if (needsUpdate) {
            userRepository.save(user);
            log.info("OAuth2 user updated: {}", user.getEmail());
        }
    }
}
