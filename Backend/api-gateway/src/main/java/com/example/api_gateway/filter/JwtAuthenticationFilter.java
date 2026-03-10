package com.example.api_gateway.filter;

import com.example.api_gateway.configuration.JwtConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtConfig jwtConfig;

    public JwtAuthenticationFilter(JwtConfig jwtConfig) {
        super(Config.class);
        this.jwtConfig = jwtConfig;
    }
@Override
public GatewayFilter apply(Config config) {
    return (exchange, chain) -> {
        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        log.info("=== JWT AUTHENTICATION FILTER ===");
        log.info("Authorization header: {}", authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header");
            return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        log.info("Extracted token length: {}", token.length());
        log.info("Token preview: {}...", token.length() > 20 ? token.substring(0, 20) : token);
        
        // Kiểm tra token có 3 phần không
        String[] tokenParts = token.split("\\.");
        log.info("Token parts count: {}", tokenParts.length);
        
        if (tokenParts.length != 3) {
            log.error("❌ Invalid JWT format - Expected 3 parts, got {}", tokenParts.length);
            return onError(exchange, "Invalid JWT format", HttpStatus.UNAUTHORIZED);
        }
        
        try {
            if (!jwtConfig.isTokenValid(token)) {
                log.warn("Invalid JWT token");
                return onError(exchange, "Invalid JWT token", HttpStatus.UNAUTHORIZED);
            }

            String userId = jwtConfig.extractUserId(token);
            
            log.info("JWT authentication successful for userId: {}", userId);
            
            // Chỉ thêm X-User-Id header
            ServerWebExchange modifiedExchange = exchange.mutate()
                    .request(exchange.getRequest().mutate()
                            .header("X-User-Id", userId != null ? userId : "")
                            .build())
                    .build();

            log.info("✅ Added X-User-Id header: {}", userId);
            return chain.filter(modifiedExchange);
            
        } catch (Exception e) {
            log.error("JWT authentication failed: {}", e.getMessage());
            return onError(exchange, "JWT authentication failed", HttpStatus.UNAUTHORIZED);
        }
    };
}

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        // Configuration properties can be added here if needed
    }
}
