package com.thumuaphelieu.backend.controller;

import com.thumuaphelieu.backend.entity.User;
import com.thumuaphelieu.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody Map<String, String> payload) {
        String zaloId = payload.get("zaloId");
        String phone = payload.get("phone");
        String fullName = payload.get("fullName");
        String avatarUrl = payload.get("avatarUrl");

        User user = userService.loginOrRegister(zaloId, phone, fullName, avatarUrl);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/switch-role")
    public ResponseEntity<User> switchRole(@PathVariable Long id, @RequestParam Integer newRole) {
        User updatedUser = userService.switchRole(id, newRole);
        return ResponseEntity.ok(updatedUser);
    }

    // Lấy danh sách tất cả người dùng (Dành cho Admin)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Admin cập nhật quyền cho người dùng
    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        User updatedUser = userService.switchRole(id, request.get("role"));
        return ResponseEntity.ok(updatedUser);
    }
}
