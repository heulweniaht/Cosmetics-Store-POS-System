package com.example.invoice_service.controller;

import com.example.invoice_service.dto.request.SalesReportRequest;
import com.example.invoice_service.dto.response.ResultDTO;
import com.example.invoice_service.service.SalesReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin("http://localhost:5173")
@RestController
@RequestMapping("/reports")
public class SaleReportController {

    private static final Logger LOG = LoggerFactory.getLogger(SaleReportController.class);
    private final SalesReportService salesReportService;

    public SaleReportController(SalesReportService salesReportService) {
        this.salesReportService = salesReportService;
    }

    @GetMapping
    public ResponseEntity<ResultDTO> getAllReport(
            @RequestParam(required = false) String fromDate, 
            @RequestParam(required = false) String toDate) { 

        SalesReportRequest salesReportRequest = new SalesReportRequest();
        salesReportRequest.setFromDate(fromDate); 
        salesReportRequest.setToDate(toDate);   

        ResultDTO resultDTO = salesReportService.getAllReport(salesReportRequest);
        return ResponseEntity.ok(resultDTO);
    }

    @GetMapping("/daily")
    public ResponseEntity<ResultDTO> getDailySalesReport(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        LOG.info("REST request to get daily sales report from {} to {}", fromDate, toDate);
        SalesReportRequest request = new SalesReportRequest();
        request.setFromDate(fromDate);
        request.setToDate(toDate);

        ResultDTO resultDTO = salesReportService.getDailySalesReport(request);
        return ResponseEntity.ok(resultDTO);
    }

    @GetMapping("/monthly")
    public ResponseEntity<ResultDTO> getMonthlySalesReport(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        LOG.info("REST request to get monthly sales report from {} to {}", fromDate, toDate);
        SalesReportRequest request = new SalesReportRequest();
        request.setFromDate(fromDate);
        request.setToDate(toDate);

        ResultDTO resultDTO = salesReportService.getMonthlySalesReport(request);
        return ResponseEntity.ok(resultDTO);
    }
}
