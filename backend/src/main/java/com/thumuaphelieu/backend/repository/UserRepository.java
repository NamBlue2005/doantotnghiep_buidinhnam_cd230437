package com.thumuaphelieu.backend.repository;

import com.thumuaphelieu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);

        Optional<User> findByZaloId(String zaloId); 
}