package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.AuthResponse;
import com.ats.backend.dto.LoginRequest;
import com.ats.backend.dto.RegisterRequest;
import com.ats.backend.dto.UserDto;
import com.ats.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration and authentication")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Allows Admin, Recruiter, or Candidate users to register.")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        UserDto registeredUser = authService.registerUser(registerRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", registeredUser));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates credentials and returns a JWT token.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity
                .ok(ApiResponse.success("Login successful", authResponse));
    }

    @org.springframework.web.bind.annotation.GetMapping("/check-username")
    @Operation(summary = "Check candidate username availability", description = "Checks if a candidate username is available.")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> checkUsername(@org.springframework.web.bind.annotation.RequestParam String username) {
        boolean available = authService.isUsernameAvailable(username);
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("available", available);
        data.put("username", username);
        String message = available ? "Username is available" : "Username is not available";
        return ResponseEntity.ok(ApiResponse.success(message, data));
    }
}
