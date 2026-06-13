package com.thumuaphelieu.backend.service;

import com.thumuaphelieu.backend.entity.Order;
import com.thumuaphelieu.backend.entity.OrderItem;
import com.thumuaphelieu.backend.entity.OrderApplication;
import com.thumuaphelieu.backend.entity.ScrapCategory;
import com.thumuaphelieu.backend.entity.User;
import com.thumuaphelieu.backend.enums.ApplicationStatus;
import com.thumuaphelieu.backend.enums.OrderStatus;
import com.thumuaphelieu.backend.repository.OrderApplicationRepository;
import com.thumuaphelieu.backend.repository.OrderRepository;
import com.thumuaphelieu.backend.repository.ScrapCategoryRepository;
import com.thumuaphelieu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ScrapCategoryRepository scrapCategoryRepository;
    private final OrderApplicationRepository orderApplicationRepository;
    private final NotificationService notificationService;

    // Thuần Java: Inject các dependency thông qua Constructor (Không dùng Lombok)
    @Autowired
    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        ScrapCategoryRepository scrapCategoryRepository,
                        OrderApplicationRepository orderApplicationRepository,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.scrapCategoryRepository = scrapCategoryRepository;
        this.orderApplicationRepository = orderApplicationRepository;
        this.notificationService = notificationService;
    }

    // 1. NGƯỜI BÁN: Tạo đơn hàng mới
    @Transactional
    public Order createOrder(Long sellerId, List<Map<String, Object>> itemsData, String address, Double latitude, Double longitude, String imageUrl, LocalDateTime pickupTime) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người bán với ID: " + sellerId));

        Order order = new Order();
        order.setSeller(seller);
        order.setAddress(address);
        order.setLatitude(latitude);
        order.setLongitude(longitude);
        order.setImageUrl(imageUrl);
        order.setPickupTime(pickupTime);
        order.setStatus(OrderStatus.PENDING); // Đơn mới luôn ở trạng thái chờ

        double totalWeight = 0.0;
        for (Map<String, Object> itemData : itemsData) {
            Long catId = Long.valueOf(itemData.get("categoryId").toString());
            Double weight = Double.valueOf(itemData.get("weight").toString());
            ScrapCategory cat = scrapCategoryRepository.findById(catId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục phế liệu với ID: " + catId));
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setCategory(cat);
            orderItem.setWeight(weight);
            order.getItems().add(orderItem);
            totalWeight += weight;
            
            // Gán loại đầu tiên làm category chính (để không bị lỗi các tính năng cũ)
            if (order.getCategory() == null) order.setCategory(cat);
        }
        order.setEstimatedWeight(totalWeight);

        // Tạo mã đơn hàng ngẫu nhiên gồm chữ và số (Ví dụ: ODA1B2C3D4)
        order.setOrderCode("OD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        Order savedOrder = orderRepository.save(order);
        
        notificationService.sendNotification(sellerId, "Đăng đơn thành công", "Đơn hàng của bạn đã được hệ thống ghi nhận. Vui lòng chờ tài xế ứng tuyển.", savedOrder.getId());
        return savedOrder;
    }

    // 3. NGƯỜI BÁN: Chốt tài xế (Match)
    @Transactional
    public void matchDriver(Long orderId, Long sellerId, Long driverId) {
        Order order = orderRepository.findByIdAndSellerId(orderId, sellerId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc bạn không có quyền!"));

        if (order.getStatus() != OrderStatus.HAS_OFFERS) {
            throw new RuntimeException("Không thể chốt tài xế cho đơn hàng ở trạng thái này.");
        }

        User matchedDriver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Tài xế được chọn không tồn tại."));

        // Duyệt qua tất cả các ứng tuyển: Chấp nhận tài xế được chọn, Từ chối những người còn lại
        List<OrderApplication> applications = orderApplicationRepository.findByOrderId(orderId);
        for (OrderApplication app : applications) {
            if (app.getDriver().getId().equals(driverId)) {
                app.setStatus(ApplicationStatus.ACCEPTED);
                // Gửi thông báo trúng thầu cho tài xế
                notificationService.sendNotification(app.getDriver().getId(), "Chúc mừng!", "Bạn đã được chọn để thu mua đơn hàng tại " + order.getAddress(), order.getId());
            } else {
                app.setStatus(ApplicationStatus.REJECTED);
                // Gửi thông báo từ chối cho các tài xế khác
                notificationService.sendNotification(app.getDriver().getId(), "Rất tiếc!", "Đơn hàng bạn ứng tuyển đã được giao cho người khác.", order.getId());
            }
        }
        orderApplicationRepository.saveAll(applications);

        order.setMatchedDriver(matchedDriver);
        order.setStatus(OrderStatus.MATCHED);
        order.setAcceptedAt(LocalDateTime.now()); // Lưu thời gian chốt tài xế
        orderRepository.save(order);
    }

    // 4. TÀI XẾ: Lấy danh sách đơn hàng đang chờ (PENDING)
    public List<Order> getAvailableOrders() {
        return orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.HAS_OFFERS)
                .collect(Collectors.toList());
    }

    // 5. NGƯỜI BÁN: Lấy danh sách đơn hàng đã đăng
    public List<Order> getOrdersBySeller(Long sellerId) {
        return orderRepository.findBySellerId(sellerId);
    }

    // 5.1 TÀI XẾ: Lấy danh sách đơn hàng đã được chốt (MATCHED/COMPLETED)
    public List<Order> getOrdersByDriver(Long driverId) {
        return orderRepository.findAll().stream()
                .filter(order -> order.getMatchedDriver() != null && order.getMatchedDriver().getId().equals(driverId))
                .collect(Collectors.toList());
    }

    // 6. Lấy chi tiết 1 đơn hàng
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + id));
    }

    // 7. NGƯỜI BÁN: Hủy đơn hàng
    @Transactional
    public void cancelOrder(Long orderId, Long sellerId) {
        // Dùng findById thay vì findByIdAndSellerId để Tài xế cũng có thể lấy ra đơn hàng (sellerId lúc này đóng vai trò là userId truyền lên)
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));

        if (order.getSeller().getId().equals(sellerId)) { // Nếu là Người Bán hủy
            if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.HAS_OFFERS) {
                throw new RuntimeException("Chỉ có thể hủy đơn hàng khi chưa chốt tài xế.");
            }
            if (order.getMatchedDriver() != null) {
                notificationService.sendNotification(order.getMatchedDriver().getId(), "Đơn hàng đã hủy", "Người bán đã hủy yêu cầu thu gom tại " + order.getAddress(), order.getId());
            }
        } else if (order.getMatchedDriver() != null && order.getMatchedDriver().getId().equals(sellerId)) { // Nếu là Tài xế hủy
            if (order.getStatus() != OrderStatus.MATCHED) {
                throw new RuntimeException("Chỉ có thể hủy đơn hàng đang thực hiện.");
            }
            notificationService.sendNotification(order.getSeller().getId(), "Tài xế đã hủy đơn", "Tài xế đã hủy yêu cầu thu mua đơn hàng của bạn.", order.getId());
        } else {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này!");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    // 8. TÀI XẾ: Hoàn thành đơn hàng
    @Transactional
    public void completeOrder(Long orderId) {
        Order order = getOrderById(orderId);
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now()); // Lưu thời gian hoàn thành
        orderRepository.save(order);
        
        // Gửi thông báo cho Người bán
        notificationService.sendNotification(order.getSeller().getId(), "Hoàn thành thu gom", "Tài xế đã hoàn thành đơn hàng của bạn. Hãy vào đánh giá nhé!", order.getId());
    }

    // 9. THỐNG KÊ DOANH THU & KHỐI LƯỢNG
    public Map<String, Object> getUserStats(Long userId, Integer role) {
        List<Order> completedOrders;
        if (role != null && role == 2) {
            completedOrders = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus() == OrderStatus.COMPLETED && o.getMatchedDriver() != null && o.getMatchedDriver().getId().equals(userId))
                    .collect(Collectors.toList());
        } else {
            completedOrders = orderRepository.findBySellerId(userId).stream()
                    .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                    .collect(Collectors.toList());
        }

        double totalWeight = completedOrders.stream().mapToDouble(Order::getEstimatedWeight).sum();
        double totalRevenue = totalWeight * 5000.0; // Tạm tính 5000đ/kg

        return Map.of("totalOrders", completedOrders.size(), "totalWeight", totalWeight, "totalRevenue", totalRevenue);
    }
}
