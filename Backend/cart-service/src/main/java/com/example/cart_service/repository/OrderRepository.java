package com.example.cart_service.repository;

import com.example.cart_service.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    @Query("select coalesce(sum(o.finalPrice), 0) from Order o Where o.status = 'COMPLETED' AND o.createdDate BETWEEN :fromDate AND :toDate")
    BigDecimal getTotalRevenue (@Param("fromDate") Instant fromDate, @Param("toDate") Instant toDate);

    @Query("select count(o) from Order o")
    long count();

    @Query("SELECT COALESCE(SUM(o.finalPrice), 0) from Order o ")
    BigDecimal getTotalRevenue ();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'RETURNED'")
    Long countReturnedOrders();
}
