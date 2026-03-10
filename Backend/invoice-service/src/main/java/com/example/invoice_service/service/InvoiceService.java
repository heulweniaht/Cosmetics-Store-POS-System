package com.example.invoice_service.service;

import com.example.invoice_service.dto.response.ResultDTO;
import java.util.Map;

public interface InvoiceService {
    ResultDTO findOne(Integer id);
    ResultDTO findAllForAdmin();
    ResultDTO findAllForUser();

    // Phương thức mới để tạo hóa đơn
    ResultDTO createInvoice(Map<String, Object> payload);
}