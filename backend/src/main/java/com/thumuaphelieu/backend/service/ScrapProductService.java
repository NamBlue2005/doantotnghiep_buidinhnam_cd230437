package com.thumuaphelieu.backend.service;

import com.thumuaphelieu.backend.entity.ScrapCategory;
import com.thumuaphelieu.backend.entity.ScrapProduct;
import com.thumuaphelieu.backend.repository.ScrapCategoryRepository;
import com.thumuaphelieu.backend.repository.ScrapProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ScrapProductService {

    private final ScrapProductRepository productRepository;
    private final ScrapCategoryRepository categoryRepository;

    @Autowired
    public ScrapProductService(
            ScrapProductRepository productRepository,
            ScrapCategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ScrapProduct> getAllProducts() {
        return productRepository.findAll();
    }

    public List<ScrapProduct> getProductsByCategoryId(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public Optional<ScrapProduct> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public ScrapProduct createProduct(ScrapProduct product) {
        attachCategory(product);
        return productRepository.save(product);
    }

    public ScrapProduct updateProduct(Long id, ScrapProduct productDetails) {
        ScrapProduct existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));

        existing.setName(productDetails.getName());
        existing.setPrice(productDetails.getPrice());
        existing.setImageUrl(productDetails.getImageUrl());
        existing.setDetail(productDetails.getDetail());

        if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null) {
            attachCategory(productDetails);
            existing.setCategory(productDetails.getCategory());
        }

        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        ScrapProduct existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        productRepository.delete(existing);
    }

    private void attachCategory(ScrapProduct product) {
        if (product.getCategory() == null || product.getCategory().getId() == null) {
            return;
        }

        ScrapCategory category = categoryRepository.findById(product.getCategory().getId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy danh mục với ID: " + product.getCategory().getId()
                ));
        product.setCategory(category);
    }
}
