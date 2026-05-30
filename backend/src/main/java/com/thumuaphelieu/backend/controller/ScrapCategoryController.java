package com.thumuaphelieu.backend.controller;

import com.thumuaphelieu.backend.entity.ScrapCategory;
import com.thumuaphelieu.backend.service.ScrapCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/categories")
public class ScrapCategoryController {

    private final ScrapCategoryService categoryService;

    @Autowired
    public ScrapCategoryController(ScrapCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // API: Lấy toàn bộ danh mục phế liệu để hiển thị lên App
    @GetMapping
    public ResponseEntity<List<ScrapCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}