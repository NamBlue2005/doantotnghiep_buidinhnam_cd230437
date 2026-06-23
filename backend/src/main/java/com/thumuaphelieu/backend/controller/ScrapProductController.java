package com.thumuaphelieu.backend.controller;

import com.thumuaphelieu.backend.entity.ScrapProduct;
import com.thumuaphelieu.backend.service.ScrapProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scrap-products")
public class ScrapProductController {

    private final ScrapProductService productService;

    @Autowired
    public ScrapProductController(ScrapProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ScrapProduct>> getAllProducts(
            @RequestParam(required = false) Long categoryId
    ) {
        if (categoryId != null) {
            return ResponseEntity.ok(productService.getProductsByCategoryId(categoryId));
        }

        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScrapProduct> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScrapProduct> createProduct(@RequestBody ScrapProduct product) {
        ScrapProduct saved = productService.createProduct(product);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScrapProduct> updateProduct(
            @PathVariable Long id,
            @RequestBody ScrapProduct product
    ) {
        try {
            ScrapProduct updated = productService.updateProduct(id, product);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
