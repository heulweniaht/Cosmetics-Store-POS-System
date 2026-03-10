package com.example.invoice_service.service;

import com.example.invoice_service.dto.request.SalesReportRequest;
import com.example.invoice_service.dto.response.ResultDTO;

public interface SalesReportService {

    ResultDTO getAllReport (SalesReportRequest salesReportRequest);

    ResultDTO getDailySalesReport(SalesReportRequest salesReportRequest);

    ResultDTO getMonthlySalesReport(SalesReportRequest salesReportRequest);
}
