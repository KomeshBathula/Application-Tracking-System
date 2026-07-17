package com.ats.backend.service;

import com.ats.backend.dto.InterviewDto;
import com.ats.backend.dto.ScheduleInterviewRequest;
import com.ats.backend.dto.UpdateInterviewRequest;

import java.util.List;

public interface InterviewService {

    InterviewDto scheduleInterview(ScheduleInterviewRequest request, String recruiterEmail);

    InterviewDto updateInterview(Long interviewId, UpdateInterviewRequest request, String recruiterEmail);

    InterviewDto cancelInterview(Long interviewId, String note, String recruiterEmail);

    InterviewDto getInterviewById(Long interviewId, String userEmail);

    List<InterviewDto> getInterviewsByApplication(Long applicationId, String userEmail);

    List<InterviewDto> getCandidateInterviews(String candidateEmail);

    List<InterviewDto> getRecruiterInterviews(String recruiterEmail);
}
