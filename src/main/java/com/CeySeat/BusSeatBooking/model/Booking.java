package com.CeySeat.BusSeatBooking.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    private String scheduleId;
    private String userId;
    private List<String> seats; // ["1A", "1B"]
    private String status; // reserved, paid, cancelled
    private double totalAmount;
    private LocalDateTime reservedUntil;
    private String paymentReference;
}
