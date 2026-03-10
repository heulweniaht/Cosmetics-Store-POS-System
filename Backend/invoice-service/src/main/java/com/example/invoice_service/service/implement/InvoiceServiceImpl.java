package com.example.invoice_service.service.implement;

import com.example.invoice_service.dto.response.OrderItemResponse;
import com.example.invoice_service.dto.response.OrderResponse;
import com.example.invoice_service.dto.response.ResultDTO;
import com.example.invoice_service.entity.Invoice;
import com.example.invoice_service.entity.InvoiceDetail;
import com.example.invoice_service.repository.InvoiceRepository;
import com.example.invoice_service.service.InvoiceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    public ResultDTO createInvoice(Map<String, Object> payload) {
        try {
            Integer orderId = (Integer) payload.get("orderId");
            String invoiceType = (String) payload.get("invoiceType");

            // Kiểm tra trùng lặp
            if (invoiceRepository.existsByOrderIdAndInvoiceType(orderId, invoiceType)) {
                return new ResultDTO("warning", "Hóa đơn đã tồn tại cho trạng thái này", false);
            }

            Invoice invoice = new Invoice();
            invoice.setOrderId(orderId);
            // Tạo mã hóa đơn: Ví dụ INV-DH123-COMPLETED
            invoice.setCode("INV-" + payload.get("code") + "-" + invoiceType);
            invoice.setInvoiceType(invoiceType);
            invoice.setCustomerName((String) payload.get("customerName"));
            invoice.setPaymentMethod((String) payload.get("paymentMethod"));

            // Xử lý an toàn cho số tiền
            Object totalAmountObj = payload.get("totalAmount");
            if (totalAmountObj != null) {
                invoice.setTotalAmount(new BigDecimal(totalAmountObj.toString()));
            } else {
                invoice.setTotalAmount(BigDecimal.ZERO);
            }

            // Xử lý danh sách sản phẩm chi tiết
            List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");
            List<InvoiceDetail> details = new ArrayList<>();

            if (items != null) {
                for (Map<String, Object> item : items) {
                    InvoiceDetail detail = new InvoiceDetail();
                    detail.setProductId((String) item.get("productId"));
                    detail.setProductName((String) item.get("productName"));
                    detail.setQuantity((Integer) item.get("quantity"));

                    Object unitPriceObj = item.get("unitPrice");
                    BigDecimal unitPrice = (unitPriceObj != null) ? new BigDecimal(unitPriceObj.toString()) : BigDecimal.ZERO;
                    detail.setUnitPrice(unitPrice);

                    detail.setSubtotal(unitPrice.multiply(BigDecimal.valueOf(detail.getQuantity())));
                    detail.setInvoice(invoice);
                    details.add(detail);
                }
            }
            invoice.setDetails(details);

            invoiceRepository.save(invoice);

            return new ResultDTO("success", "Tạo hóa đơn thành công", true, invoice);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResultDTO("error", "Lỗi khi tạo hóa đơn: " + e.getMessage(), false);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResultDTO findOne(Integer id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        OrderResponse response = toOrderResponse(invoice);
        return new ResultDTO("success", "Lấy hóa đơn thành công", true, response, 1);
    }

    @Override
    @Transactional(readOnly = true)
    public ResultDTO findAllForAdmin() {
        List<Invoice> invoices = invoiceRepository.findAll();
        List<OrderResponse> responses = invoices.stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
        return new ResultDTO("success", "Lấy danh sách hóa đơn (Admin)", true, responses);
    }

    @Override
    @Transactional(readOnly = true)
    public ResultDTO findAllForUser() {

        List<Invoice> invoices = invoiceRepository.findAll();
        List<OrderResponse> responses = invoices.stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
        return new ResultDTO("success", "Lấy lịch sử hóa đơn (User)", true, responses);
    }


    private OrderResponse toOrderResponse(Invoice invoice) {
        OrderResponse dto = new OrderResponse();
        dto.setOrderId(invoice.getId()); 
        dto.setCode(invoice.getCode());
        dto.setCustomerName(invoice.getCustomerName());
        dto.setTotal(invoice.getTotalAmount() != null ? invoice.getTotalAmount().doubleValue() : 0.0);
        dto.setStatus(invoice.getInvoiceType());
        dto.setPaymentMethod(invoice.getPaymentMethod());

        if (invoice.getCreatedDate() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            dto.setCreatedAt(invoice.getCreatedDate().atZone(ZoneId.systemDefault()).format(formatter));
        }

        if (invoice.getDetails() != null) {
            List<OrderItemResponse> items = invoice.getDetails().stream().map(detail -> {
                OrderItemResponse itemDTO = new OrderItemResponse();
                itemDTO.setProductId(detail.getProductId());
                itemDTO.setProductName(detail.getProductName());
                itemDTO.setPrice(detail.getUnitPrice() != null ? detail.getUnitPrice().doubleValue() : 0.0);
                itemDTO.setQuantity(detail.getQuantity());
                itemDTO.setSubtotal(detail.getSubtotal() != null ? detail.getSubtotal().doubleValue() : 0.0);
                return itemDTO;
            }).collect(Collectors.toList());
            dto.setItems(items);
        } else {
            dto.setItems(Collections.emptyList());
        }

        return dto;
    }
}