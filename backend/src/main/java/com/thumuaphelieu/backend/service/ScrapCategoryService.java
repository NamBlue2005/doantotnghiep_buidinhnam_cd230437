package com.thumuaphelieu.backend.service;

import com.thumuaphelieu.backend.entity.ScrapCategory;
import com.thumuaphelieu.backend.repository.ScrapCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
}