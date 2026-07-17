package com.ats.backend.mapper;

import com.ats.backend.dto.ApplicationNoteDto;
import com.ats.backend.entity.ApplicationNote;
import org.springframework.stereotype.Component;

@Component
public class ApplicationNoteMapper {

    public ApplicationNoteDto toDto(ApplicationNote note) {
        if (note == null) {
            return null;
        }
        return ApplicationNoteDto.builder()
                .id(note.getId())
                .applicationId(note.getApplication().getId())
                .authorId(note.getAuthor().getId())
                .authorName(note.getAuthor().getFullName())
                .authorEmail(note.getAuthor().getEmail())
                .content(note.getContent())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
