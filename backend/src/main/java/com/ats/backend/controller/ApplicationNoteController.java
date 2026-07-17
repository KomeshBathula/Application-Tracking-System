package com.ats.backend.controller;

import com.ats.backend.dto.ApiResponse;
import com.ats.backend.dto.ApplicationNoteDto;
import com.ats.backend.dto.CreateNoteRequest;
import com.ats.backend.dto.UpdateNoteRequest;
import com.ats.backend.service.ApplicationNoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@Tag(name = "Application Note Controller", description = "Endpoints for managing recruiter internal notes and hiring feedback")
@SecurityRequirement(name = "bearerAuth")
public class ApplicationNoteController {

    private final ApplicationNoteService noteService;

    public ApplicationNoteController(ApplicationNoteService noteService) {
        this.noteService = noteService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Create a new internal note", description = "Restricted to RECRUITER or ADMIN role.")
    public ResponseEntity<ApiResponse<ApplicationNoteDto>> createNote(
            @Valid @RequestBody CreateNoteRequest request,
            Principal principal
    ) {
        ApplicationNoteDto noteDto = noteService.createNote(request, principal.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Internal note created successfully", noteDto));
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Get all notes for a specific application", description = "Restricted to RECRUITER or ADMIN.")
    public ResponseEntity<ApiResponse<List<ApplicationNoteDto>>> getNotesByApplication(
            @PathVariable Long applicationId,
            Principal principal
    ) {
        List<ApplicationNoteDto> notes = noteService.getNotesByApplicationId(applicationId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application notes retrieved successfully", notes));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Update an existing internal note", description = "Only the author of the note or an ADMIN can update.")
    public ResponseEntity<ApiResponse<ApplicationNoteDto>> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody UpdateNoteRequest request,
            Principal principal
    ) {
        ApplicationNoteDto noteDto = noteService.updateNote(id, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Internal note updated successfully", noteDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_RECRUITER', 'ROLE_ADMIN')")
    @Operation(summary = "Delete an internal note", description = "Only the author of the note or an ADMIN can delete.")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable Long id,
            Principal principal
    ) {
        noteService.deleteNote(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Internal note deleted successfully", null));
    }
}
