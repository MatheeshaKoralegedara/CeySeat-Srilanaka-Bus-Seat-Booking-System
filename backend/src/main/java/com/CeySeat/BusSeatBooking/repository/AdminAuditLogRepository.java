package com.CeySeat.BusSeatBooking.repository;

import com.CeySeat.BusSeatBooking.model.AdminAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AdminAuditLogRepository extends MongoRepository<AdminAuditLog, String> {
    Page<AdminAuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
