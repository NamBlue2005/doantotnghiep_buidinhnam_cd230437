package com.thumuaphelieu.backend.service;

import com.thumuaphelieu.backend.entity.Order;
import com.thumuaphelieu.backend.entity.OrderApplication;
import com.thumuaphelieu.backend.entity.User;
import com.thumuaphelieu.backend.enums.ApplicationStatus;
import com.thumuaphelieu.backend.enums.OrderStatus;
import com.thumuaphelieu.backend.repository.OrderApplicationRepository;
import com.thumuaphelieu.backend.repository.OrderRepository;
import com.thumuaphelieu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicationService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderApplicationRepository orderApplicationRepository;
    private final NotificationService notificationService;

    @Autowired
    public ApplicationService(OrderRepository orderRepository,
                              UserRepository userRepository,
                              OrderApplicationRepository orderApplicationRepository,
                              NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.orderApplicationRepository = orderApplicationRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public OrderApplication applyForOrder(Long orderId, Long driverId, Double distanceKm) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài xế với ID: " + driverId));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.HAS_OFFERS) {
            throw new RuntimeException("Đơn hàng này không còn nhận ứng tuyển.");
        }

        orderApplicationRepository.findByOrderIdAndDriverId(orderId, driverId).ifPresent(app -> {
            throw new RuntimeException("Bạn đã ứng tuyển vào đơn hàng này rồi.");
        });

        OrderApplication application = new OrderApplication();
        application.setOrder(order);
        application.setDriver(driver);
        application.setDistanceKm(distanceKm);
        application.setStatus(ApplicationStatus.WAITING);
        OrderApplication savedApp = orderApplicationRepository.save(application);

        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.HAS_OFFERS);
            orderRepository.save(order);
        }

        // Tự động gửi thông báo cho Người bán
        String title = "Có người ứng tuyển mới!";
        String content = "Tài xế " + driver.getFullName() + " vừa ứng tuyển vào đơn hàng của bạn với khoảng cách " + distanceKm + "km.";
        notificationService.sendNotification(order.getSeller().getId(), title, content, order.getId());

        return savedApp;
    }

    // Lấy danh sách các tài xế đã ứng tuyển vào 1 đơn hàng
    public List<OrderApplication> getApplicationsByOrderId(Long orderId) {
        return orderApplicationRepository.findByOrderId(orderId);
    }
}