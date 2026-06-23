package com.thumuaphelieu.backend.repository;

import com.thumuaphelieu.backend.entity.ScrapProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScrapProductRepository extends JpaRepository<ScrapProduct, Long> {
    List<ScrapProduct> findByCategoryId(Long categoryId);
}
