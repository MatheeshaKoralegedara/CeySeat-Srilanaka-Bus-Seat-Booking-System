package com.CeySeat.BusSeatBooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "admin_audit_logs")
public class AdminAuditLog {
    @Id
    private String id;

    @Indexed
    private String adminId;
    private String adminEmail;

    private String action;
    private String targetType;
    private String targetId;
    private String details;

    @Indexed
    private Instant timestamp;
}
