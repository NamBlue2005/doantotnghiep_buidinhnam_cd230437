package com.thumuaphelieu.backend.repository;

import com.thumuaphelieu.backend.entity.OrderApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderApplicationRepository extends JpaRepository<OrderApplication, Long> {
    List<OrderApplication> findByOrderId(Long orderId);
    Optional<OrderApplication> findByOrderIdAndDriverId(Long orderId, Long driverId);
}