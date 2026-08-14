package com.CeySeat.BusSeatBooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class PaymentHashResponse {
    private String merchantId;
    private String orderId;
    private String amount;
    private String currency;
    private String hash;
    private String notifyUrl;
    private List<String> seatNumbers;
    private LocalDateTime reservedUntil;
}
