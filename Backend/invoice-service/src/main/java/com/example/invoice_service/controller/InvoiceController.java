package com.example.invoice_service.controller;

import com.example.invoice_service.dto.response.ResultDTO;
import com.example.invoice_service.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@CrossOrigin("http://localhost:5173")
@RestController
@RequestMapping("/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    // API MỚI: Nhận yêu cầu tạo hóa đơn từ Cart Service
    @PostMapping("/create")
    public ResponseEntity<ResultDTO> createInvoice(@RequestBody Map<String, Object> payload) {
        ResultDTO result = invoiceService.createInvoice(payload);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/admin/all")
    public ResponseEntity<ResultDTO> getAllInvoicesForAdmin() {
        ResultDTO resultDTO = invoiceService.findAllForAdmin();
        return ResponseEntity.ok(resultDTO);
    }

    @GetMapping("/my-history")
    public ResponseEntity<ResultDTO> getMyOrderHistory() {
        ResultDTO resultDTO = invoiceService.findAllForUser();
        return ResponseEntity.ok(resultDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultDTO> getOne(@PathVariable Integer id) {
        ResultDTO resultDTO = invoiceService.findOne(id);
        return ResponseEntity.ok(resultDTO);
    }
}