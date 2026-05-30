package com.thumuaphelieu.backend.service;

import com.thumuaphelieu.backend.entity.Order;
import com.thumuaphelieu.backend.entity.Transaction;
import com.thumuaphelieu.backend.enums.OrderStatus;
import com.thumuaphelieu.backend.enums.TransactionStatus;
import com.thumuaphelieu.backend.repository.OrderRepository;
import com.thumuaphelieu.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;
import java.util.Map;

@Service
public class ZaloPayService {

    private final TransactionRepository transactionRepository;
    private final OrderRepository orderRepository;

    @Autowired
    public ZaloPayService(TransactionRepository transactionRepository, OrderRepository orderRepository) {
        this.transactionRepository = transactionRepository;
        this.orderRepository = orderRepository;
    }

    // 1. Tạo yêu cầu thanh toán (Lưu db và trả về Link ZaloPay)
    @Transactional
    public String createPayment(Long orderId, Double amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        // Tạo mã giao dịch duy nhất cho hệ thống theo format: YYMMDD_UUID
        String transId = new SimpleDateFormat("yyMMdd").format(new Date()) + "_" + UUID.randomUUID().toString().substring(0, 8);

        Transaction transaction = new Transaction();
        transaction.setOrder(order);
        transaction.setAmount(amount);
        transaction.setAppTransId(transId);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setPaymentMethod("ZALOPAY");

        transactionRepository.save(transaction);

        // TÍCH HỢP GỌI API TẠO ĐƠN THẬT CỦA ZALOPAY SANDBOX
        String appId = "2553"; // App ID dùng để test của ZaloPay
        String key1 = "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL";
        String endpoint = "https://sb-openapi.zalopay.vn/v2/create";
        String callbackUrl = "https://marbles-pancreas-sandpaper.ngrok-free.dev/api/payments/webhook"; // Link ngrok của bạn

        // Sử dụng MultiValueMap theo đúng chuẩn Form URL-Encoded của ZaloPay
        MultiValueMap<String, String> orderParams = new LinkedMultiValueMap<>();
        orderParams.add("app_id", appId);
        orderParams.add("app_trans_id", transId);
        orderParams.add("app_time", String.valueOf(System.currentTimeMillis()));
        orderParams.add("app_user", "vechai_user_" + order.getSeller().getId());
        orderParams.add("amount", String.valueOf(amount.longValue()));
        orderParams.add("description", "Thanh toán đơn hàng #" + orderId);
        orderParams.add("bank_code", "");
        orderParams.add("item", "[]");
        orderParams.add("embed_data", "{}");
        orderParams.add("callback_url", callbackUrl);

        // Tạo chuỗi data để mã hóa: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        String data = appId + "|" + transId + "|" + orderParams.getFirst("app_user") + "|" + orderParams.getFirst("amount") + "|" + orderParams.getFirst("app_time") + "|" + orderParams.getFirst("embed_data") + "|" + orderParams.getFirst("item");
        String mac = hmacSHA256(key1, data);
        orderParams.add("mac", mac);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(orderParams, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, request, Map.class);
            Map<String, Object> resBody = response.getBody();
            if (resBody != null && (Integer) resBody.get("return_code") == 1) {
                return (String) resBody.get("order_url");
            } else {
                throw new RuntimeException("Lỗi tạo đơn ZaloPay: " + resBody.get("return_message"));
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi gọi API ZaloPay: " + e.getMessage());
        }
    }

    // Hàm hỗ trợ tạo mã hóa HMAC-SHA256 theo chuẩn ZaloPay
    private String hmacSHA256(String key, String data) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes("UTF-8"), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] bytes = sha256_HMAC.doFinal(data.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi mã hóa HMAC: " + e.getMessage());
        }
    }

    // 2. Xử lý Webhook (ZaloPay gọi về Backend khi user trả tiền xong)
    @Transactional
    public void processWebhook(String appTransId, String zpTransId) {
        Transaction transaction = transactionRepository.findByAppTransId(appTransId)
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại: " + appTransId));

        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setZpTransId(zpTransId);
        transaction.getOrder().setStatus(OrderStatus.COMPLETED); // Đổi trạng thái đơn hàng thành Hoàn Thành

        transactionRepository.save(transaction);
    }
}
