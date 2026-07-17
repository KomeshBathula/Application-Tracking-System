package com.ats.backend.dto;

import com.ats.backend.entity.InterviewMode;
import com.ats.backend.entity.InterviewRound;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleInterviewRequest {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotNull(message = "Interviewer ID is required")
    private Long interviewerId;

    @NotNull(message = "Scheduled date and time is required")
    @Future(message = "Interview must be scheduled in the future")
    private LocalDateTime scheduledDateTime;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer duration;

    @NotNull(message = "Interview mode is required")
    private InterviewMode interviewMode;

    private String meetingLink;

    private String location;

    @NotNull(message = "Interview round is required")
    private InterviewRound interviewRound;

    private String notes;
}
