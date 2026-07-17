package com.ats.backend.repository;

import com.ats.backend.entity.ApplicationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationNoteRepository extends JpaRepository<ApplicationNote, Long> {

    @Query("SELECT n FROM ApplicationNote n JOIN FETCH n.author WHERE n.application.id = :applicationId ORDER BY n.createdAt DESC")
    List<ApplicationNote> findByApplicationIdOrderByCreatedAtDesc(@Param("applicationId") Long applicationId);
}
