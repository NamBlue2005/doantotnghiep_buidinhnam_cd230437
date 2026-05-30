package com.thumuaphelieu.backend.service;

import com.thumuaphelieu.backend.entity.Order;
import com.thumuaphelieu.backend.entity.Review;
import com.thumuaphelieu.backend.entity.User;
import com.thumuaphelieu.backend.repository.OrderRepository;
import com.thumuaphelieu.backend.repository.ReviewRepository;
import com.thumuaphelieu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, OrderRepository orderRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Review createReview(Long orderId, Long reviewerId, Long reviewedId, Integer rating, String comment) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người đánh giá: " + reviewerId));
        User reviewed = userRepository.findById(reviewedId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người được đánh giá: " + reviewedId));

        Review review = new Review();
        review.setOrder(order);
        review.setReviewer(reviewer);
        review.setReviewed(reviewed);
        review.setRating(rating);
        review.setComment(comment);
        return reviewRepository.save(review);
    }

    public List<Review> getReviewsForUser(Long userId) {
        return reviewRepository.findByReviewedId(userId);
    }
}