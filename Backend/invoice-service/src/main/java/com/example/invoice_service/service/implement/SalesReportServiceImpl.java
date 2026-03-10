package com.example.invoice_service.service.implement;

import com.example.invoice_service.dto.request.SalesReportRequest;
import com.example.invoice_service.dto.response.ResultDTO;
import com.example.invoice_service.dto.response.SaleReportResponse;
import com.example.invoice_service.repository.InvoiceRepository;
import com.example.invoice_service.service.SalesReportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
@Transactional
public class SalesReportServiceImpl implements SalesReportService {

    private final InvoiceRepository invoiceRepository;

    public SalesReportServiceImpl(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ResultDTO getAllReport(SalesReportRequest request) {
        BigDecimal totalRevenue;

        // Xử lý lọc theo ngày
        if (request != null && request.getFromDate() != null && !request.getFromDate().isEmpty()) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDateTime fromDate = LocalDate.parse(request.getFromDate(), formatter).atStartOfDay();
            LocalDateTime toDate = LocalDate.parse(request.getToDate(), formatter).atTime(LocalTime.MAX);

            totalRevenue = invoiceRepository.getTotalRevenueBetween(fromDate, toDate);
        } else {
            totalRevenue = invoiceRepository.getTotalRevenue();
        }

        Long totalOrders = invoiceRepository.countByInvoiceType("COMPLETED");
        Long totalQuantityProduct = invoiceRepository.getTotalQuantitySold();
        Long totalOrdersReturned = invoiceRepository.countReturnedOrders();

        // Tính hiển thị (Triệu đồng)
        BigDecimal totalRevenueDisplay = BigDecimal.ZERO;
        if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
            totalRevenueDisplay = totalRevenue.divide(BigDecimal.valueOf(1_000_000), 2, RoundingMode.HALF_UP);
        }

        SaleReportResponse response = new SaleReportResponse(
                totalRevenue,
                totalOrders,
                totalQuantityProduct,
                totalOrdersReturned
        );
        response.setTotalRevenueDisplay(totalRevenueDisplay.toPlainString() + " triệu");

        return new ResultDTO("success", "Lấy báo cáo thành công", true, response);
    }

    @Override
    public ResultDTO getDailySalesReport(SalesReportRequest request) {
        // 1. Xử lý ngày tháng từ request (Giống hàm getAllReport)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDateTime fromDate;
        LocalDateTime toDate;

        if (request != null && request.getFromDate() != null) {
            fromDate = LocalDate.parse(request.getFromDate(), formatter).atStartOfDay();
            toDate = LocalDate.parse(request.getToDate(), formatter).atTime(LocalTime.MAX);
        } else {
            fromDate = LocalDate.now().atStartOfDay();
            toDate = LocalDate.now().atTime(LocalTime.MAX);
        }

        // 2. Gọi Repository để tính tổng tiền
        BigDecimal totalRevenue = invoiceRepository.getTotalRevenueBetween(fromDate, toDate);

        // Xử lý null nếu không có đơn nào
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        // 3. Trả về đúng format mà Frontend cần
        return new ResultDTO("success", "Lấy báo cáo ngày thành công", true, totalRevenue);
    }

    @Override
    public ResultDTO getMonthlySalesReport(SalesReportRequest request) {
        // Logic tương tự cho tháng
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDateTime fromDate;
        LocalDateTime toDate;

        if (request != null && request.getFromDate() != null) {
            fromDate = LocalDate.parse(request.getFromDate(), formatter).atStartOfDay();
            toDate = LocalDate.parse(request.getToDate(), formatter).atTime(LocalTime.MAX);
        } else {
            fromDate = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            toDate = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()).atTime(LocalTime.MAX);
        }

        BigDecimal totalRevenue = invoiceRepository.getTotalRevenueBetween(fromDate, toDate);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        return new ResultDTO("success", "Lấy báo cáo tháng thành công", true, totalRevenue);
    }
}