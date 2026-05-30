package com.thumuaphelieu.backend.controller;

import com.thumuaphelieu.backend.entity.Order;
import com.thumuaphelieu.backend.entity.OrderApplication;
import com.thumuaphelieu.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // API 1: NGƯỜI BÁN - Đăng đơn hàng mới
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Map<String, Object> payload) {
        Long sellerId = Long.valueOf(payload.get("sellerId").toString());
        String address = (String) payload.get("address");
        Double latitude = Double.valueOf(payload.get("latitude").toString());
        Double longitude = Double.valueOf(payload.get("longitude").toString());
        String imageUrl = (String) payload.get("imageUrl"); // Có thể null
        
        String pickupTimeStr = (String) payload.get("pickupTime");
        LocalDateTime pickupTime = null;
        if (pickupTimeStr != null && !pickupTimeStr.isEmpty()) {
            pickupTime = LocalDateTime.parse(pickupTimeStr);
        }
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) payload.get("items");

        Order order = orderService.createOrder(sellerId, itemsData, address, latitude, longitude, imageUrl, pickupTime);
        return ResponseEntity.ok(order);
    }

    // API 3: NGƯỜI BÁN - Chốt một tài xế cho đơn hàng
    @PostMapping("/{orderId}/match")
    public ResponseEntity<String> matchDriver(@PathVariable Long orderId,
                                              @RequestBody Map<String, Object> payload) {
        Long sellerId = Long.valueOf(payload.get("sellerId").toString());
        Long driverId = Long.valueOf(payload.get("driverId").toString());

        orderService.matchDriver(orderId, sellerId, driverId);
        return ResponseEntity.ok("Chốt tài xế thành công!");
    }

    // API 4: TÀI XẾ - Lấy danh sách các đơn hàng đang chờ ứng tuyển
    @GetMapping("/available")
    public ResponseEntity<List<Order>> getAvailableOrders() {
        return ResponseEntity.ok(orderService.getAvailableOrders());
    }

    // API 5: NGƯỜI BÁN - Lấy danh sách đơn hàng mình đã đăng
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Order>> getOrdersBySeller(@PathVariable Long sellerId) {
        return ResponseEntity.ok(orderService.getOrdersBySeller(sellerId));
    }

    // API 5.1: TÀI XẾ - Lấy danh sách đơn hàng mình đã nhận
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Order>> getOrdersByDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(orderService.getOrdersByDriver(driverId));
    }

    // API 6: Lấy chi tiết một đơn hàng
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

        // API: Hủy đơn hàng
    @PutMapping("/{id}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long id, @RequestParam Long sellerId) {
        try {
            orderService.cancelOrder(id, sellerId);
            return ResponseEntity.ok("Đã hủy đơn hàng thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API 8: TÀI XẾ - Xác nhận hoàn thành đơn hàng
    @PutMapping("/{id}/complete")
    public ResponseEntity<String> completeOrder(@PathVariable Long id) {
        orderService.completeOrder(id);
        return ResponseEntity.ok("Đã hoàn thành đơn hàng");
    }
}
