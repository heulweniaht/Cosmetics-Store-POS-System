package com.example.invoice_service.repository;

import com.example.invoice_service.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    // Kiểm tra tồn tại
    boolean existsByOrderIdAndInvoiceType(Integer orderId, String invoiceType);

    // 1. Tổng doanh thu (Chỉ tính các hóa đơn đã hoàn thành/thanh toán)
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.invoiceType = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    // 2. Tổng doanh thu theo khoảng thời gian
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i " +
            "WHERE i.invoiceType = 'COMPLETED' AND i.createdDate BETWEEN :fromDate AND :toDate")
    BigDecimal getTotalRevenueBetween(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    // 3. Đếm tổng số đơn (dựa trên số hóa đơn đã xuất)
    long countByInvoiceType(String invoiceType);

    // 4. Đếm số đơn trả hàng
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.invoiceType = 'RETURNED'")
    long countReturnedOrders();

    // 5. Tổng số lượng sản phẩm đã bán (từ bảng chi tiết)
    @Query("SELECT COALESCE(SUM(d.quantity), 0) FROM InvoiceDetail d JOIN d.invoice i WHERE i.invoiceType = 'COMPLETED'")
    long getTotalQuantitySold();
}