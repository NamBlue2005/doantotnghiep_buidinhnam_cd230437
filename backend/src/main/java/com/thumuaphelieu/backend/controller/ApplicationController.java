package com.thumuaphelieu.backend.controller;

import com.thumuaphelieu.backend.entity.OrderApplication;
import com.thumuaphelieu.backend.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Autowired
    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<?> applyForOrder(@RequestBody Map<String, Object> payload) {
        try {
            Long orderId = Long.valueOf(payload.get("orderId").toString());
            Long driverId = Long.valueOf(payload.get("driverId").toString());
            Double distanceKm = Double.valueOf(payload.get("distanceKm").toString());

            applicationService.applyForOrder(orderId, driverId, distanceKm);
            return ResponseEntity.ok(Map.of("message", "Nhận đơn thành công"));
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Lỗi nội bộ Server (NullPointerException)";
            return ResponseEntity.badRequest().body(Map.of("error", errorMsg));
        }
    }

    // API: Lấy danh sách tài xế đã ứng tuyển theo ID đơn hàng
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderApplication>> getApplicationsByOrder(@PathVariable Long orderId) {
        List<OrderApplication> applications = applicationService.getApplicationsByOrderId(orderId);
        return ResponseEntity.ok(applications);
    }
}