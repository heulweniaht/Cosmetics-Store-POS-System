package com.example.identify_service.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@RedisHash("refresh_tokens")
public class RefreshToken {
    @Id
    String id; // JWT ID của refresh token

    String userId; // User ID
    String tokenHash; // Hash của refresh token để bảo mật
    LocalDateTime issuedAt;
    LocalDateTime expiresAt;
    boolean revoked;

    @TimeToLive
    long ttl = 604800; // 7 days in seconds
}
