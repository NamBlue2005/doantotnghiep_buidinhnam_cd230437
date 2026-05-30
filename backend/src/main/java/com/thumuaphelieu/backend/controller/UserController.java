package com.thumuaphelieu.backend.controller;

import com.thumuaphelieu.backend.entity.User;
import com.thumuaphelieu.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        String phone = payload.get("phone");
        String fullName = payload.get("fullName");
        String avatarUrl = payload.get("avatarUrl");

        User user = userService.loginOrRegister(phone, fullName, avatarUrl);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/switch-role")
    public ResponseEntity<User> switchRole(@PathVariable Long id, @RequestParam Integer newRole) {
        User updatedUser = userService.switchRole(id, newRole);
        return ResponseEntity.ok(updatedUser);
    }
}