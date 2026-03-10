package com.example.cart_service.repository;

import com.example.cart_service.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface OrderDetailReposotory extends JpaRepository<OrderDetail, Integer> {

    @Query ("SELECT COALESCE(SUM(od.quantityProduct), 0) FROM OrderDetail od")
    long getTotalQuantityProduct();
}
