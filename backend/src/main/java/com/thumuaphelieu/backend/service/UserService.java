package com.thumuaphelieu.backend.service;

import com.thumuaphelieu.backend.entity.User;
import com.thumuaphelieu.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. Đăng nhập hoặc Đăng ký tự động (Dựa vào số điện thoại từ Zalo)
    @Transactional
    public User loginOrRegister(String phone, String fullName, String avatarUrl) {
        Optional<User> existingUser = userRepository.findByPhone(phone);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Cập nhật thông tin mới nhất từ Zalo (nếu có thay đổi)
            if (fullName != null) user.setFullName(fullName);
            if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
            return userRepository.save(user);
        } else {
            // Tạo tài khoản mới nếu chưa tồn tại
            User newUser = new User();
            newUser.setPhone(phone);
            newUser.setFullName(fullName);
            newUser.setAvatarUrl(avatarUrl);
            newUser.setRole(1); // Mặc định role là 1 (Người bán)
            newUser.setStatus(1); // Trạng thái hoạt động
            return userRepository.save(newUser);
        }
    }

    // 2. Lấy thông tin User theo ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
    }

    // 3. Switch Mode: Đổi vai trò (Người bán <-> Tài xế)
    @Transactional
    public User switchRole(Long id, Integer newRole) {
        if (newRole != 1 && newRole != 2) {
            throw new IllegalArgumentException("Role không hợp lệ. Chỉ chấp nhận 1 (Người bán) hoặc 2 (Tài xế).");
        }
        User user = getUserById(id);
        user.setRole(newRole);
        return userRepository.save(user);
    }
}
