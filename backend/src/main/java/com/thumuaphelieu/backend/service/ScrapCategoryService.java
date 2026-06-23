package com.thumuaphelieu.backend.service;

import com.thumuaphelieu.backend.entity.ScrapCategory;
import com.thumuaphelieu.backend.repository.ScrapCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ScrapCategoryService {

    private final ScrapCategoryRepository categoryRepository;

    @Autowired
    public ScrapCategoryService(ScrapCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<ScrapCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<ScrapCategory> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public ScrapCategory createCategory(ScrapCategory category) {
        return categoryRepository.save(category);
    }

    public ScrapCategory updateCategory(Long id, ScrapCategory categoryDetails) {
        ScrapCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
        existing.setName(categoryDetails.getName());
        existing.setUnit(categoryDetails.getUnit());
        existing.setBasePrice(categoryDetails.getBasePrice());
        existing.setImageUrl(categoryDetails.getImageUrl());
        return categoryRepository.save(existing);
    }

    public void deleteCategory(Long id) {
        ScrapCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
        categoryRepository.delete(existing);
    }
}
