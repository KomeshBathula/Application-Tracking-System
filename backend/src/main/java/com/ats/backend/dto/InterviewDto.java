package com.ats.backend.dto;

import com.ats.backend.entity.InterviewMode;
import com.ats.backend.entity.InterviewRound;
import com.ats.backend.entity.InterviewStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewDto {
    private Long id;
    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private String company;
    private Long recruiterId;
    private String recruiterFullName;
    private String recruiterEmail;
    private Long interviewerId;
    private String interviewerFullName;
    private String interviewerEmail;
    private Long candidateId;
    private String candidateFullName;
    private String candidateEmail;
    private LocalDateTime scheduledDateTime;
    private Integer duration;
    private InterviewMode interviewMode;
    private String meetingLink;
    private String location;
    private InterviewRound interviewRound;
    private InterviewStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
