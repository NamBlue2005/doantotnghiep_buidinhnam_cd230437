package com.thumuaphelieu.backend.controller;

import com.thumuaphelieu.backend.entity.Review;
import com.thumuaphelieu.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // API 1: Đăng đánh giá sau khi hoàn thành giao dịch
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Map<String, Object> payload) {
        Long orderId = Long.valueOf(payload.get("orderId").toString());
        Long reviewerId = Long.valueOf(payload.get("reviewerId").toString());
        Long reviewedId = Long.valueOf(payload.get("reviewedId").toString());
        Integer rating = Integer.valueOf(payload.get("rating").toString());
        String comment = (String) payload.get("comment");

        Review review = reviewService.createReview(orderId, reviewerId, reviewedId, rating, comment);
        return ResponseEntity.ok(review);
    }

    // API 2: Lấy danh sách tất cả các đánh giá của 1 tài xế hoặc 1 người bán
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsForUser(userId));
    }
}