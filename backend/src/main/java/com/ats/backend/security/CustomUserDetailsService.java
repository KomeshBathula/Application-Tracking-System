package com.ats.backend.security;

import com.ats.backend.entity.User;
import com.ats.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String emailOrUsername) throws UsernameNotFoundException {
        String identifier = emailOrUsername != null ? emailOrUsername.trim() : "";
        String cleanUsername = identifier.toLowerCase(java.util.Locale.ROOT);
        User user = userRepository.findByEmailOrUsername(identifier, cleanUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or username: " + emailOrUsername));
        return new CustomUserDetails(user);
    }
}
