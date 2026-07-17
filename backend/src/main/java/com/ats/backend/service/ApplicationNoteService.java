package com.ats.backend.service;

import com.ats.backend.dto.ApplicationNoteDto;
import com.ats.backend.dto.CreateNoteRequest;
import com.ats.backend.dto.UpdateNoteRequest;

import java.util.List;

public interface ApplicationNoteService {
    ApplicationNoteDto createNote(CreateNoteRequest request, String currentUserEmail);
    List<ApplicationNoteDto> getNotesByApplicationId(Long applicationId, String currentUserEmail);
    ApplicationNoteDto updateNote(Long noteId, UpdateNoteRequest request, String currentUserEmail);
    void deleteNote(Long noteId, String currentUserEmail);
}
