// controller/AuthController.java
package com.authx.authapi.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.authx.authapi.model.User;
import com.authx.authapi.repository.UserRepository;
import com.authx.authapi.security.JwtUtil;

import jakarta.servlet.http.HttpServletResponse;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload, HttpServletResponse response) {
        String email = payload.get("email");
        String password = payload.get("password");

        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }

        User user = userOpt.get();
        String accessToken = jwtUtil.generateToken(email);

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "mockRefreshToken")
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(86400)
            .build();
        response.addHeader("Set-Cookie", refreshCookie.toString());

        return ResponseEntity.ok(Map.of(
            "token", accessToken,
            "user", Map.of(
                "name", user.getName(),
                "avatar", user.getAvatar()
            )
        ));
    }


    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.getEmailFromToken(token);

        return userRepo.findByEmail(email)
            .map(user -> ResponseEntity.ok(Map.of(
                "token", jwtUtil.generateToken(email),
                "user", Map.of("name", user.getName(), "avatar", user.getAvatar())
            )))
            .orElse(ResponseEntity.status(403).body(Map.of("message", "Unauthorized")));
    }

    @GetMapping("/refreshToken")
    public ResponseEntity<?> refreshToken(@CookieValue(name = "refreshToken", required = false) String cookie) {
        if (cookie == null || !cookie.equals("mockRefreshToken")) {
            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
        }

        String email = "test@example.com"; // powinien być ustalany z refresh tokena
        String newAccessToken = jwtUtil.generateToken(email);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
            .httpOnly(true)
            .path("/")
            .maxAge(0)
            .build();
        response.addHeader("Set-Cookie", deleteCookie.toString());
        return ResponseEntity.ok().build();
    }
}
