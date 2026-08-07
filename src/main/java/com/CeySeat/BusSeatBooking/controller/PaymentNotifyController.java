package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.model.Booking;
import com.CeySeat.BusSeatBooking.model.BookingStatus;
import com.CeySeat.BusSeatBooking.repository.BookingRepository;
import com.CeySeat.BusSeatBooking.service.PayHereService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentNotifyController {

    private final PayHereService payHereService;
    private final BookingRepository bookingRepository;

    // PayHere calls this directly from their servers — no user is logged in here.
    @PostMapping("/notify")
    public ResponseEntity<String> notify(
            @RequestParam("merchant_id") String merchantId,
            @RequestParam("order_id") String orderId, // this is your bookingId
            @RequestParam("payhere_amount") String amount,
            @RequestParam("payhere_currency") String currency,
            @RequestParam("status_code") String statusCode,
            @RequestParam("md5sig") String md5sig,
            @RequestParam(value = "payment_id", required = false) String paymentId
    ) {
        boolean valid = payHereService.verifyNotifySignature(
                merchantId, orderId, amount, currency, statusCode, md5sig);

        if (!valid) {
            log.warn("PayHere notify signature mismatch for order {}", orderId);
            return ResponseEntity.status(400).body("Invalid signature");
        }

        // status_code "2" = success, per PayHere's documented status codes
        if ("2".equals(statusCode)) {
            bookingRepository.findById(orderId).ifPresentOrElse(booking -> {
                if (booking.getStatus() == BookingStatus.RESERVED) {
                    booking.setStatus(BookingStatus.PAID);
                    booking.setPaymentReference(paymentId);
                    bookingRepository.save(booking);
                    log.info("Booking {} marked PAID via PayHere notify", orderId);
                }
                // if already PAID or EXPIRED, do nothing — notify can arrive more than once
            }, () -> log.warn("PayHere notify for unknown booking {}", orderId));
        } else {
            log.info("PayHere notify for order {} with non-success status {}", orderId, statusCode);
            // status_code -1 = cancelled, -2 = failed, -3 = chargedback — leave booking as-is,
            // your ReservationExpiryJob will release the hold naturally if it times out.
        }

        return ResponseEntity.ok("OK"); // PayHere expects a 200 response
    }
}