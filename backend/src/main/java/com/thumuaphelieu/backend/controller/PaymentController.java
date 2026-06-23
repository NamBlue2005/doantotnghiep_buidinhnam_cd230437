package com.thumuaphelieu.backend.controller;

import com.thumuaphelieu.backend.service.ZaloPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final ZaloPayService zaloPayService;

    @Autowired
    public PaymentController(ZaloPayService zaloPayService) {
        this.zaloPayService = zaloPayService;
    }

    // API 1: App gọi lên Server để lấy Link/Token thanh toán ZaloPay
    @PostMapping("/create")
    public ResponseEntity<String> createPayment(@RequestBody Map<String, Object> payload) {
        Long orderId = Long.valueOf(payload.get("orderId").toString());
        Double amount = Double.valueOf(payload.get("amount").toString());
        // Nhận thêm tổng khối lượng thực tế từ Frontend
        Double actualWeight = payload.containsKey("actualWeight") 
            ? Double.valueOf(payload.get("actualWeight").toString()) 
            : 0.0;
        // Nhận danh sách khối lượng thực tế của từng loại phế liệu
        List<Map<String, Object>> itemUpdates = (List<Map<String, Object>>) payload.get("items");

        String paymentUrl = zaloPayService.createPayment(orderId, amount, actualWeight, itemUpdates);
        return ResponseEntity.ok(paymentUrl);
    }

    // API 2: Webhook dành riêng cho máy chủ ZaloPay gọi về Backend (Không phải App gọi)
    // Phải trả về JSON theo đúng chuẩn ZaloPay yêu cầu {"return_code": 1, "return_message": "success"}
    @PostMapping("/webhook")
    public ResponseEntity<String> processWebhook(@RequestBody Map<String, Object> payload) {
        try {
            // ZaloPay trả về chuỗi JSON bọc trong trường "data"
            String dataStr = (String) payload.get("data");
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> data = mapper.readValue(dataStr, new TypeReference<Map<String, Object>>(){});

            String appTransId = (String) data.get("app_trans_id");
            String zpTransId = String.valueOf(data.get("zp_trans_id"));

            zaloPayService.processWebhook(appTransId, zpTransId);
            return ResponseEntity.ok("{\"return_code\": 1, \"return_message\": \"success\"}");
        } catch (Exception e) {
            // Nếu có lỗi, trả về return_code = 0 để ZaloPay biết và gọi lại (retry)
            return ResponseEntity.badRequest().body("{\"return_code\": 0, \"return_message\": \"" + e.getMessage() + "\"}");
        }
    }

}
