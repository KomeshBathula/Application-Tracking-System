package com.ats.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateNoteRequest {
    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotBlank(message = "Note content cannot be empty")
    private String content;
}
