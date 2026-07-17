package com.ats.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateNoteRequest {
    @NotBlank(message = "Note content cannot be empty")
    private String content;
}
