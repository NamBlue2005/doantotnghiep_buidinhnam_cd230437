package com.thumuaphelieu.backend.service;

import com.thumuaphelieu.backend.entity.Notification;
import com.thumuaphelieu.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void sendNotification(Long userId, String title, String message, Long orderId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setOrderId(orderId);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : notifications) {
            if (n.getIsRead() == null || !n.getIsRead()) {
                n.setIsRead(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }
}