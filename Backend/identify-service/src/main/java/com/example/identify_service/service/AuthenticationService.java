package com.example.identify_service.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.example.identify_service.dto.request.AuthenticationRequest;
import com.example.identify_service.dto.request.IntrospectRequest;
import com.example.identify_service.dto.request.LogoutRequest;
import com.example.identify_service.dto.request.RefreshRequest;
import com.example.identify_service.dto.response.AuthenticationResponse;
import com.example.identify_service.dto.response.IntrospectResponse;
import com.example.identify_service.entity.InvalidatedToken;
import com.example.identify_service.entity.User;
import com.example.identify_service.exception.AppException;
import com.example.identify_service.exception.ErrorCode;
import com.example.identify_service.repository.InvalidatedTokenRepository;
import com.example.identify_service.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    RedisTemplate<String, Object> redisTemplate;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String signerKey;

    @NonFinal
    @Value("${jwt.valid-duration:3600}")
    protected long validDuration;

    @NonFinal
    @Value("${jwt.refreshable-duration:604800}")
    protected long refreshableDuration;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        var user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!authenticated) throw new AppException(ErrorCode.UNAUTHENTICATED);

        // Tạo access token
        var accessToken = generateToken(user);

        // Tạo refresh token
        var refreshToken = generateRefreshToken(user);

        // Lưu refresh token vào Redis với TTL
        String redisKey = "refresh_token:" + user.getId();
        redisTemplate
                .opsForValue()
                .set(redisKey, refreshToken.tokenId, java.time.Duration.ofSeconds(refreshableDuration));

        return AuthenticationResponse.builder()
                .token(accessToken.token)
                .refreshToken(refreshToken.token)
                .expiryTime(accessToken.expiryDate)
                .authenticated(true)
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        var signToken = verifyToken(request.getToken());
        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

        // Lấy userId từ token để xóa refresh token khỏi Redis
        String userId = (String) signToken.getJWTClaimsSet().getClaim("userId");
        String redisKey = "refresh_token:" + userId;
        redisTemplate.delete(redisKey);

        // Thêm token vào blacklist
        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();
        invalidatedTokenRepository.save(invalidatedToken);
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken());
        var jwtId = signedJWT.getJWTClaimsSet().getJWTID();

        // Lấy userId từ refresh token
        String userId = (String) signedJWT.getJWTClaimsSet().getClaim("userId");
        String redisKey = "refresh_token:" + userId;

        // Kiểm tra refresh token có tồn tại trong Redis không
        String storedTokenId = (String) redisTemplate.opsForValue().get(redisKey);
        if (storedTokenId == null || !storedTokenId.equals(jwtId)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Xóa refresh token cũ khỏi Redis
        redisTemplate.delete(redisKey);

        // Thêm refresh token cũ vào blacklist
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jwtId).expiryTime(expiryTime).build();
        invalidatedTokenRepository.save(invalidatedToken);

        var username = signedJWT.getJWTClaimsSet().getSubject();
        var user =
                userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Tạo access token và refresh token mới
        var accessToken = generateToken(user);
        var refreshToken = generateRefreshToken(user);

        // Lưu refresh token mới vào Redis
        redisTemplate
                .opsForValue()
                .set(redisKey, refreshToken.tokenId, java.time.Duration.ofSeconds(refreshableDuration));

        return AuthenticationResponse.builder()
                .token(accessToken.token)
                .refreshToken(refreshToken.token)
                .expiryTime(accessToken.expiryDate)
                .authenticated(true)
                .build();
    }

    private TokenInfo generateToken(User user) {
        return generateAccessToken(user);
    }

    private TokenInfo generateAccessToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        Date issueTime = new Date();
        Date expiryTime = new Date(Instant.ofEpochMilli(issueTime.getTime())
                .plus(validDuration, ChronoUnit.SECONDS)
                .toEpochMilli());

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("devteria.com")
                .issueTime(issueTime)
                .expirationTime(expiryTime)
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .claim("userId", user.getId())
                .claim("type", "access")
                .build();

        return createToken(header, jwtClaimsSet, expiryTime);
    }

    private TokenInfo generateRefreshToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        Date issueTime = new Date();
        Date expiryTime = new Date(Instant.ofEpochMilli(issueTime.getTime())
                .plus(refreshableDuration, ChronoUnit.SECONDS)
                .toEpochMilli());

        String tokenId = UUID.randomUUID().toString();
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("devteria.com")
                .issueTime(issueTime)
                .expirationTime(expiryTime)
                .jwtID(tokenId)
                .claim("userId", user.getId())
                .claim("type", "refresh")
                .build();

        return new TokenInfo(createToken(header, jwtClaimsSet, expiryTime).token, expiryTime, tokenId);
    }

    private TokenInfo createToken(JWSHeader header, JWTClaimsSet jwtClaimsSet, Date expiryTime) {
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return new TokenInfo(jwsObject.serialize(), expiryTime);
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(signerKey.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(user.getRoles()))
            user.getRoles().forEach(role -> {
                stringJoiner.add("ROLE_" + role.getName());
                if (!CollectionUtils.isEmpty(role.getPermissions()))
                    role.getPermissions().forEach(permission -> stringJoiner.add(permission.getName()));
            });

        return stringJoiner.toString();
    }

    private record TokenInfo(String token, Date expiryDate, String tokenId) {
        public TokenInfo(String token, Date expiryDate) {
            this(token, expiryDate, null);
        }
    }
}
