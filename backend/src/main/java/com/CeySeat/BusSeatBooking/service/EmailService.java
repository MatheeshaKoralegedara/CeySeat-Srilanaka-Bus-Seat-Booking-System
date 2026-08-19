package com.CeySeat.BusSeatBooking.service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, @Value("${mail.from}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @PostConstruct
    private void logConfigStatus() {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("mail.from is empty - MAIL_USERNAME/MAIL_FROM are not set in this process's environment. OTP emails will fail to send until they are.");
        } else {
            log.info("Email OTP sending configured with from-address: {}", fromAddress);
        }
    }

    public void sendOtpEmail(String to, String code, int expiryMinutes) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromAddress, "CeySeat");
            helper.setTo(to);
            helper.setSubject("Your CeySeat verification code");
            helper.setText(plainTextBody(code, expiryMinutes), htmlBody(code, expiryMinutes));
            mailSender.send(mimeMessage);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new IllegalStateException("Could not build verification email", e);
        }
    }

    private String plainTextBody(String code, int expiryMinutes) {
        return "Your CeySeat verification code is " + code + ".\n\n"
                + "This code expires in " + expiryMinutes + " minutes.\n\n"
                + "If you didn't request this, you can safely ignore this email.\n\n"
                + "- The CeySeat Team";
    }

    private String htmlBody(String code, int expiryMinutes) {
        return "<!DOCTYPE html>"
                + "<html><body style=\"margin:0;padding:0;background-color:#f4f5f7;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;\">"
                + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#f4f5f7;padding:32px 16px;\">"
                + "<tr><td align=\"center\">"
                + "<table role=\"presentation\" width=\"480\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);\">"
                + "<tr><td style=\"background-color:#0f3d3e;padding:24px 32px;\">"
                + "<span style=\"color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;\">CeySeat</span>"
                + "</td></tr>"
                + "<tr><td style=\"padding:32px;\">"
                + "<h1 style=\"margin:0 0 12px;font-size:20px;color:#111827;\">Verify your email address</h1>"
                + "<p style=\"margin:0 0 24px;font-size:14px;line-height:1.6;color:#4b5563;\">"
                + "Use the code below to confirm your email and finish setting up your CeySeat account. "
                + "You'll need this before you can book a seat."
                + "</p>"
                + "<div style=\"text-align:center;margin:0 0 24px;\">"
                + "<span style=\"display:inline-block;padding:14px 28px;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;"
                + "font-size:28px;font-weight:700;letter-spacing:8px;color:#0f3d3e;\">" + code + "</span>"
                + "</div>"
                + "<p style=\"margin:0 0 4px;font-size:13px;color:#6b7280;\">This code expires in " + expiryMinutes + " minutes.</p>"
                + "<p style=\"margin:0;font-size:13px;color:#6b7280;\">If you didn't request this, you can safely ignore this email.</p>"
                + "</td></tr>"
                + "<tr><td style=\"padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f0f0f0;\">"
                + "<p style=\"margin:0;font-size:12px;color:#9ca3af;\">&copy; CeySeat &middot; Sri Lanka Bus Seat Booking</p>"
                + "</td></tr>"
                + "</table>"
                + "</td></tr>"
                + "</table>"
                + "</body></html>";
    }
}
