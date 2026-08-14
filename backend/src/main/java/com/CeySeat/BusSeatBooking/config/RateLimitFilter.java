package com.CeySeat.BusSeatBooking.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean limited = path.equals("/api/bookings/reserve") || path.contains("/pay")
                || path.equals("/api/payments/hash");

        if (limited) {
            String key = request.getRemoteAddr() + ":" + path;
            Bucket bucket = buckets.computeIfAbsent(key, k -> Bucket.builder()
                    .addLimit(Bandwidth.simple(10, Duration.ofMinutes(1))) // 10 requests/min per IP per endpoint
                    .build());

            if (!bucket.tryConsume(1)) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Too many requests. Please slow down.\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }
}