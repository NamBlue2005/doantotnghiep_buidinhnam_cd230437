package com.thumuaphelieu.backend.controller;

import com.thumuaphelieu.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Long userId, @RequestParam Integer role) {
        return ResponseEntity.ok(orderService.getUserStats(userId, role));
    }
}