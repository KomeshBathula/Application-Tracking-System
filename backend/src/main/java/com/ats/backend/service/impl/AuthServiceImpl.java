package com.ats.backend.service.impl;

import com.ats.backend.dto.AuthResponse;
import com.ats.backend.dto.LoginRequest;
import com.ats.backend.dto.RegisterRequest;
import com.ats.backend.dto.UserDto;
import com.ats.backend.entity.Role;
import com.ats.backend.entity.RoleName;
import com.ats.backend.entity.User;
import com.ats.backend.exception.EmailAlreadyExistsException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.UserMapper;
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
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public UserDto registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email address is already in use: " + registerRequest.getEmail());
        }

        RoleName roleNameEnum;
        try {
            roleNameEnum = RoleName.valueOf("ROLE_" + registerRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid role specified. Allowed values are ADMIN, RECRUITER, CANDIDATE");
        }

        Role role = roleRepository.findByRoleName(roleNameEnum)
                .orElseThrow(() -> new ResourceNotFoundException("Role " + roleNameEnum + " was not initialized in the database."));

        User user = User.builder()
                .fullName(registerRequest.getFullName())
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

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + loginRequest.getEmail()));

        return AuthResponse.builder()
                .token(jwt)
                .user(userMapper.toDto(user))
                .build();
    }
}
