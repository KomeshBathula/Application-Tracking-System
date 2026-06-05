package com.ats.backend.service;

import com.ats.backend.dto.AuthResponse;
import com.ats.backend.dto.LoginRequest;
import com.ats.backend.dto.RegisterRequest;
import com.ats.backend.dto.UserDto;

public interface AuthService {
    UserDto registerUser(RegisterRequest registerRequest);
    AuthResponse authenticateUser(LoginRequest loginRequest);
}
