package com.thumuaphelieu.backend.repository;

import com.thumuaphelieu.backend.entity.Order;
import com.thumuaphelieu.backend.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
    List<Order> findBySellerId(Long sellerId);
    Optional<Order> findByIdAndSellerId(Long id, Long sellerId);
}