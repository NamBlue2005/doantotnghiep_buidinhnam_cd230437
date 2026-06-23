package com.thumuaphelieu.backend.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "handler"}, ignoreUnknown = true)
@Entity
@Table(name = "scrap_products")
public class ScrapProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ScrapCategory category;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(name = "image_url", columnDefinition = "TEXT")
    @JsonAlias("image")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String detail;

    public ScrapProduct() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ScrapCategory getCategory() { return category; }
    public void setCategory(ScrapCategory category) { this.category = category; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
}
