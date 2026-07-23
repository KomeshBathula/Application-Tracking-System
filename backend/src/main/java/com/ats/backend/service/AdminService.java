package com.ats.backend.service;

import com.ats.backend.dto.CreateCompanyAdminRequest;
import com.ats.backend.dto.UserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    UserDto createCompanyAdmin(CreateCompanyAdminRequest request);
    Page<UserDto> getUsersPaginated(String search, String role, Long companyId, Pageable pageable);
    UserDto toggleUserStatus(String currentAdminUsername, Long userId, boolean enabled);
}
