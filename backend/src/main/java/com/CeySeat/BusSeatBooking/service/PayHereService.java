package com.CeySeat.BusSeatBooking.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class PayHereService {

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Value("${payhere.notify-url}")
    private String notifyUrl;

    public String getMerchantId() {
        return merchantId;
    }

    public String getNotifyUrl() {
        return notifyUrl;
    }

    public String generateHash(String orderId, double amount) {
        String formattedAmount = String.format("%.2f", amount);
        String secretHash = md5(merchantSecret).toUpperCase();

        String rawString = merchantId + orderId + formattedAmount + "LKR" + secretHash;
        return md5(rawString).toUpperCase();
    }

    public boolean verifyNotifySignature(String merchantId, String orderId, String amount,
                                          String currency, String statusCode, String receivedMd5Sig) {
        String secretHash = md5(merchantSecret).toUpperCase();
        String localSigRaw = merchantId + orderId + amount + currency + statusCode + secretHash;
        String localSig = md5(localSigRaw).toUpperCase();
        return localSig.equals(receivedMd5Sig);
    }

    private String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm unavailable", e);
        }
    }
}
