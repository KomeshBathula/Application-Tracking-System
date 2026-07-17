package com.ats.backend.service.impl;

import com.ats.backend.dto.ApplicationNoteDto;
import com.ats.backend.dto.CreateNoteRequest;
import com.ats.backend.dto.UpdateNoteRequest;
import com.ats.backend.entity.Application;
import com.ats.backend.entity.ApplicationNote;
import com.ats.backend.entity.RoleName;
import com.ats.backend.entity.User;
import com.ats.backend.exception.InvalidRequestException;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.mapper.ApplicationNoteMapper;
import com.ats.backend.repository.ApplicationNoteRepository;
import com.ats.backend.repository.ApplicationRepository;
import com.ats.backend.repository.UserRepository;
import com.ats.backend.service.ApplicationNoteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationNoteServiceImpl implements ApplicationNoteService {

    private final ApplicationNoteRepository noteRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ApplicationNoteMapper noteMapper;

    public ApplicationNoteServiceImpl(
            ApplicationNoteRepository noteRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            ApplicationNoteMapper noteMapper
    ) {
        this.noteRepository = noteRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.noteMapper = noteMapper;
    }

    @Override
    @Transactional
    public ApplicationNoteDto createNote(CreateNoteRequest request, String currentUserEmail) {
        User author = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found: " + currentUserEmail));

        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + request.getApplicationId()));

        boolean isAdmin = author.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        boolean isRecruiter = author.getRole().getRoleName() == RoleName.ROLE_RECRUITER;

        if (!isAdmin && !isRecruiter) {
            throw new InvalidRequestException("Only recruiters and admins can create notes.");
        }

        // Security check: Recruiter must own the job or be ADMIN
        if (!isAdmin && !application.getJob().getRecruiter().getId().equals(author.getId())) {
            throw new InvalidRequestException("You are not authorized to add notes to this application.");
        }

        ApplicationNote note = ApplicationNote.builder()
                .application(application)
                .author(author)
                .content(request.getContent())
                .build();

        ApplicationNote savedNote = noteRepository.save(note);
        return noteMapper.toDto(savedNote);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationNoteDto> getNotesByApplicationId(Long applicationId, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;
        boolean isRecruiter = user.getRole().getRoleName() == RoleName.ROLE_RECRUITER;

        if (!isAdmin && !isRecruiter) {
            throw new InvalidRequestException("Only recruiters and admins can view notes.");
        }

        // Security check: Recruiter must own the job or be ADMIN
        if (!isAdmin && !application.getJob().getRecruiter().getId().equals(user.getId())) {
            throw new InvalidRequestException("You are not authorized to view notes for this application.");
        }

        List<ApplicationNote> notes = noteRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId);
        return notes.stream()
                .map(noteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApplicationNoteDto updateNote(Long noteId, UpdateNoteRequest request, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        ApplicationNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;

        // Only the note author or an ADMIN can update the note
        if (!isAdmin && !note.getAuthor().getId().equals(user.getId())) {
            throw new InvalidRequestException("You are not authorized to update this note.");
        }

        note.setContent(request.getContent());
        ApplicationNote savedNote = noteRepository.save(note);
        return noteMapper.toDto(savedNote);
    }

    @Override
    @Transactional
    public void deleteNote(Long noteId, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        ApplicationNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        boolean isAdmin = user.getRole().getRoleName() == RoleName.ROLE_ADMIN;

        // Only the note author or an ADMIN can delete the note
        if (!isAdmin && !note.getAuthor().getId().equals(user.getId())) {
            throw new InvalidRequestException("You are not authorized to delete this note.");
        }

        noteRepository.delete(note);
    }
}
