package com.example.cart_service.service.redis;

import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String REDIS_KEY = "SEQUENCE";

    public RedisService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String genCode(String code) {
        Long newValue = redisTemplate.execute((RedisCallback<Long>) connection -> {
            byte[] redisKey = REDIS_KEY.getBytes(StandardCharsets.UTF_8);
            byte[] redisField = code.getBytes(StandardCharsets.UTF_8);

            var hashCommands = connection.hashCommands();

            Boolean exists = hashCommands.hExists(redisKey, redisField);

            if (Boolean.FALSE.equals(exists)) {
                hashCommands.hSet(redisKey, redisField, "1".getBytes(StandardCharsets.UTF_8));
                return 1L;
            } else {
                return hashCommands.hIncrBy(redisKey, redisField, 1);
            }
        });

        return code + newValue;
    }
}