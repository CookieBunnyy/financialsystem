package com.cosc75.financialsystem.repository;

import com.cosc75.financialsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
