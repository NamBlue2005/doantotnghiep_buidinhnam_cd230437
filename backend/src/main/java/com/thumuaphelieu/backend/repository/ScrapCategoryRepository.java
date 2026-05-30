package com.thumuaphelieu.backend.repository;

import com.thumuaphelieu.backend.entity.ScrapCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScrapCategoryRepository extends JpaRepository<ScrapCategory, Long> {
}