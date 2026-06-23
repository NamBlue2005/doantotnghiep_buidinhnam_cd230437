package com.thumuaphelieu.backend.controller;

import com.thumuaphelieu.backend.entity.ScrapCategory;
import com.thumuaphelieu.backend.service.ScrapCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class ScrapCategoryController {

    private final ScrapCategoryService categoryService;

    @Autowired
    public ScrapCategoryController(ScrapCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // API: Lấy toàn bộ danh mục phế liệu
    @GetMapping
    public ResponseEntity<List<ScrapCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // API: Lấy danh mục theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ScrapCategory> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // API: Thêm mới danh mục
    @PostMapping
    public ResponseEntity<ScrapCategory> createCategory(@RequestBody ScrapCategory category) {
        ScrapCategory saved = categoryService.createCategory(category);
        return ResponseEntity.ok(saved);
    }

    // API: Cập nhật danh mục
    @PutMapping("/{id}")
    public ResponseEntity<ScrapCategory> updateCategory(@PathVariable Long id, @RequestBody ScrapCategory category) {
        try {
            ScrapCategory updated = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // API: Xóa danh mục
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(Map.of("message", "Xóa danh mục thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
