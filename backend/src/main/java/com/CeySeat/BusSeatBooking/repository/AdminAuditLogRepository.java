package com.CeySeat.BusSeatBooking.repository;

import com.CeySeat.BusSeatBooking.model.AdminAuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AdminAuditLogRepository extends MongoRepository<AdminAuditLog, String> {
    List<AdminAuditLog> findAllByOrderByTimestampDesc();
}
