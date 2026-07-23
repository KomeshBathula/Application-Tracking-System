package com.ats.backend.service.impl;

import com.ats.backend.dto.CreateCompanyAdminRequest;
import com.ats.backend.dto.UserDto;
import com.ats.backend.entity.Company;
import com.ats.backend.entity.Role;
import com.ats.backend.entity.RoleName;
import com.ats.backend.entity.User;
import com.ats.backend.exception.ConflictException;
import com.ats.backend.exception.EmailAlreadyExistsException;
import com.ats.backend.exception.InvalidRequestException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.UserMapper;
import com.ats.backend.repository.CompanyRepository;
import com.ats.backend.repository.RoleRepository;
import com.ats.backend.repository.UserRepository;
import com.ats.backend.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public AdminServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            CompanyRepository companyRepository,
            PasswordEncoder passwordEncoder,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public UserDto createCompanyAdmin(CreateCompanyAdminRequest request) {
        String cleanUsername = request.getUsername().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByUsername(cleanUsername)) {
            throw new ConflictException("Username is not available: @" + cleanUsername);
        }

        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new EmailAlreadyExistsException("Email is already in use: " + request.getEmail());
        }

        // Validate initial password complexity
        String pwd = request.getPassword();
        if (pwd == null || pwd.length() < 8 
                || !pwd.matches(".*[A-Z].*") 
                || !pwd.matches(".*[0-9].*") 
                || !pwd.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new InvalidRequestException("Initial password must be at least 8 characters long and contain at least one capital letter, one number, and one special character.");
        }

        Role companyAdminRole = roleRepository.findByRoleName(RoleName.ROLE_COMPANY_ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("Role ROLE_COMPANY_ADMIN not found."));

        Company company = companyRepository.findByName(request.getCompanyName().trim())
                .orElseGet(() -> {
                    try {
                        return companyRepository.save(Company.builder().name(request.getCompanyName().trim()).build());
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        return companyRepository.findByName(request.getCompanyName().trim())
                                .orElseThrow(() -> new ConflictException("Company creation conflict for: " + request.getCompanyName()));
                    }
                });

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .username(cleanUsername)
                .email(request.getEmail().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(companyAdminRole)
                .company(company)
                .enabled(true)
                .passwordChangeRequired(true) // Force first-time password change
                .build();

        try {
            User savedUser = userRepository.save(user);
            return userMapper.toDto(savedUser);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new ConflictException("Username or email already exists.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> getUsersPaginated(String search, String role, Long companyId, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        RoleName roleNameEnum = null;
        if (role != null && !role.trim().isEmpty() && !"ALL".equalsIgnoreCase(role.trim())) {
            try {
                String roleStr = role.trim().toUpperCase(Locale.ROOT);
                if (!roleStr.startsWith("ROLE_")) {
                    roleStr = "ROLE_" + roleStr;
                }
                roleNameEnum = RoleName.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                throw new InvalidRequestException("Invalid role filter: " + role);
            }
        }

        Page<User> usersPage = userRepository.findUsersWithFilters(cleanSearch, roleNameEnum, companyId, pageable);
        return usersPage.map(userMapper::toDto);
    }

    @Override
    @Transactional
    public UserDto toggleUserStatus(String currentAdminUsername, Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!enabled) {
            String identifier = currentAdminUsername != null ? currentAdminUsername.trim() : "";
            String cleanUsername = identifier.toLowerCase(Locale.ROOT);
            User currentAdmin = userRepository.findByEmailOrUsername(identifier, cleanUsername).orElse(null);
            
            if (currentAdmin != null && currentAdmin.getId().equals(user.getId())) {
                throw new InvalidRequestException("System Administrator cannot disable their own account.");
            }
        }

        user.setEnabled(enabled);
        User updated = userRepository.save(user);
        return userMapper.toDto(updated);
    }
}
