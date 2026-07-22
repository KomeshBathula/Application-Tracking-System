package com.ats.backend.service.impl;

import com.ats.backend.dto.AuthResponse;
import com.ats.backend.dto.LoginRequest;
import com.ats.backend.dto.RegisterRequest;
import com.ats.backend.dto.UserDto;
import com.ats.backend.entity.Company;
import com.ats.backend.entity.Role;
import com.ats.backend.entity.RoleName;
import com.ats.backend.entity.User;
import com.ats.backend.exception.EmailAlreadyExistsException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.UserMapper;
import com.ats.backend.repository.CompanyRepository;
import com.ats.backend.repository.RoleRepository;
import com.ats.backend.repository.UserRepository;
import com.ats.backend.security.JwtTokenProvider;
import com.ats.backend.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            CompanyRepository companyRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public UserDto registerUser(RegisterRequest registerRequest) {
        // Enforce candidate-only registration constraint
        if (registerRequest.getRole() == null || !"CANDIDATE".equalsIgnoreCase(registerRequest.getRole())) {
            throw new com.ats.backend.exception.InvalidRequestException("Registration is strictly allowed for candidates only.");
        }

        // Validate username
        if (registerRequest.getUsername() == null || registerRequest.getUsername().trim().isEmpty()) {
            throw new com.ats.backend.exception.InvalidRequestException("Username is required.");
        }
        String cleanUsername = registerRequest.getUsername().trim().toLowerCase();
        if (userRepository.existsByUsername(cleanUsername)) {
            throw new com.ats.backend.exception.ConflictException("Username is not available: @" + cleanUsername);
        }

        // Validate email
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email address is already in use: " + registerRequest.getEmail());
        }

        // Validate Password Complexity (>= 8 chars, 1 uppercase, 1 digit, 1 special char)
        String pwd = registerRequest.getPassword();
        if (pwd == null || pwd.length() < 8 
                || !pwd.matches(".*[A-Z].*") 
                || !pwd.matches(".*[0-9].*") 
                || !pwd.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new com.ats.backend.exception.InvalidRequestException("Password must be at least 8 characters long and contain at least one capital letter, one number, and one special character.");
        }

        Role role = roleRepository.findByRoleName(RoleName.ROLE_CANDIDATE)
                .orElseThrow(() -> new ResourceNotFoundException("Role ROLE_CANDIDATE was not initialized in the database."));

        User user = User.builder()
                .fullName(registerRequest.getFullName())
                .username(cleanUsername)
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(role)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmailOrUsername(loginRequest.getEmail(), loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + loginRequest.getEmail()));

        return AuthResponse.builder()
                .token(jwt)
                .user(userMapper.toDto(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUsernameAvailable(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        return !userRepository.existsByUsername(username.trim().toLowerCase());
    }
}
