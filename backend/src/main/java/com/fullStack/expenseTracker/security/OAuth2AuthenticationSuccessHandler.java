package com.fullStack.expenseTracker.security;

import com.fullStack.expenseTracker.models.User;
import com.fullStack.expenseTracker.repository.UserRepository;
import com.fullStack.expenseTracker.security.jwt.JwtUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.oauth2.frontend.redirect-url}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect.");
            return;
        }

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (!userOptional.isPresent()) {
            log.error("User not found after OAuth2 authentication: {}", email);
            response.sendRedirect(frontendRedirectUrl + "?error=user_not_found");
            return;
        }
        
        User user = userOptional.get();

        // Generate JWT token
        String jwt = jwtUtils.generateJwtToken(authentication);

        // Build redirect URL with JWT as query parameter
        String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("token", jwt)
                .queryParam("email", email)
                .build().toUriString();

        log.info("OAuth2 authentication successful for user: {}", email);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
