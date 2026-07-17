package com.ats.backend.event;

import com.ats.backend.entity.Application;
import com.ats.backend.entity.ApplicationStatus;
import com.ats.backend.entity.User;
import lombok.Getter;

@Getter
public class ApplicationPipelineEvent {

    private final Application application;
    private final ApplicationStatus previousStatus;
    private final ApplicationStatus newStatus;
    private final User actor;
    private final String note;
    private final ActionType actionType;

    public ApplicationPipelineEvent(Application application, ApplicationStatus previousStatus, ApplicationStatus newStatus, User actor, String note, ActionType actionType) {
        this.application = application;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.actor = actor;
        this.note = note;
        this.actionType = actionType;
    }

    public enum ActionType {
        SUBMITTED,
        STATUS_UPDATED,
        WITHDRAWN
    }
}
