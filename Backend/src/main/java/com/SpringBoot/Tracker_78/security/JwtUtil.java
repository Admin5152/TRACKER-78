// src/main/java/com/SpringBoot/Tracker_78/security/JwtUtil.java
package com.SpringBoot.Tracker_78.security;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiresIn}")
    private long accessTokenExpiresIn;

    @Value("${jwt.refreshExpiresIn}")
    private long refreshTokenExpiresIn;

    public String generateAccessToken(String appwriteId) {
        return Jwts.builder()
                .setSubject(appwriteId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiresIn))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    public String generateRefreshToken(String appwriteId) {
        return Jwts.builder()
                .setSubject(appwriteId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiresIn))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    public String extractAppwriteId(String token) {
        return Jwts.parser().setSigningKey(secretKey)
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public long getRefreshTokenExpiresIn() {
        return refreshTokenExpiresIn;
    }
}