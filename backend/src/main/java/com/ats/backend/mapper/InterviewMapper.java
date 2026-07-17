package com.ats.backend.mapper;

import com.ats.backend.dto.InterviewDto;
import com.ats.backend.entity.Interview;
import org.springframework.stereotype.Component;

@Component
public class InterviewMapper {

    public InterviewDto toDto(Interview interview) {
        if (interview == null) {
            return null;
        }

        return InterviewDto.builder()
                .id(interview.getId())
                .applicationId(interview.getApplication().getId())
                .jobId(interview.getApplication().getJob().getId())
                .jobTitle(interview.getApplication().getJob().getTitle())
                .company(interview.getApplication().getJob().getCompany())
                .recruiterId(interview.getRecruiter().getId())
                .recruiterFullName(interview.getRecruiter().getFullName())
                .recruiterEmail(interview.getRecruiter().getEmail())
                .interviewerId(interview.getInterviewer().getId())
                .interviewerFullName(interview.getInterviewer().getFullName())
                .interviewerEmail(interview.getInterviewer().getEmail())
                .candidateId(interview.getCandidate().getId())
                .candidateFullName(interview.getCandidate().getFullName())
                .candidateEmail(interview.getCandidate().getEmail())
                .scheduledDateTime(interview.getScheduledDateTime())
                .duration(interview.getDuration())
                .interviewMode(interview.getInterviewMode())
                .meetingLink(interview.getMeetingLink())
                .location(interview.getLocation())
                .interviewRound(interview.getInterviewRound())
                .status(interview.getStatus())
                .notes(interview.getNotes())
                .createdAt(interview.getCreatedAt())
                .updatedAt(interview.getUpdatedAt())
                .build();
    }
}
